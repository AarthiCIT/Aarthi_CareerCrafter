import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Briefcase, Users, Plus, ArrowRight, Eye } from 'lucide-react';

const STATUS_STYLE = {
  APPLIED:      { className: 'status-pending',     label: 'Pending' },
  UNDER_REVIEW: { className: 'status-reviewed',    label: 'Reviewed' },
  SHORTLISTED:  { className: 'status-shortlisted', label: 'Shortlisted' },
  HIRED:        { className: 'status-accepted',    label: 'Hired' },
  REJECTED:     { className: 'status-rejected',    label: 'Rejected' },
};

export default function EmployerDashboard() {
  const { user, profile } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [applicants, setApplicants] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function fetchData() {
    if (!user) return;
    setLoading(true);
    try {
      const myJobs = await api.jobListings.getByEmployer(user.id);
      const recentJobs = [...myJobs].reverse().slice(0, 5);
      setJobs(recentJobs);

      const appLists = await Promise.all(
        myJobs.map((j) => api.applications.getByJobListing(j.id).catch(() => []))
      );
      const allApps = appLists.flat().sort((a, b) => new Date(b.appliedOn) - new Date(a.appliedOn));
      setApplications(allApps);

      const applicantIds = [...new Set(allApps.slice(0, 4).map((a) => a.jobSeekerId))];
      const entries = await Promise.all(
        applicantIds.map(async (id) => [id, await api.users.getById(id).catch(() => null)])
      );
      setApplicants(Object.fromEntries(entries.filter(([, v]) => v)));
    } finally {
      setLoading(false);
    }
  }

  const totalApplications = applications.length;
  const activeJobs = jobs.filter((j) => j.active).length;
  const pendingApps = applications.filter((a) => a.status === 'APPLIED').length;
  const firstName = profile?.full_name?.split(' ')[0] || 'there';
  const company = profile?.company_name || 'Your Company';

  return (
    <div>
      <div className="dashboard-header">
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'space-between' }}>
            <div>
              <div className="dashboard-greeting">Welcome back, {firstName}!</div>
              <div className="dashboard-subtitle">{company} &bull; Employer Dashboard</div>
            </div>
            <Link to="/employer/post-job" className="btn btn-lg" style={{ background: '#fff', color: 'var(--color-primary-700)', flexShrink: 0 }}>
              <Plus size={18} /> Post a Job
            </Link>
          </div>
          <div className="dashboard-stats">
            <div className="dashboard-stat">
              <div className="dashboard-stat-value">{activeJobs}</div>
              <div className="dashboard-stat-label">Active Listings</div>
            </div>
            <div className="dashboard-stat">
              <div className="dashboard-stat-value">{jobs.length}</div>
              <div className="dashboard-stat-label">Total Jobs Posted</div>
            </div>
            <div className="dashboard-stat">
              <div className="dashboard-stat-value">{totalApplications}</div>
              <div className="dashboard-stat-label">Total Applications</div>
            </div>
            <div className="dashboard-stat">
              <div className="dashboard-stat-value">{pendingApps}</div>
              <div className="dashboard-stat-label">Awaiting Review</div>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-body">
        <div className="container">
          <div className="grid-3" style={{ marginBottom: '32px' }}>
            {[
              { icon: Plus, label: 'Post New Job', desc: 'Create a new job listing', to: '/employer/post-job', color: 'var(--color-primary-600)', bg: 'var(--color-primary-50)' },
              { icon: Briefcase, label: 'Manage Jobs', desc: 'Edit or close listings', to: '/employer/manage-jobs', color: 'var(--color-accent-600)', bg: '#fff7ed' },
              { icon: Users, label: 'View Applications', desc: 'Review candidate profiles', to: '/employer/applications', color: 'var(--color-success-600)', bg: 'var(--color-success-50)' },
            ].map((action) => {
              const Icon = action.icon;
              return (
                <Link to={action.to} key={action.label} style={{ textDecoration: 'none' }}>
                  <div className="card card-body" style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}>
                    <div style={{ width: 48, height: 48, borderRadius: '12px', background: action.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={22} color={action.color} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--color-neutral-900)' }}>{action.label}</div>
                      <div style={{ fontSize: '13px', color: 'var(--color-neutral-400)' }}>{action.desc}</div>
                    </div>
                    <ArrowRight size={16} color="var(--color-neutral-300)" style={{ marginLeft: 'auto' }} />
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="dashboard-grid">
            <div>
              <div className="section-header">
                <h2 className="section-title">Recent Job Listings</h2>
                <Link to="/employer/manage-jobs" className="btn btn-ghost btn-sm">Manage All <ArrowRight size={14} /></Link>
              </div>
              <div className="card">
                {loading ? (
                  <div style={{ padding: '40px', display: 'flex', justifyContent: 'center' }}><div className="spinner" /></div>
                ) : jobs.length === 0 ? (
                  <div className="empty-state">
                    <Briefcase size={40} />
                    <h3>No jobs posted yet</h3>
                    <p>Post your first job to start receiving applications</p>
                    <Link to="/employer/post-job" className="btn btn-primary btn-sm" style={{ marginTop: '16px' }}>
                      <Plus size={14} /> Post a Job
                    </Link>
                  </div>
                ) : (
                  <div>
                    {jobs.map((job, i) => (
                      <div key={job.id} style={{ padding: '16px 20px', borderBottom: i < jobs.length - 1 ? '1px solid var(--color-neutral-100)' : 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--color-neutral-900)' }}>{job.jobTitle}</div>
                          <div style={{ fontSize: '12px', color: 'var(--color-neutral-400)', marginTop: '2px' }}>
                            {job.location} &bull; {job.employmentType}
                          </div>
                        </div>
                        <span className={`badge ${job.active ? 'badge-green' : 'badge-gray'}`}>
                          {job.active ? 'Active' : 'Closed'}
                        </span>
                        <Link to="/employer/manage-jobs" className="btn btn-ghost btn-sm">
                          <Eye size={14} />
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="section-header">
                <h2 className="section-title">Recent Applications</h2>
                <Link to="/employer/applications" className="btn btn-ghost btn-sm">View All <ArrowRight size={14} /></Link>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {loading ? (
                  <div className="card card-body" style={{ display: 'flex', justifyContent: 'center' }}><div className="spinner" /></div>
                ) : applications.length === 0 ? (
                  <div className="card">
                    <div className="empty-state">
                      <Users size={40} />
                      <h3>No applications yet</h3>
                      <p>Applications will appear here once candidates apply</p>
                    </div>
                  </div>
                ) : applications.slice(0, 4).map((app) => {
                  const meta = STATUS_STYLE[app.status] || STATUS_STYLE.APPLIED;
                  const applicant = applicants[app.jobSeekerId];
                  const job = jobs.find((j) => j.id === app.jobListingId);
                  return (
                    <div key={app.id} className="card card-body" style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--color-primary-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--color-primary-600)', fontSize: '13px', flexShrink: 0 }}>
                          {(applicant?.fullName || 'A')[0]}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--color-neutral-900)' }}>{applicant?.fullName || 'Applicant'}</div>
                          <div style={{ fontSize: '11px', color: 'var(--color-neutral-400)' }}>{job?.jobTitle}</div>
                        </div>
                        <span className={`badge ${meta.className}`}>{meta.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
