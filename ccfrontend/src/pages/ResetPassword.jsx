import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { api } from '../lib/api';
import { Briefcase, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: location.state?.email || '', newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState(false);

  function validate() {
    const e = {};
    if (!form.email.trim()) e.email = 'Email is required';
    if (!form.newPassword) e.newPassword = 'Password is required';
    else if (form.newPassword.length < 8) e.newPassword = 'Password must be at least 8 characters';
    else if (!/[A-Z]/.test(form.newPassword)) e.newPassword = 'Include at least one uppercase letter';
    else if (!/[0-9]/.test(form.newPassword)) e.newPassword = 'Include at least one number';
    if (!form.confirmPassword) e.confirmPassword = 'Please confirm your password';
    else if (form.newPassword !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
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
      await api.users.resetPassword({
        email: form.email.trim(),
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setApiError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-left">
          <div className="auth-left-logo">
            <Briefcase size={28} /> Career<span>Crafter</span>
          </div>
          <h2>Password reset complete</h2>
          <p>Your password has been updated. You can now sign in with the new password.</p>
          {[
            'Password updated successfully',
            'Use the new password to sign in',
            'Return to the login page when ready',
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
          <div style={{ maxWidth: 440, width: '100%', textAlign: 'center' }}>
            <div style={{ width: 72, height: 72, background: 'var(--color-success-50)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <CheckCircle size={36} color="var(--color-success-600)" />
            </div>
            <h1 className="auth-form-title">Password Reset Successful!</h1>
            <p style={{ color: 'var(--color-neutral-600)', marginBottom: '32px' }}>
              Your password has been updated. Redirecting to login...
            </p>
            <Link to="/login" className="btn btn-primary" style={{ display: 'inline-block' }}>
              Go to Login
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
        <h2>Set a new password</h2>
        <p>Enter a new password for your account and confirm it below.</p>
        {[
          'Create a strong, unique password',
          'Use uppercase, lowercase, numbers, and symbols',
          'Keep your password secure and private',
          'Never share your password with anyone',
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
          <h1 className="auth-form-title">Reset Password</h1>
          <p className="auth-form-subtitle">Enter your new password below</p>

          {apiError && (
            <div className="alert alert-error" style={{ marginBottom: '20px' }}>
              <AlertCircle size={16} /> {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">Email Address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="your.email@example.com"
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: errors.email ? '2px solid var(--color-error-500)' : '1px solid var(--color-neutral-200)' }}
              />
              {errors.email && <span style={{ color: 'var(--color-error-500)', fontSize: '13px', marginTop: '4px', display: 'block' }}>{errors.email}</span>}
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">New Password</label>
              <div style={{ display: 'flex', alignItems: 'center', background: 'white', borderRadius: '8px', border: errors.newPassword ? '2px solid var(--color-error-500)' : '1px solid var(--color-neutral-200)', paddingLeft: '12px' }}>
                <Lock size={16} color="var(--color-neutral-400)" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="newPassword"
                  value={form.newPassword}
                  onChange={handleChange}
                  placeholder="Enter new password"
                  style={{ flex: 1, border: 'none', padding: '12px', fontSize: '14px', outline: 'none', background: 'transparent' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', paddingRight: '12px' }}
                >
                  {showPassword ? <EyeOff size={16} color="var(--color-neutral-400)" /> : <Eye size={16} color="var(--color-neutral-400)" />}
                </button>
              </div>
              {errors.newPassword && <span style={{ color: 'var(--color-error-500)', fontSize: '13px', marginTop: '4px', display: 'block' }}>{errors.newPassword}</span>}
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">Confirm Password</label>
              <div style={{ display: 'flex', alignItems: 'center', background: 'white', borderRadius: '8px', border: errors.confirmPassword ? '2px solid var(--color-error-500)' : '1px solid var(--color-neutral-200)', paddingLeft: '12px' }}>
                <Lock size={16} color="var(--color-neutral-400)" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm new password"
                  style={{ flex: 1, border: 'none', padding: '12px', fontSize: '14px', outline: 'none', background: 'transparent' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', paddingRight: '12px' }}
                >
                  {showConfirm ? <EyeOff size={16} color="var(--color-neutral-400)" /> : <Eye size={16} color="var(--color-neutral-400)" />}
                </button>
              </div>
              {errors.confirmPassword && <span style={{ color: 'var(--color-error-500)', fontSize: '13px', marginTop: '4px', display: 'block' }}>{errors.confirmPassword}</span>}
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
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
