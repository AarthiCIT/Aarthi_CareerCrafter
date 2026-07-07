import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase, Eye, EyeOff, AlertCircle, CheckCircle, Lock, Mail } from 'lucide-react';

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState('');

  function validate() {
    const e = {};
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
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
      const { role } = await signIn(form.email, form.password);
      setSuccess('Login successful! Redirecting...');
      setTimeout(() => {
        navigate(role === 'employer' ? '/employer/dashboard' : '/dashboard');
      }, 800);
    } catch (err) {
      setApiError(err.status === 401 || err.status === 404
        ? 'Incorrect email or password. Please try again.'
        : err.message || 'Sign in failed. Please try again.');
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
        <h2>Welcome back</h2>
        <p>Sign in to see your dashboard, active applications, and saved jobs.</p>
        {[
          'Browse available roles',
          'Track application progress',
          'Manage your profile',
          'Return to your saved jobs',
        ].map((f) => (
          <div key={f} className="auth-feature">
            <div className="auth-feature-icon">
              <CheckCircle size={14} />
            </div>
            {f}
          </div>
        ))}
      </div>

      <div className="auth-right">
        <div style={{ maxWidth: 440, width: '100%' }}>
          <h1 className="auth-form-title">Sign in to your account</h1>
          <p className="auth-form-subtitle">Don't have an account? <Link to="/register" style={{ color: 'var(--color-primary-600)', fontWeight: 500 }}>Create one for free</Link></p>

          {apiError && (
            <div className="alert alert-error" style={{ marginBottom: '20px' }}>
              <AlertCircle size={16} /> {apiError}
            </div>
          )}
          {success && (
            <div className="alert alert-success" style={{ marginBottom: '20px' }}>
              <CheckCircle size={16} /> {success}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label">
                <Mail size={14} style={{ display: 'inline', marginRight: 4 }} /> Email Address <span className="required">*</span>
              </label>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">
                  <Lock size={14} style={{ display: 'inline', marginRight: 4 }} /> Password <span className="required">*</span>
                </label>
                <Link to="/forgot-password" style={{ fontSize: '13px', color: 'var(--color-primary-600)', textDecoration: 'none' }}>Forgot Password?</Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  style={{ paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-neutral-400)' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <span className="form-error"><AlertCircle size={12} /> {errors.password}</span>}
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="auth-divider">or</div>

          <p className="auth-footer-text">
            New to CareerCrafter? <Link to="/register">Create a free account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
