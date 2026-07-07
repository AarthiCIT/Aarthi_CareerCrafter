import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Send, CheckCircle, AlertCircle } from 'lucide-react';

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Remote', 'Internship'];

export default function PostJob() {
  const { user, profile } = useAuth();

  const [form, setForm] = useState({
    jobTitle: '',
    location: '',
    employmentType: 'Full-time',
    industry: '',
    salary: '',
    description: '',
    qualifications: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((err) => ({ ...err, [name]: '' }));
    setApiError('');
  }

  function validate() {
    const e = {};
    if (!form.jobTitle.trim()) e.jobTitle = 'Job title is required';
    if (!form.location.trim()) e.location = 'Location is required';
    if (!form.description.trim()) e.description = 'Job description is required';
    else if (form.description.trim().length < 50) e.description = 'Please provide a more detailed description (min. 50 characters)';
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validation = validate();
    if (Object.keys(validation).length) { setErrors(validation); return; }
    setLoading(true);
    try {
      await api.jobListings.create({
        jobTitle: form.jobTitle.trim(),
        description: form.description.trim(),
        qualifications: form.qualifications.trim(),
        location: form.location.trim(),
        industry: form.industry.trim(),
        employmentType: form.employmentType,
        salary: form.salary ? parseFloat(form.salary) : 0,
        active: true,
        employerId: user.id,
      });
      setSuccess(true);
    } catch (err) {
      setApiError(err.message || 'Failed to post job. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="form-page">
        <div className="container" style={{ maxWidth: 560, textAlign: 'center', padding: '80px 24px' }}>
          <div style={{ width: 72, height: 72, background: 'var(--color-success-50)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <CheckCircle size={36} color="var(--color-success-600)" />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>Job Posted Successfully!</h2>
          <p style={{ color: 'var(--color-neutral-500)', lineHeight: 1.7, marginBottom: '32px' }}>
            Your job listing for <strong>{form.jobTitle}</strong> is now live and visible to job seekers.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link to="/employer/manage-jobs" className="btn btn-primary">Manage My Jobs</Link>
            <button onClick={() => { setSuccess(false); setForm({ jobTitle: '', location: '', employmentType: 'Full-time', industry: '', salary: '', description: '', qualifications: '' }); }} className="btn btn-secondary">Post Another Job</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="form-page">
      <div className="container" style={{ maxWidth: 800 }}>
        <Link to="/employer/dashboard" className="btn btn-ghost btn-sm" style={{ marginBottom: '24px', display: 'inline-flex' }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        <div className="form-page-header">
          <h1 className="form-page-title">Post a New Job</h1>
          <p className="form-page-subtitle">Fill in the details below to create your job listing{profile?.company_name ? ` for ${profile.company_name}` : ''}</p>
        </div>

        {apiError && (
          <div className="alert alert-error" style={{ marginBottom: '20px' }}>
            <AlertCircle size={16} /> {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-card">
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-neutral-800)', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--color-neutral-100)' }}>
            Basic Information
          </h3>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Job Title <span className="required">*</span></label>
              <input name="jobTitle" className={`form-input ${errors.jobTitle ? 'error' : ''}`} value={form.jobTitle} onChange={handleChange} placeholder="e.g. Senior Frontend Developer" />
              {errors.jobTitle && <span className="form-error"><AlertCircle size={12} /> {errors.jobTitle}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Industry</label>
              <input name="industry" className="form-input" value={form.industry} onChange={handleChange} placeholder="e.g. Information Technology" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Location <span className="required">*</span></label>
              <input name="location" className={`form-input ${errors.location ? 'error' : ''}`} value={form.location} onChange={handleChange} placeholder="e.g. Bangalore, KA or Remote" />
              {errors.location && <span className="form-error"><AlertCircle size={12} /> {errors.location}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Job Type <span className="required">*</span></label>
              <select name="employmentType" className="form-select" value={form.employmentType} onChange={handleChange}>
                {JOB_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginTop: '8px', marginBottom: '24px', paddingTop: '20px', borderTop: '1px solid var(--color-neutral-100)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-neutral-800)', marginBottom: '20px' }}>
              Compensation (Optional)
            </h3>
            <div className="form-group">
              <label className="form-label">Annual Salary (₹)</label>
              <input name="salary" type="number" min="0" className="form-input" value={form.salary} onChange={handleChange} placeholder="e.g. 1200000 for ₹12L" />
            </div>
          </div>

          <div style={{ paddingTop: '20px', borderTop: '1px solid var(--color-neutral-100)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-neutral-800)', marginBottom: '20px' }}>
              Job Details
            </h3>

            <div className="form-group">
              <label className="form-label">Job Description <span className="required">*</span></label>
              <textarea
                name="description"
                className={`form-textarea ${errors.description ? 'error' : ''}`}
                value={form.description}
                onChange={handleChange}
                placeholder="Describe the role, responsibilities, team culture, and what makes this a great opportunity..."
                style={{ minHeight: 200 }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                {errors.description ? <span className="form-error"><AlertCircle size={12} /> {errors.description}</span> : <span />}
                <span className="form-hint">{form.description.length} chars</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Qualifications / Required Skills</label>
              <textarea
                name="qualifications"
                className="form-textarea"
                value={form.qualifications}
                onChange={handleChange}
                placeholder="React, TypeScript, Node.js, 5+ years experience..."
                style={{ minHeight: 120 }}
              />
              <span className="form-hint">Separate items with commas</span>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              <Send size={16} />
              {loading ? 'Publishing...' : 'Publish Job Listing'}
            </button>
            <Link to="/employer/dashboard" className="btn btn-ghost">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
