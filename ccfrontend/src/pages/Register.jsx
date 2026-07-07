import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase, Eye, EyeOff, AlertCircle, CheckCircle, User, Mail, Lock, Building2, HelpCircle } from 'lucide-react';

const SECURITY_QUESTIONS = [
  "What is your mother's maiden name?",
  "What was the name of your first pet?",
  "In what city were you born?",
  "What is the name of your best friend from childhood?",
  "What is your favorite movie?",
  "What was the first car you owned?",
  "What is your favorite sport?",
  "What is the name of your first school?",
];

function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (password.length >= 12) score++;
  const levels = [
    { label: '', color: '' },
    { label: 'Weak', color: '#ef4444' },
    { label: 'Fair', color: '#f97316' },
    { label: 'Good', color: '#f59e0b' },
    { label: 'Strong', color: '#22c55e' },
    { label: 'Very Strong', color: '#16a34a' },
  ];
  return { score, ...levels[score] };
}

export default function Register() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    role: 'job_seeker',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    securityQuestion: SECURITY_QUESTIONS[0],
    securityAnswer: '',
    companyName: '',
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const strength = getPasswordStrength(form.password);

  function validate() {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'Full name is required';
    else if (form.fullName.trim().length < 2) e.fullName = 'Name must be at least 2 characters';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
    else if (!/[A-Z]/.test(form.password)) e.password = 'Include at least one uppercase letter';
    else if (!/[0-9]/.test(form.password)) e.password = 'Include at least one number';
    if (!form.confirmPassword) e.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (!form.securityQuestion) e.securityQuestion = 'Please select a security question';
    if (!form.securityAnswer.trim()) e.securityAnswer = 'Security answer is required';
    else if (form.securityAnswer.trim().length < 2) e.securityAnswer = 'Answer must be at least 2 characters';
    if (form.role === 'employer' && !form.companyName.trim()) {
      e.companyName = 'Company name is required for employers';
    }
    return e;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((err) => ({ ...err, [name]: '' }));
    setApiError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validation = validate();
    if (Object.keys(validation).length) { setErrors(validation); return; }
    setLoading(true);
    try {
      await signUp(
        form.email,
        form.password,
        form.role,
        form.fullName.trim(),
        null,
        null,
        form.role === 'employer' ? form.companyName.trim() : null,
        form.securityQuestion,
        form.securityAnswer.trim()
      );
      navigate('/login', { state: { message: 'Registration successful! Please sign in.' } });
    } catch (err) {
      if (err.status === 409 || err.message?.includes('already exists')) {
        setApiError('This email is already registered. Please sign in instead.');
      } else {
        setApiError(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-logo">
          <Briefcase size={28} /> Career<span>Crafter</span>
        </div>
        <h2>Create your account</h2>
        <p>Find jobs, post openings, and manage your applications from one place.</p>
        {[
          'Build your profile quickly',
          'Browse available jobs',
          'Track applications in one place',
          'Manage postings and candidates',
        ].map((f) => (
          <div key={f} className="auth-feature">
            <div className="auth-feature-icon"><CheckCircle size={14} /></div>
            {f}
          </div>
        ))}
      </div>

      <div className="auth-right">
        <div style={{ maxWidth: 480, width: '100%' }}>
          <h1 className="auth-form-title">Create your account</h1>
          <p className="auth-form-subtitle">Already have an account? <Link to="/login" style={{ color: 'var(--color-primary-600)', fontWeight: 500 }}>Sign in here</Link></p>

          {apiError && (
            <div className="alert alert-error" style={{ marginBottom: '20px' }}>
              <AlertCircle size={16} /> {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Role Selector */}
            <div style={{ marginBottom: '24px' }}>
              <label className="form-label" style={{ marginBottom: '10px', display: 'block' }}>I am a... <span className="required">*</span></label>
              <div className="role-selector">
                <div
                  className={`role-option ${form.role === 'job_seeker' ? 'selected' : ''}`}
                  onClick={() => setForm((f) => ({ ...f, role: 'job_seeker' }))}
                >
                  <div className="role-option-icon" style={{ background: 'var(--color-primary-50)' }}>
                    <User size={20} color="var(--color-primary-600)" />
                  </div>
                  <div className="role-option-label">Job Seeker</div>
                  <div className="role-option-desc">Looking for opportunities</div>
                </div>
                <div
                  className={`role-option ${form.role === 'employer' ? 'selected' : ''}`}
                  onClick={() => setForm((f) => ({ ...f, role: 'employer' }))}
                >
                  <div className="role-option-icon" style={{ background: 'var(--color-success-50)' }}>
                    <Building2 size={20} color="var(--color-success-600)" />
                  </div>
                  <div className="role-option-label">Employer</div>
                  <div className="role-option-desc">Hiring for my company</div>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Full Name <span className="required">*</span></label>
              <input
                type="text"
                name="fullName"
                className={`form-input ${errors.fullName ? 'error' : ''}`}
                placeholder="John Smith"
                value={form.fullName}
                onChange={handleChange}
                autoComplete="name"
              />
              {errors.fullName && <span className="form-error"><AlertCircle size={12} /> {errors.fullName}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Email Address <span className="required">*</span></label>
              <input
                type="email"
                name="email"
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
              {errors.email && <span className="form-error"><AlertCircle size={12} /> {errors.email}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Password <span className="required">*</span></label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  style={{ paddingRight: '40px' }}
                />
                <button type="button" onClick={() => setShowPassword((s) => !s)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-neutral-400)' }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {form.password && (
                <div className="password-strength">
                  <div className="strength-bar">
                    <div className="strength-bar-fill" style={{ width: `${(strength.score / 5) * 100}%`, background: strength.color }} />
                  </div>
                  <span className="strength-text" style={{ color: strength.color }}>{strength.label}</span>
                </div>
              )}
              {errors.password && <span className="form-error"><AlertCircle size={12} /> {errors.password}</span>}
              <span className="form-hint">Min. 8 chars, 1 uppercase, 1 number</span>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password <span className="required">*</span></label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  name="confirmPassword"
                  className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                  placeholder="Re-enter your password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  style={{ paddingRight: '40px' }}
                />
                <button type="button" onClick={() => setShowConfirm((s) => !s)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-neutral-400)' }}>
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {form.confirmPassword && form.password === form.confirmPassword && (
                <span style={{ fontSize: '12px', color: 'var(--color-success-600)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle size={12} /> Passwords match
                </span>
              )}
              {errors.confirmPassword && <span className="form-error"><AlertCircle size={12} /> {errors.confirmPassword}</span>}
            </div>

            <div className="form-group">
              <label className="form-label"><HelpCircle size={14} style={{ display: 'inline', marginRight: 4 }} /> Security Question <span className="required">*</span></label>
              <select
                name="securityQuestion"
                value={form.securityQuestion}
                onChange={handleChange}
                className={`form-input ${errors.securityQuestion ? 'error' : ''}`}
              >
                {SECURITY_QUESTIONS.map((q) => (
                  <option key={q} value={q}>{q}</option>
                ))}
              </select>
              {errors.securityQuestion && <span className="form-error"><AlertCircle size={12} /> {errors.securityQuestion}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Security Answer <span className="required">*</span></label>
              <input
                type="text"
                name="securityAnswer"
                className={`form-input ${errors.securityAnswer ? 'error' : ''}`}
                placeholder="Your answer"
                value={form.securityAnswer}
                onChange={handleChange}
                autoComplete="off"
              />
              <span className="form-hint">You'll need this to reset your password</span>
              {errors.securityAnswer && <span className="form-error"><AlertCircle size={12} /> {errors.securityAnswer}</span>}
            </div>

            {form.role === 'employer' && (
              <div className="form-group">
                <label className="form-label"><Building2 size={14} style={{ display: 'inline', marginRight: 4 }} /> Company Name <span className="required">*</span></label>
                <input
                  type="text"
                  name="companyName"
                  className={`form-input ${errors.companyName ? 'error' : ''}`}
                  placeholder="Your Company Inc."
                  value={form.companyName}
                  onChange={handleChange}
                />
                {errors.companyName && <span className="form-error"><AlertCircle size={12} /> {errors.companyName}</span>}
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p style={{ fontSize: '12px', color: 'var(--color-neutral-400)', textAlign: 'center', marginTop: '16px', lineHeight: 1.5 }}>
            By creating an account, you agree to our <a href="#" style={{ color: 'var(--color-primary-600)' }}>Terms of Service</a> and <a href="#" style={{ color: 'var(--color-primary-600)' }}>Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
