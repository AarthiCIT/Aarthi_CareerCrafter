import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Users, Clock, CheckCircle, XCircle, TrendingUp, Bell, Search, Mail, ChevronDown, ChevronUp } from 'lucide-react';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  if (days < 30) return `${days} days ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const STATUSES = ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'HIRED', 'REJECTED'];
const STATUS_META = {
  APPLIED:      { label: 'Pending',     className: 'status-pending',     icon: Clock },
  UNDER_REVIEW: { label: 'Reviewed',    className: 'status-reviewed',    icon: Bell },
  SHORTLISTED:  { label: 'Shortlisted', className: 'status-shortlisted', icon: TrendingUp },
  HIRED:        { label: 'Hired',       className: 'status-accepted',    icon: CheckCircle },
  REJECTED:     { label: 'Rejected',    className: 'status-rejected',    icon: XCircle },
};

export default function ViewApplications() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [applicants, setApplicants] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [updating, setUpdating] = useState(null);

  useEffect(() => { fetchData(); }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchData() {
    if (!user) return;
    setLoading(true);
    try {
      const myJobs = await api.jobListings.getByEmployer(user.id);
      setJobs(myJobs.filter((j) => j.active));

      const appLists = await Promise.all(myJobs.map((j) => api.applications.getByJobListing(j.id).catch(() => [])));
      const allApps = appLists.flat().sort((a, b) => new Date(b.appliedOn) - new Date(a.appliedOn));
      setApplications(allApps);

      const applicantIds = [...new Set(allApps.map((a) => a.jobSeekerId))];
      const entries = await Promise.all(
        applicantIds.map(async (id) => [id, await api.users.getById(id).catch(() => null)])
      );
      setApplicants(Object.fromEntries(entries.filter(([, v]) => v)));
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(appId, status) {
    setUpdating(appId);
    try {
      await api.applications.updateStatus(appId, status);
      setApplications((prev) => prev.map((a) => a.id === appId ? { ...a, status } : a));
    } finally {
      setUpdating(null);
    }
  }

  function jobFor(app) {
    return jobs.find((j) => j.id === app.jobListingId);
  }

  const filtered = applications.filter((app) => {
    const applicant = applicants[app.jobSeekerId];
    const job = jobFor(app);
    const matchesJob = selectedJob === 'all' || app.jobListingId === Number(selectedJob);
    const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
    const matchesSearch = !search ||
      applicant?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      applicant?.email?.toLowerCase().includes(search.toLowerCase()) ||
      job?.jobTitle?.toLowerCase().includes(search.toLowerCase());
    return matchesJob && matchesStatus && matchesSearch;
  });

  const counts = STATUSES.reduce((acc, s) => { acc[s] = applications.filter((a) => a.status === s).length; return acc; }, {});

  return (
    <div className="page-content">
      <div className="container">
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-neutral-900)' }}>Applications Received</h1>
          <p style={{ fontSize: '14px', color: 'var(--color-neutral-500)', marginTop: '4px' }}>
            Review and manage all candidate applications
          </p>
        </div>

        <div className="grid-4" style={{ marginBottom: '32px' }}>
          {[
            { label: 'Total', value: applications.length, icon: Users, color: 'stat-icon-blue' },
            { label: 'Pending', value: counts.APPLIED, icon: Clock, color: 'stat-icon-orange' },
            { label: 'Shortlisted', value: counts.SHORTLISTED, icon: TrendingUp, color: 'stat-icon-purple' },
            { label: 'Hired', value: counts.HIRED, icon: CheckCircle, color: 'stat-icon-green' },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div className="stat-card" key={s.label}>
                <div className={`stat-icon ${s.color}`}><Icon size={22} /></div>
                <div><div className="stat-value">{s.value}</div><div className="stat-label">{s.label}</div></div>
              </div>
            );
          })}
        </div>

        <div style={{ background: '#fff', border: '1px solid var(--color-neutral-200)', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
              <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-neutral-400)' }} />
              <input className="form-input" placeholder="Search candidates..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: '36px' }} />
            </div>
            <select className="form-select" value={selectedJob} onChange={(e) => setSelectedJob(e.target.value)} style={{ flex: '0 0 auto', width: 'auto' }}>
              <option value="all">All Jobs</option>
              {jobs.map((j) => <option key={j.id} value={j.id}>{j.jobTitle}</option>)}
            </select>
            <select className="form-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ flex: '0 0 auto', width: 'auto' }}>
              <option value="all">All Statuses</option>
              {STATUSES.map((s) => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <Users size={48} />
              <h3>No applications found</h3>
              <p>{search ? 'Try a different search term' : 'Applications will appear here once candidates apply'}</p>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filtered.map((app) => {
              const meta = STATUS_META[app.status] || STATUS_META.APPLIED;
              const MetaIcon = meta.icon;
              const isExpanded = expanded === app.id;
              const applicant = applicants[app.jobSeekerId];
              const job = jobFor(app);
              return (
                <div key={app.id} className="card">
                  <div className="card-body">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }} onClick={() => setExpanded(isExpanded ? null : app.id)}>
                      <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--color-primary-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '18px', color: 'var(--color-primary-600)', flexShrink: 0 }}>
                        {(applicant?.fullName || 'A')[0].toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--color-neutral-900)' }}>{applicant?.fullName || 'Anonymous'}</div>
                        <div style={{ fontSize: '12px', color: 'var(--color-neutral-400)', display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '2px' }}>
                          {applicant?.email && <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Mail size={11} /> {applicant.email}</span>}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--color-neutral-500)', marginTop: '2px' }}>
                          Applied for: <strong>{job?.jobTitle}</strong> &bull; {timeAgo(app.appliedOn)}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                        <span className={`badge ${meta.className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <MetaIcon size={10} /> {meta.label}
                        </span>
                        {isExpanded ? <ChevronUp size={16} color="var(--color-neutral-400)" /> : <ChevronDown size={16} color="var(--color-neutral-400)" />}
                      </div>
                    </div>

                    {isExpanded && (
                      <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--color-neutral-100)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                          <div>
                            {app.coverNote && (
                              <div style={{ marginBottom: '20px' }}>
                                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-neutral-500)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>Cover Note</div>
                                <p style={{ fontSize: '13px', color: 'var(--color-neutral-600)', lineHeight: 1.7, whiteSpace: 'pre-wrap', maxHeight: '200px', overflow: 'auto' }}>{app.coverNote}</p>
                              </div>
                            )}
                          </div>
                          <div>
                            {applicant?.professionalDetails && (
                              <div style={{ marginBottom: '16px' }}>
                                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-neutral-500)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>Professional Details</div>
                                <p style={{ fontSize: '13px', color: 'var(--color-neutral-700)', lineHeight: 1.6 }}>{applicant.professionalDetails}</p>
                              </div>
                            )}
                            {applicant?.educationDetails && (
                              <div style={{ marginBottom: '16px' }}>
                                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-neutral-500)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>Education</div>
                                <div style={{ fontSize: '14px', color: 'var(--color-neutral-700)' }}>{applicant.educationDetails}</div>
                              </div>
                            )}

                            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--color-neutral-100)' }}>
                              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-neutral-500)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px' }}>Update Status</div>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {STATUSES.map((s) => {
                                  const m = STATUS_META[s];
                                  return (
                                    <button
                                      key={s}
                                      onClick={() => updateStatus(app.id, s)}
                                      disabled={app.status === s || updating === app.id}
                                      className={`btn btn-sm ${app.status === s ? 'btn-primary' : 'btn-ghost'}`}
                                    >
                                      {m.label}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
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
