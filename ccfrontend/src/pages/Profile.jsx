import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { User, Building2, FileText, Save, CheckCircle, AlertCircle, Pencil, Share2, Trash2 } from 'lucide-react';

export default function Profile() {
  const { user, profile, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [profileForm, setProfileForm] = useState({
    fullName: '', email: '', educationDetails: '', professionalDetails: '', companyName: '', currentPassword: '',
  });
  const [resumes, setResumes] = useState([]);
  const [resumeForm, setResumeForm] = useState({ fileName: '', filePath: '', fileType: 'PDF' });
  const [saving, setSaving] = useState(false);
  const [savingResume, setSavingResume] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    if (profile) {
      setProfileForm((f) => ({
        ...f,
        fullName: profile.full_name || '',
        email: profile.email || user?.email || '',
        educationDetails: profile.education_details || '',
        professionalDetails: profile.professional_details || '',
        companyName: profile.company_name || '',
      }));
    }
    fetchResumes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  async function fetchResumes() {
    if (!user) return;
    try {
      const data = await api.resumes.getByJobSeeker(user.id);
      setResumes(data);
    } catch {
      setResumes([]);
    }
  }

  function showMsg(type, text) {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 3000);
  }

  async function saveProfile(e) {
    e.preventDefault();
    if (!profileForm.fullName.trim()) { showMsg('error', 'Full name is required'); return; }
    if (!profileForm.currentPassword) { showMsg('error', 'Enter your current password to confirm changes'); return; }
    setSaving(true);
    try {
      await api.users.update(user.id, {
        fullName: profileForm.fullName.trim(),
        email: profileForm.email,
        password: profileForm.currentPassword,
        role: isEmployer ? 'EMPLOYER' : 'JOB_SEEKER',
        educationDetails: profileForm.educationDetails,
        professionalDetails: profileForm.professionalDetails,
        companyName: profileForm.companyName,
      });
      showMsg('success', 'Profile updated successfully!');
      setProfileForm((f) => ({ ...f, currentPassword: '' }));
      await refreshProfile();
    } catch (err) {
      showMsg('error', err.message || 'Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function saveResume(e) {
    e.preventDefault();
    if (!resumeForm.fileName.trim() || !resumeForm.filePath.trim()) {
      showMsg('error', 'Resume name and link/path are required');
      return;
    }
    setSavingResume(true);
    try {
      await api.resumes.upload({
        fileName: resumeForm.fileName.trim(),
        filePath: resumeForm.filePath.trim(),
        fileType: resumeForm.fileType,
        jobSeekerId: user.id,
      });
      showMsg('success', 'Resume saved successfully!');
      setResumeForm({ fileName: '', filePath: '', fileType: 'PDF' });
      await fetchResumes();
    } catch (err) {
      showMsg('error', err.message || 'Failed to save resume.');
    } finally {
      setSavingResume(false);
    }
  }

  async function deleteResume(id) {
    try {
      await api.resumes.remove(id);
      await fetchResumes();
    } catch (err) {
      showMsg('error', err.message || 'Failed to delete resume.');
    }
  }

  async function toggleShare(resume) {
    try {
      await api.resumes.share(resume.id);
      await fetchResumes();
    } catch (err) {
      showMsg('error', err.message || 'Failed to update sharing.');
    }
  }

  const initials = profile?.full_name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || '?';
  const isEmployer = profile?.role === 'employer';

  return (
    <div>
      <div className="profile-header">
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div className="profile-avatar">{initials}</div>
            <div>
              <div className="profile-name">{profile?.full_name || 'Your Name'}</div>
              <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.75)', marginBottom: '8px' }}>{user?.email}</div>
              <span className="profile-role-badge">
                {isEmployer ? <Building2 size={12} /> : <User size={12} />}
                {isEmployer ? 'Employer' : 'Job Seeker'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="page-content">
        <div className="container">
          {msg.text && (
            <div className={`alert ${msg.type === 'success' ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: '24px' }}>
              {msg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              {msg.text}
            </div>
          )}

          <div className="profile-layout">
            <nav className="profile-nav">
              <button
                onClick={() => setActiveTab('personal')}
                className={`profile-nav-item ${activeTab === 'personal' ? 'active' : ''}`}
              >
                <User size={16} /> Personal Info
              </button>
              <button
                onClick={() => setActiveTab('professional')}
                className={`profile-nav-item ${activeTab === 'professional' ? 'active' : ''}`}
              >
                {isEmployer ? <Building2 size={16} /> : <Pencil size={16} />}
                {isEmployer ? 'Company Details' : 'Professional Info'}
              </button>
              {!isEmployer && (
                <button
                  onClick={() => setActiveTab('resume')}
                  className={`profile-nav-item ${activeTab === 'resume' ? 'active' : ''}`}
                >
                  <FileText size={16} /> My Resumes
                </button>
              )}
            </nav>

            <div className="profile-content">
              {activeTab === 'personal' && (
                <form onSubmit={saveProfile} className="profile-section">
                  <div className="profile-section-title">
                    Personal Information
                    <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                      <Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Full Name <span className="required">*</span></label>
                      <input className="form-input" value={profileForm.fullName} onChange={(e) => setProfileForm((f) => ({ ...f, fullName: e.target.value }))} placeholder="Your full name" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email Address</label>
                      <input className="form-input" value={profileForm.email} readOnly style={{ background: 'var(--color-neutral-50)', cursor: 'not-allowed' }} />
                      <span className="form-hint">Email cannot be changed</span>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Current Password <span className="required">*</span></label>
                    <input type="password" className="form-input" value={profileForm.currentPassword} onChange={(e) => setProfileForm((f) => ({ ...f, currentPassword: e.target.value }))} placeholder="Confirm changes with your current password" />
                    <span className="form-hint">Required to confirm any change to your account</span>
                  </div>
                </form>
              )}

              {activeTab === 'professional' && (
                <form onSubmit={saveProfile} className="profile-section">
                  <div className="profile-section-title">
                    {isEmployer ? 'Company Details' : 'Professional Information'}
                    <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                      <Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                  {isEmployer ? (
                    <div className="form-group">
                      <label className="form-label">Company Name</label>
                      <input className="form-input" value={profileForm.companyName} onChange={(e) => setProfileForm((f) => ({ ...f, companyName: e.target.value }))} placeholder="Your company name" />
                    </div>
                  ) : (
                    <>
                      <div className="form-group">
                        <label className="form-label">Education Details</label>
                        <textarea className="form-textarea" value={profileForm.educationDetails} onChange={(e) => setProfileForm((f) => ({ ...f, educationDetails: e.target.value }))} placeholder="e.g. B.Tech in Computer Science, XYZ University (2022)" style={{ minHeight: 100 }} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Professional Details</label>
                        <textarea className="form-textarea" value={profileForm.professionalDetails} onChange={(e) => setProfileForm((f) => ({ ...f, professionalDetails: e.target.value }))} placeholder="e.g. 3 years experience as Frontend Developer, skills: React, Node.js" style={{ minHeight: 100 }} />
                      </div>
                    </>
                  )}
                  <div className="form-group">
                    <label className="form-label">Current Password <span className="required">*</span></label>
                    <input type="password" className="form-input" value={profileForm.currentPassword} onChange={(e) => setProfileForm((f) => ({ ...f, currentPassword: e.target.value }))} placeholder="Confirm changes with your current password" />
                  </div>
                </form>
              )}

              {activeTab === 'resume' && !isEmployer && (
                <div className="profile-section">
                  <div className="profile-section-title">My Resumes</div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                    {resumes.length === 0 && (
                      <p style={{ fontSize: '13px', color: 'var(--color-neutral-500)' }}>No resumes saved yet.</p>
                    )}
                    {resumes.map((r) => (
                      <div key={r.id} className="card card-body" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <FileText size={18} color="var(--color-primary-600)" />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: '14px' }}>{r.fileName}</div>
                          <a href={r.filePath} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: 'var(--color-primary-600)' }}>{r.filePath}</a>
                        </div>
                        <button type="button" onClick={() => toggleShare(r)} className={`btn btn-sm ${r.shared ? 'btn-primary' : 'btn-ghost'}`} title="Toggle sharing with employers">
                          <Share2 size={13} /> {r.shared ? 'Shared' : 'Private'}
                        </button>
                        <button type="button" onClick={() => deleteResume(r.id)} className="btn btn-danger btn-sm">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={saveResume} className="profile-section" style={{ padding: 0 }}>
                    <div className="profile-section-title">
                      Add a Resume
                      <button type="submit" className="btn btn-primary btn-sm" disabled={savingResume}>
                        <Save size={14} /> {savingResume ? 'Saving...' : 'Save Resume'}
                      </button>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Resume Name</label>
                      <input className="form-input" value={resumeForm.fileName} onChange={(e) => setResumeForm((r) => ({ ...r, fileName: e.target.value }))} placeholder="e.g. Frontend_Developer_Resume.pdf" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Link to Resume File</label>
                      <input className="form-input" value={resumeForm.filePath} onChange={(e) => setResumeForm((r) => ({ ...r, filePath: e.target.value }))} placeholder="https://drive.google.com/... or a shared storage link" />
                      <span className="form-hint">The backend currently stores a link/path, not the raw file itself.</span>
                    </div>
                    <div className="form-group">
                      <label className="form-label">File Type</label>
                      <select className="form-select" value={resumeForm.fileType} onChange={(e) => setResumeForm((r) => ({ ...r, fileType: e.target.value }))}>
                        <option value="PDF">PDF</option>
                        <option value="DOCX">DOCX</option>
                        <option value="TXT">TXT</option>
                      </select>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
