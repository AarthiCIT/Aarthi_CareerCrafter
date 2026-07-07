import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Pencil, Trash2, Eye, CheckCircle, XCircle, AlertCircle, Briefcase, Search } from 'lucide-react';

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Remote', 'Internship'];

function EditJobModal({ job, onClose, onSaved }) {
  const [form, setForm] = useState({
    jobTitle: job.jobTitle,
    location: job.location,
    employmentType: job.employmentType,
    industry: job.industry || '',
    salary: job.salary || '',
    description: job.description,
    qualifications: job.qualifications || '',
    active: job.active,
    employerId: job.employerId,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function save(e) {
    e.preventDefault();
    if (!form.jobTitle.trim() || !form.description.trim()) { setError('Title and description are required'); return; }
    setSaving(true);
    try {
      await api.jobListings.update(job.id, { ...form, salary: form.salary ? parseFloat(form.salary) : 0 });
      onSaved();
    } catch (err) {
      setError(err.message || 'Failed to update job.');
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 600, maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Edit Job Listing</h2>
        <p className="modal-subtitle">Update the details for this position</p>
        {error && <div className="alert alert-error" style={{ marginBottom: '16px' }}><AlertCircle size={14} /> {error}</div>}
        <form onSubmit={save}>
          <div className="form-group">
            <label className="form-label">Job Title</label>
            <input className="form-input" value={form.jobTitle} onChange={(e) => setForm((f) => ({ ...f, jobTitle: e.target.value }))} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Location</label>
              <input className="form-input" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} placeholder="e.g., Bangalore, KA or Remote" />
            </div>
            <div className="form-group">
              <label className="form-label">Job Type</label>
              <select className="form-select" value={form.employmentType} onChange={(e) => setForm((f) => ({ ...f, employmentType: e.target.value }))}>
                {JOB_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Annual Salary (₹)</label>
            <input type="number" className="form-input" placeholder="e.g., 1200000 for ₹12L" value={form.salary} onChange={(e) => setForm((f) => ({ ...f, salary: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} style={{ minHeight: 120 }} />
          </div>
          <div className="form-group">
            <label className="form-label">Qualifications</label>
            <input className="form-input" value={form.qualifications} onChange={(e) => setForm((f) => ({ ...f, qualifications: e.target.value }))} placeholder="React, TypeScript, Node.js" />
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-select" value={form.active ? 'active' : 'closed'} onChange={(e) => setForm((f) => ({ ...f, active: e.target.value === 'active' }))}>
              <option value="active">Active</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteConfirm({ job, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false);
  async function confirm() {
    setDeleting(true);
    try {
      await api.jobListings.remove(job.id);
      onDeleted();
    } finally {
      setDeleting(false);
    }
  }
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Delete Job Listing</h2>
        <p className="modal-subtitle">Are you sure you want to delete <strong>{job.jobTitle}</strong>? This will also remove all associated applications and cannot be undone.</p>
        <div className="modal-actions">
          <button onClick={onClose} className="btn btn-ghost">Cancel</button>
          <button onClick={confirm} className="btn btn-danger" disabled={deleting}>{deleting ? 'Deleting...' : 'Delete Job'}</button>
        </div>
      </div>
    </div>
  );
}

export default function ManageJobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editJob, setEditJob] = useState(null);
  const [deleteJob, setDeleteJob] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => { fetchJobs(); }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchJobs() {
    if (!user) return;
    setLoading(true);
    try {
      const data = await api.jobListings.getByEmployer(user.id);
      setJobs([...data].reverse());
    } finally {
      setLoading(false);
    }
  }

  async function toggleStatus(job) {
    const updated = { ...job, active: !job.active };
    await api.jobListings.update(job.id, updated);
    setJobs((prev) => prev.map((j) => j.id === job.id ? updated : j));
  }

  const filtered = jobs.filter((j) => {
    const matchesSearch = !search || j.jobTitle.toLowerCase().includes(search.toLowerCase()) || j.location.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || (filterStatus === 'active') === j.active;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="page-content">
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-neutral-900)' }}>Manage Jobs</h1>
            <p style={{ fontSize: '14px', color: 'var(--color-neutral-500)', marginTop: '4px' }}>
              {jobs.filter((j) => j.active).length} active &bull; {jobs.filter((j) => !j.active).length} closed
            </p>
          </div>
          <Link to="/employer/post-job" className="btn btn-primary">
            <Plus size={16} /> Post New Job
          </Link>
        </div>

        <div style={{ background: '#fff', border: '1px solid var(--color-neutral-200)', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-neutral-400)' }} />
            <input className="form-input" placeholder="Search jobs..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: '36px' }} />
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {['all', 'active', 'closed'].map((s) => (
              <button key={s} onClick={() => setFilterStatus(s)} className={`btn btn-sm ${filterStatus === s ? 'btn-primary' : 'btn-ghost'}`} style={{ textTransform: 'capitalize' }}>
                {s === 'all' ? `All (${jobs.length})` : `${s.charAt(0).toUpperCase() + s.slice(1)} (${jobs.filter((j) => (s === 'active') === j.active).length})`}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <Briefcase size={48} />
              <h3>No jobs found</h3>
              <p>{search ? 'Try a different search term' : 'Post your first job listing to get started'}</p>
              {!search && <Link to="/employer/post-job" className="btn btn-primary btn-sm" style={{ marginTop: '16px' }}><Plus size={14} /> Post a Job</Link>}
            </div>
          </div>
        ) : (
          <div className="card">
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Job Title</th>
                    <th>Type</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((job) => (
                    <tr key={job.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--color-neutral-900)' }}>{job.jobTitle}</div>
                        {job.qualifications && <div style={{ fontSize: '11px', color: 'var(--color-neutral-400)', marginTop: '2px' }}>{job.qualifications.split(',').slice(0, 3).join(', ')}</div>}
                      </td>
                      <td><span className="badge badge-blue">{job.employmentType}</span></td>
                      <td style={{ color: 'var(--color-neutral-500)' }}>{job.location}</td>
                      <td>
                        <button onClick={() => toggleStatus(job)} className={`badge ${job.active ? 'status-active' : 'status-closed'}`} style={{ cursor: 'pointer', border: 'none' }}>
                          {job.active ? <CheckCircle size={10} style={{ marginRight: 3 }} /> : <XCircle size={10} style={{ marginRight: 3 }} />}
                          {job.active ? 'Active' : 'Closed'}
                        </button>
                      </td>
                      <td>
                        <div className="table-actions">
                          <Link to={`/jobs/${job.id}`} className="btn btn-ghost btn-sm" title="View"><Eye size={15} /></Link>
                          <button onClick={() => setEditJob(job)} className="btn btn-secondary btn-sm" title="Edit"><Pencil size={15} /></button>
                          <button onClick={() => setDeleteJob(job)} className="btn btn-danger btn-sm" title="Delete"><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {editJob && <EditJobModal job={editJob} onClose={() => setEditJob(null)} onSaved={() => { setEditJob(null); fetchJobs(); }} />}
      {deleteJob && <DeleteConfirm job={deleteJob} onClose={() => setDeleteJob(null)} onDeleted={() => { setDeleteJob(null); fetchJobs(); }} />}
    </div>
  );
}
