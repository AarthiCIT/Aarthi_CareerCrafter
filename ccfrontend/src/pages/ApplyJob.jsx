import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, CheckCircle, AlertCircle, FileText, Send } from 'lucide-react';

export default function ApplyJob() {
  const { id } = useParams();
  const { user, profile } = useAuth();

  const [job, setJob] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [form, setForm] = useState({ coverNote: '', resumeId: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function fetchData() {
    setLoading(true);
    try {
      const [jobData, resumeList] = await Promise.all([
        api.jobListings.getById(id),
        user ? api.resumes.getByJobSeeker(user.id).catch(() => []) : Promise.resolve([]),
      ]);
      setJob(jobData);
      setResumes(resumeList);
      if (resumeList.length > 0) {
        setForm((f) => ({ ...f, resumeId: String(resumeList[0].id) }));
      }
    } finally {
      setLoading(false);
    }
  }

  function validate() {
    const e = {};
    if (!form.coverNote.trim()) e.coverNote = 'Cover note is required';
    else if (form.coverNote.trim().length < 50) e.coverNote = 'Please write at least 50 characters';
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validation = validate();
    if (Object.keys(validation).length) { setErrors(validation); return; }
    setSubmitting(true);
    setApiError('');
    try {
      await api.applications.apply({
        jobListingId: Number(id),
        jobSeekerId: user.id,
        resumeId: form.resumeId ? Number(form.resumeId) : null,
        coverNote: form.coverNote.trim(),
      });
      setSuccess(true);
    } catch (err) {
      setApiError(err.message || 'Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="loader-overlay"><div className="spinner" /></div>;

  if (success) {
    return (
      <div className="form-page">
        <div className="container" style={{ maxWidth: 560, textAlign: 'center', padding: '80px 24px' }}>
          <div style={{ width: 72, height: 72, background: 'var(--color-success-50)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <CheckCircle size={36} color="var(--color-success-600)" />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px', color: 'var(--color-neutral-900)' }}>Application Submitted!</h2>
          <p style={{ color: 'var(--color-neutral-500)', lineHeight: 1.7, marginBottom: '32px' }}>
            Your application for <strong>{job?.jobTitle}</strong> has been submitted successfully. The employer will review your application and get back to you soon.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link to="/my-applications" className="btn btn-primary">View My Applications</Link>
            <Link to="/jobs" className="btn btn-secondary">Browse More Jobs</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="form-page">
      <div className="container" style={{ maxWidth: 720 }}>
        <Link to={`/jobs/${id}`} className="btn btn-ghost btn-sm" style={{ marginBottom: '24px', display: 'inline-flex' }}>
          <ArrowLeft size={16} /> Back to Job
        </Link>

        <div className="form-page-header">
          <h1 className="form-page-title">Apply for {job?.jobTitle}</h1>
          <p className="form-page-subtitle">{job?.location} &bull; {job?.employmentType}</p>
        </div>

        <div className="alert alert-info" style={{ marginBottom: '24px' }}>
          <FileText size={16} />
          Applying as <strong>{profile?.full_name}</strong> ({user?.email})
        </div>

        {apiError && (
          <div className="alert alert-error" style={{ marginBottom: '20px' }}>
            <AlertCircle size={16} /> {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-card">
          <div className="form-group">
            <label className="form-label">
              Cover Note <span className="required">*</span>
            </label>
            <textarea
              className={`form-textarea ${errors.coverNote ? 'error' : ''}`}
              placeholder={"Dear Hiring Manager,\n\nI am excited to apply for this position because..."}
              value={form.coverNote}
              onChange={(e) => { setForm((f) => ({ ...f, coverNote: e.target.value })); setErrors((err) => ({ ...err, coverNote: '' })); }}
              style={{ minHeight: 200 }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              {errors.coverNote
                ? <span className="form-error"><AlertCircle size={12} /> {errors.coverNote}</span>
                : <span className="form-hint">Personalize your note to stand out from other applicants</span>
              }
              <span className="form-hint">{form.coverNote.length} chars</span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Resume</label>
            {resumes.length > 0 ? (
              <select
                className="form-select"
                value={form.resumeId}
                onChange={(e) => setForm((f) => ({ ...f, resumeId: e.target.value }))}
              >
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>{r.fileName}</option>
                ))}
              </select>
            ) : (
              <span className="form-hint">
                You have no saved resume yet. <Link to="/profile" style={{ color: 'var(--color-primary-600)' }}>Add one to your profile</Link> to attach it (optional).
              </span>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
              <Send size={16} />
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
            <Link to={`/jobs/${id}`} className="btn btn-ghost">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
