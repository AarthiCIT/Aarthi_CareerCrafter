import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, getEmployerLabel } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { MapPin, Briefcase, DollarSign, Building2, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

function formatSalary(salary) {
  if (!salary) return 'Not disclosed';
  if (salary >= 100000) {
    return `₹${(salary / 100000).toFixed(1)}L / year`;
  }
  return `₹${salary.toLocaleString('en-IN')} / year`;
}

export default function JobDetail() {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const [job, setJob] = useState(null);
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [alreadyApplied, setAlreadyApplied] = useState(false);

  useEffect(() => {
    fetchJob();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (user && job) checkApplication();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, job]);

  async function fetchJob() {
    setLoading(true);
    try {
      const data = await api.jobListings.getById(id);
      setJob(data);
      setCompany(await getEmployerLabel(data.employerId));
    } catch {
      setError('Job not found or has been removed.');
    } finally {
      setLoading(false);
    }
  }

  async function checkApplication() {
    try {
      const apps = await api.applications.getByJobSeeker(user.id);
      setAlreadyApplied(apps.some((a) => a.jobListingId === Number(id)));
    } catch {
      setAlreadyApplied(false);
    }
  }

  if (loading) return <div className="loader-overlay"><div className="spinner" /></div>;
  if (error) return (
    <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
      <AlertCircle size={48} color="var(--color-error-500)" style={{ margin: '0 auto 16px' }} />
      <p>{error}</p>
      <Link to="/jobs" className="btn btn-primary" style={{ marginTop: '16px' }}>Back to Jobs</Link>
    </div>
  );

  const salary = formatSalary(job.salary);
  const logo = (company || 'J')[0].toUpperCase();
  const skills = job.qualifications ? job.qualifications.split(',').map((s) => s.trim()).filter(Boolean) : [];

  return (
    <div className="job-detail-page">
      <div className="container">
        <Link to="/jobs" className="btn btn-ghost btn-sm" style={{ marginBottom: '24px', display: 'inline-flex' }}>
          <ArrowLeft size={16} /> Back to Jobs
        </Link>

        <div className="job-detail-header">
          <div className="job-detail-logo">{logo}</div>
          <h1 className="job-detail-title">{job.jobTitle}</h1>
          <p className="job-detail-company">
            <Building2 size={16} style={{ display: 'inline', marginRight: 4 }} />
            {company}
          </p>
          <div className="job-detail-meta">
            <span className="job-detail-meta-item"><MapPin size={15} /> {job.location}</span>
            <span className="job-detail-meta-item"><Briefcase size={15} /> {job.employmentType}</span>
            <span className="job-detail-meta-item"><DollarSign size={15} /> {salary}</span>
            <span className={`badge ${job.active ? 'badge-green' : 'badge-gray'}`}>
              {job.active ? 'Actively Hiring' : 'Position Closed'}
            </span>
          </div>
        </div>

        <div className="job-detail-layout">
          <div className="job-detail-content">
            <div className="job-detail-section">
              <h3>Job Description</h3>
              <p style={{ fontSize: '14px', lineHeight: 1.8, color: 'var(--color-neutral-600)', whiteSpace: 'pre-wrap' }}>
                {job.description}
              </p>
            </div>

            {skills.length > 0 && (
              <div className="job-detail-section">
                <h3>Required Skills / Qualifications</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {skills.map((s) => (
                    <span key={s} className="badge badge-blue" style={{ fontSize: '13px', padding: '5px 12px' }}>{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="job-detail-sidebar">
            <div className="job-detail-card" style={{ textAlign: 'center' }}>
              {!job.active ? (
                <div>
                  <span className="badge badge-gray" style={{ fontSize: '13px', padding: '6px 16px', marginBottom: '12px', display: 'inline-flex' }}>Position Closed</span>
                  <p style={{ fontSize: '13px', color: 'var(--color-neutral-500)' }}>This position is no longer accepting applications.</p>
                </div>
              ) : alreadyApplied ? (
                <div>
                  <div style={{ width: 48, height: 48, background: 'var(--color-success-50)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                    <CheckCircle size={24} color="var(--color-success-600)" />
                  </div>
                  <p style={{ fontWeight: 600, color: 'var(--color-success-700)', marginBottom: '4px' }}>Application Submitted</p>
                  <p style={{ fontSize: '13px', color: 'var(--color-neutral-500)' }}>You've already applied to this position.</p>
                  <Link to="/my-applications" className="btn btn-secondary btn-sm" style={{ marginTop: '12px' }}>View My Applications</Link>
                </div>
              ) : !user ? (
                <div>
                  <p style={{ fontSize: '14px', color: 'var(--color-neutral-600)', marginBottom: '16px' }}>Sign in to apply for this job</p>
                  <Link to="/login" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Sign In to Apply</Link>
                  <p style={{ fontSize: '12px', color: 'var(--color-neutral-400)', marginTop: '12px' }}>
                    New here? <Link to="/register" style={{ color: 'var(--color-primary-600)' }}>Create a free account</Link>
                  </p>
                </div>
              ) : profile?.role === 'employer' ? (
                <p style={{ fontSize: '13px', color: 'var(--color-neutral-500)' }}>Employers cannot apply to jobs.</p>
              ) : (
                <div>
                  <p style={{ fontSize: '13px', color: 'var(--color-neutral-500)', marginBottom: '16px' }}>Ready to apply? Submit your application now.</p>
                  <Link
                    to={`/jobs/${id}/apply`}
                    className="btn btn-primary btn-lg"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    Apply Now
                  </Link>
                </div>
              )}
            </div>

            <div className="job-detail-card">
              <h4 style={{ fontWeight: 600, marginBottom: '16px', color: 'var(--color-neutral-900)' }}>Job Overview</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { icon: Briefcase, label: 'Job Type', value: job.employmentType },
                  { icon: MapPin, label: 'Location', value: job.location },
                  { icon: DollarSign, label: 'Salary', value: salary },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: 36, height: 36, background: 'var(--color-primary-50)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon size={16} color="var(--color-primary-600)" />
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: 'var(--color-neutral-400)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{item.label}</div>
                        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-neutral-800)' }}>{item.value}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="job-detail-card">
              <h4 style={{ fontWeight: 600, marginBottom: '12px', color: 'var(--color-neutral-900)' }}>About the Company</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: 40, height: 40, background: 'var(--color-primary-50)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--color-primary-600)' }}>
                  {logo}
                </div>
                <div style={{ fontWeight: 600, fontSize: '14px' }}>{company}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
