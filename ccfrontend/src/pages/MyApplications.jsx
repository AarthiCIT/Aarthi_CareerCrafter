import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Briefcase, Clock, CheckCircle, XCircle, TrendingUp, Bell, MapPin, Search } from 'lucide-react';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  if (days < 30) return `${days} days ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const STATUS_META = {
  APPLIED:      { label: 'Pending Review', className: 'status-pending',     icon: Clock,       desc: 'Your application is being reviewed by the employer.' },
  UNDER_REVIEW: { label: 'Reviewed',       className: 'status-reviewed',    icon: Bell,        desc: 'The employer has reviewed your application.' },
  SHORTLISTED:  { label: 'Shortlisted',    className: 'status-shortlisted', icon: TrendingUp,  desc: 'Congratulations! You have been shortlisted.' },
  HIRED:        { label: 'Hired',          className: 'status-accepted',    icon: CheckCircle, desc: 'You got the job! The employer has accepted your application.' },
  REJECTED:     { label: 'Not Selected',   className: 'status-rejected',    icon: XCircle,     desc: 'Unfortunately, the employer has moved forward with other candidates.' },
};

const FILTER_TABS = ['all', 'APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'HIRED', 'REJECTED'];

export default function MyApplications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [jobsById, setJobsById] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function fetchApplications() {
    if (!user) return;
    setLoading(true);
    try {
      const apps = await api.applications.getByJobSeeker(user.id);
      const sorted = [...apps].sort((a, b) => new Date(b.appliedOn) - new Date(a.appliedOn));
      setApplications(sorted);

      const jobIds = [...new Set(sorted.map((a) => a.jobListingId))];
      const entries = await Promise.all(
        jobIds.map(async (jid) => [jid, await api.jobListings.getById(jid).catch(() => null)])
      );
      setJobsById(Object.fromEntries(entries.filter(([, v]) => v)));
    } finally {
      setLoading(false);
    }
  }

  const filtered = applications.filter((app) => {
    const job = jobsById[app.jobListingId];
    const matchesFilter = activeFilter === 'all' || app.status === activeFilter;
    const matchesSearch = !searchQuery || job?.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const counts = FILTER_TABS.reduce((acc, tab) => {
    acc[tab] = tab === 'all' ? applications.length : applications.filter((a) => a.status === tab).length;
    return acc;
  }, {});

  return (
    <div className="page-content">
      <div className="container">
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-neutral-900)' }}>My Applications</h1>
          <p style={{ fontSize: '14px', color: 'var(--color-neutral-500)', marginTop: '4px' }}>
            Track and manage all your job applications in one place
          </p>
        </div>

        <div className="grid-4" style={{ marginBottom: '32px' }}>
          {[
            { label: 'Total', value: counts.all, color: 'stat-icon-blue', icon: Briefcase },
            { label: 'Pending', value: counts.APPLIED, color: 'stat-icon-orange', icon: Clock },
            { label: 'Shortlisted', value: counts.SHORTLISTED, color: 'stat-icon-purple', icon: TrendingUp },
            { label: 'Hired', value: counts.HIRED, color: 'stat-icon-green', icon: CheckCircle },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div className="stat-card" key={s.label}>
                <div className={`stat-icon ${s.color}`}><Icon size={22} /></div>
                <div>
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ background: '#fff', border: '1px solid var(--color-neutral-200)', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
              <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-neutral-400)' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Search by job title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '36px' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveFilter(tab)}
                  className={`btn btn-sm ${activeFilter === tab ? 'btn-primary' : 'btn-ghost'}`}
                >
                  {tab === 'all' ? 'All' : STATUS_META[tab]?.label} ({counts[tab]})
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <div className="spinner" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <Briefcase size={48} />
              <h3>No applications found</h3>
              <p>{searchQuery ? 'Try a different search term' : 'You haven\'t applied to any jobs yet'}</p>
              {!searchQuery && (
                <Link to="/jobs" className="btn btn-primary btn-sm" style={{ marginTop: '16px' }}>Browse Jobs</Link>
              )}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filtered.map((app) => {
              const meta = STATUS_META[app.status] || STATUS_META.APPLIED;
              const Icon = meta.icon;
              const isExpanded = expanded === app.id;
              const job = jobsById[app.jobListingId];
              return (
                <div key={app.id} className="card">
                  <div
                    className="card-body"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setExpanded(isExpanded ? null : app.id)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'var(--color-primary-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '18px', color: 'var(--color-primary-600)', flexShrink: 0 }}>
                        {(job?.jobTitle || 'J')[0]}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--color-neutral-900)' }}>{job?.jobTitle || 'Job listing removed'}</div>
                        <div style={{ fontSize: '13px', color: 'var(--color-neutral-400)', display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '2px' }}>
                          {job?.location && <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><MapPin size={11} /> {job.location}</span>}
                          {job?.employmentType && <span>{job.employmentType}</span>}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <span className={`badge ${meta.className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Icon size={11} /> {meta.label}
                        </span>
                        <div style={{ fontSize: '11px', color: 'var(--color-neutral-400)', marginTop: '4px' }}>Applied {timeAgo(app.appliedOn)}</div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--color-neutral-100)' }}>
                        <div className="alert alert-info" style={{ marginBottom: '16px' }}>
                          <Icon size={15} /> {meta.desc}
                        </div>
                        {app.coverNote && (
                          <div style={{ marginBottom: '16px' }}>
                            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-neutral-500)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>Cover Note</div>
                            <p style={{ fontSize: '13px', color: 'var(--color-neutral-600)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{app.coverNote}</p>
                          </div>
                        )}
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <Link to={`/jobs/${app.jobListingId}`} className="btn btn-secondary btn-sm">View Job</Link>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
