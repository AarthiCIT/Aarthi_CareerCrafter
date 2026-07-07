import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, getEmployerLabel } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Briefcase, Clock, CheckCircle, XCircle, Search, TrendingUp, ArrowRight, MapPin, Bell } from 'lucide-react';

const STATUS_META = {
  APPLIED:      { label: 'Pending',     className: 'status-pending',     icon: Clock },
  UNDER_REVIEW: { label: 'Reviewed',    className: 'status-reviewed',    icon: Bell },
  SHORTLISTED:  { label: 'Shortlisted', className: 'status-shortlisted', icon: TrendingUp },
  HIRED:        { label: 'Hired',       className: 'status-accepted',    icon: CheckCircle },
  REJECTED:     { label: 'Rejected',    className: 'status-rejected',    icon: XCircle },
};

export default function JobSeekerDashboard() {
  const { user, profile } = useAuth();
  const [applications, setApplications] = useState([]);
  const [jobsById, setJobsById] = useState({});
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [companies, setCompanies] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function fetchData() {
    if (!user) return;
    setLoading(true);
    try {
      const [apps, activeJobs] = await Promise.all([
        api.applications.getByJobSeeker(user.id),
        api.jobListings.getAllActive(),
      ]);

      const sortedApps = [...apps].sort((a, b) => new Date(b.appliedOn) - new Date(a.appliedOn)).slice(0, 5);
      setApplications(sortedApps);
      setRecommendedJobs(activeJobs.slice(0, 6));

      const neededJobIds = [...new Set(sortedApps.map((a) => a.jobListingId))];
      const jobEntries = await Promise.all(
        neededJobIds.map(async (jid) => [jid, await api.jobListings.getById(jid).catch(() => null)])
      );
      setJobsById(Object.fromEntries(jobEntries.filter(([, v]) => v)));

      const employerIds = [...new Set(activeJobs.slice(0, 6).map((j) => j.employerId))];
      const companyEntries = await Promise.all(
        employerIds.map(async (eid) => [eid, await getEmployerLabel(eid)])
      );
      setCompanies(Object.fromEntries(companyEntries));
    } finally {
      setLoading(false);
    }
  }

  const counts = {
    total: applications.length,
    pending: applications.filter((a) => a.status === 'APPLIED').length,
    shortlisted: applications.filter((a) => a.status === 'SHORTLISTED').length,
    hired: applications.filter((a) => a.status === 'HIRED').length,
  };

  const firstName = profile?.full_name?.split(' ')[0] || 'there';

  return (
    <div>
      <div className="dashboard-header">
        <div className="container">
          <div className="dashboard-greeting">Good day, {firstName}!</div>
          <div className="dashboard-subtitle">Here's an overview of your job search activity</div>
          <div className="dashboard-stats">
            <div className="dashboard-stat">
              <div className="dashboard-stat-value">{counts.total}</div>
              <div className="dashboard-stat-label">Applications Sent</div>
            </div>
            <div className="dashboard-stat">
              <div className="dashboard-stat-value">{counts.pending}</div>
              <div className="dashboard-stat-label">Under Review</div>
            </div>
            <div className="dashboard-stat">
              <div className="dashboard-stat-value">{counts.shortlisted}</div>
              <div className="dashboard-stat-label">Shortlisted</div>
            </div>
            <div className="dashboard-stat">
              <div className="dashboard-stat-value">{counts.hired}</div>
              <div className="dashboard-stat-label">Offers Received</div>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-body">
        <div className="container">
          <div className="grid-3" style={{ marginBottom: '32px', gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {[
              { icon: Search, label: 'Browse Jobs', desc: 'Find your next opportunity', to: '/jobs', color: 'var(--color-primary-600)', bg: 'var(--color-primary-50)' },
              { icon: Briefcase, label: 'My Applications', desc: 'Track your progress', to: '/my-applications', color: 'var(--color-accent-600)', bg: '#fff7ed' },
              { icon: CheckCircle, label: 'My Profile', desc: 'Update your resume', to: '/profile', color: 'var(--color-success-600)', bg: 'var(--color-success-50)' },
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
                <h2 className="section-title">Recent Applications</h2>
                <Link to="/my-applications" className="btn btn-ghost btn-sm">View All <ArrowRight size={14} /></Link>
              </div>
              <div className="card">
                {loading ? (
                  <div style={{ padding: '40px', display: 'flex', justifyContent: 'center' }}><div className="spinner" /></div>
                ) : applications.length === 0 ? (
                  <div className="empty-state">
                    <Briefcase size={40} />
                    <h3>No applications yet</h3>
                    <p>Start applying to jobs to track your progress here</p>
                    <Link to="/jobs" className="btn btn-primary btn-sm" style={{ marginTop: '16px' }}>Browse Jobs</Link>
                  </div>
                ) : (
                  <div>
                    {applications.map((app, i) => {
                      const meta = STATUS_META[app.status] || STATUS_META.APPLIED;
                      const Icon = meta.icon;
                      const job = jobsById[app.jobListingId];
                      return (
                        <div key={app.id} style={{ padding: '16px 20px', borderBottom: i < applications.length - 1 ? '1px solid var(--color-neutral-100)' : 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'var(--color-primary-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--color-primary-600)', flexShrink: 0 }}>
                            {(job?.jobTitle || 'J')[0]}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--color-neutral-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{job?.jobTitle || 'Job listing removed'}</div>
                            <div style={{ fontSize: '12px', color: 'var(--color-neutral-400)' }}>{job?.location}</div>
                          </div>
                          <span className={`badge ${meta.className}`}>
                            <Icon size={11} style={{ marginRight: 3 }} /> {meta.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="section-header">
                <h2 className="section-title">Recommended Jobs</h2>
                <Link to="/jobs" className="btn btn-ghost btn-sm">See All <ArrowRight size={14} /></Link>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {loading ? (
                  <div className="card card-body" style={{ display: 'flex', justifyContent: 'center' }}><div className="spinner" /></div>
                ) : recommendedJobs.slice(0, 4).map((job) => (
                  <Link to={`/jobs/${job.id}`} key={job.id} style={{ textDecoration: 'none' }}>
                    <div className="card card-body" style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--color-neutral-900)', marginBottom: '4px' }}>{job.jobTitle}</div>
                      <div style={{ fontSize: '12px', color: 'var(--color-neutral-400)', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <span>{companies[job.employerId] || 'Company'}</span>
                        <span>&bull;</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}><MapPin size={10} /> {job.location}</span>
                      </div>
                      <div style={{ marginTop: '8px' }}>
                        <span className={`badge ${job.employmentType === 'Remote' ? 'badge-green' : 'badge-blue'}`}>{job.employmentType}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
