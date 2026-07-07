import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { Briefcase, Mail, AlertCircle, CheckCircle, ArrowLeft, ShieldQuestion } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [step, setStep] = useState('email');

  function validate() {
    const e = {};
    if (!email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email address';
    return e;
  }

  function handleEmailChange(e) {
    setEmail(e.target.value);
    setErrors((err) => ({ ...err, email: '' }));
    setApiError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validation = validate();
    if (Object.keys(validation).length) { setErrors(validation); return; }
    setLoading(true);
    try {
      const response = await api.users.getSecurityQuestion({ email: email.trim() });
      setSecurityQuestion(response.securityQuestion);
      setStep('question');
      setSecurityAnswer('');
      setApiError('');
    } catch (err) {
      setApiError(err.message || 'Failed to process request. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleAnswerSubmit(e) {
    e.preventDefault();
    if (!securityAnswer.trim()) {
      setApiError('Please enter your security answer');
      return;
    }
    setLoading(true);
    try {
      await api.users.verifySecurityAnswer({ email: email.trim(), securityAnswer: securityAnswer.trim() });
      setStep('verified');
      setApiError('');
    } catch (err) {
      setApiError(err.message || 'Incorrect answer. Access denied.');
    } finally {
      setLoading(false);
    }
  }

  if (step === 'question') {
    return (
      <div className="auth-page">
        <div className="auth-left">
          <div className="auth-left-logo">
            <Briefcase size={28} /> Career<span>Crafter</span>
          </div>
          <h2>Verify your identity</h2>
          <p>Answer the security question linked to this account to continue.</p>
          {[
            'This step confirms your identity',
            'Use the exact answer from registration',
            'Incorrect answers will prevent the reset',
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
            <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--color-primary-600)', marginBottom: '24px', textDecoration: 'none', fontSize: '14px' }}>
              <ArrowLeft size={16} /> Back to Login
            </Link>

            <h1 className="auth-form-title">Answer Security Question</h1>
            <p className="auth-form-subtitle">For <strong>{email}</strong></p>

            {apiError && (
              <div className="alert alert-error" style={{ marginBottom: '20px' }}>
                <AlertCircle size={16} /> {apiError}
              </div>
            )}

            <div style={{ background: 'var(--color-info-50)', border: '1px solid var(--color-info-200)', borderRadius: '8px', padding: '16px', marginBottom: '24px', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <ShieldQuestion size={16} color="var(--color-info-600)" />
                <strong>Security Question</strong>
              </div>
              <div style={{ color: 'var(--color-neutral-700)' }}>{securityQuestion}</div>
            </div>

            <form onSubmit={handleAnswerSubmit} noValidate>
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Your Answer</label>
                <input
                  type="text"
                  value={securityAnswer}
                  onChange={(e) => { setSecurityAnswer(e.target.value); setApiError(''); }}
                  placeholder="Type your answer"
                  style={{ width: '100%', border: '1px solid var(--color-neutral-200)', borderRadius: '8px', padding: '12px' }}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Checking...' : 'Verify Answer'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'verified') {
    return (
      <div className="auth-page">
        <div className="auth-left">
          <div className="auth-left-logo">
            <Briefcase size={28} /> Career<span>Crafter</span>
          </div>
          <h2>Password Reset Ready</h2>
          <p>Your security answer is correct. You can now continue to set a new password.</p>
          {[
            'Security question verified successfully',
            'You may now reset your password',
            'Use your new password to sign in',
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
            <h1 className="auth-form-title">Set a New Password</h1>
            <p className="auth-form-subtitle">Continue to the reset form</p>
            <Link to="/reset-password" state={{ email }} className="btn btn-primary" style={{ width: '100%', display: 'inline-block', textAlign: 'center', marginTop: '16px' }}>
              Continue to Password Reset
            </Link>
            <Link to="/login" className="btn btn-ghost" style={{ width: '100%', display: 'inline-block', textAlign: 'center', marginTop: '12px' }}>
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-logo">
          <Briefcase size={28} /> Career<span>Crafter</span>
        </div>
        <h2>Forgot your password?</h2>
        <p>Enter your email to retrieve the security question you set during registration.</p>
        {[
          'Enter your registered email',
          'Answer your security question',
          'Reset your password',
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
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--color-primary-600)', marginBottom: '24px', textDecoration: 'none', fontSize: '14px' }}>
            <ArrowLeft size={16} /> Back to Login
          </Link>

          <h1 className="auth-form-title">Reset Password</h1>
          <p className="auth-form-subtitle">Enter your email to continue</p>

          {apiError && (
            <div className="alert alert-error" style={{ marginBottom: '20px' }}>
              <AlertCircle size={16} /> {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">Email Address</label>
              <div style={{ display: 'flex', alignItems: 'center', background: 'white', borderRadius: '8px', border: errors.email ? '2px solid var(--color-error-500)' : '1px solid var(--color-neutral-200)', paddingLeft: '12px' }}>
                <Mail size={16} color="var(--color-neutral-400)" />
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="your.email@example.com"
                  style={{ flex: 1, border: 'none', padding: '12px', fontSize: '14px', outline: 'none', background: 'transparent' }}
                />
              </div>
              {errors.email && <span style={{ color: 'var(--color-error-500)', fontSize: '13px', marginTop: '4px', display: 'block' }}>{errors.email}</span>}
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Checking...' : 'Continue'}
            </button>

            <p style={{ textAlign: 'center', color: 'var(--color-neutral-500)', fontSize: '13px', marginTop: '20px' }}>
              Remember your password? <Link to="/login" style={{ color: 'var(--color-primary-600)', textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
