import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase, Menu, X, Bell, LogOut, User, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  async function handleSignOut() {
    await signOut();
    navigate('/login');
  }

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  const dashboardPath = profile?.role === 'employer' ? '/employer/dashboard' : '/dashboard';

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-inner">
          <Link to="/" className="navbar-logo">
            <Briefcase size={24} />
            Career<span>Crafter</span>
          </Link>

          <div className="navbar-links">
            <Link to="/jobs" className={`navbar-link ${isActive('/jobs') ? 'active' : ''}`}>Browse Jobs</Link>
            {user && profile?.role === 'job_seeker' && (
              <>
                <Link to="/dashboard" className={`navbar-link ${isActive('/dashboard') ? 'active' : ''}`}>Dashboard</Link>
                <Link to="/my-applications" className={`navbar-link ${isActive('/my-applications') ? 'active' : ''}`}>My Applications</Link>
              </>
            )}
            {user && profile?.role === 'employer' && (
              <>
                <Link to="/employer/dashboard" className={`navbar-link ${isActive('/employer/dashboard') ? 'active' : ''}`}>Dashboard</Link>
                <Link to="/employer/post-job" className={`navbar-link ${isActive('/employer/post-job') ? 'active' : ''}`}>Post a Job</Link>
                <Link to="/employer/manage-jobs" className={`navbar-link ${isActive('/employer/manage-jobs') ? 'active' : ''}`}>Manage Jobs</Link>
              </>
            )}
          </div>

          <div className="navbar-actions">
            {user ? (
              <>
                <div className="navbar-user">
                  <div className="navbar-avatar">{initials}</div>
                  <span style={{ fontSize: '14px', color: 'var(--color-neutral-700)', fontWeight: 500 }}>
                    {profile?.full_name || user.email}
                  </span>
                </div>
                <Link to="/profile" className="btn btn-ghost btn-sm">
                  <User size={16} />
                </Link>
                <button onClick={handleSignOut} className="btn btn-ghost btn-sm" title="Sign out">
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
              </>
            )}
          </div>

          <button className="navbar-mobile-toggle btn btn-ghost" onClick={() => setMobileOpen((o) => !o)}>
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <div className={`navbar-mobile-menu ${mobileOpen ? 'open' : ''}`}>
          <Link to="/jobs" className="navbar-link" onClick={() => setMobileOpen(false)}>Browse Jobs</Link>
          {user && profile?.role === 'job_seeker' && (
            <>
              <Link to="/dashboard" className="navbar-link" onClick={() => setMobileOpen(false)}>Dashboard</Link>
              <Link to="/my-applications" className="navbar-link" onClick={() => setMobileOpen(false)}>My Applications</Link>
              <Link to="/profile" className="navbar-link" onClick={() => setMobileOpen(false)}>Profile</Link>
            </>
          )}
          {user && profile?.role === 'employer' && (
            <>
              <Link to="/employer/dashboard" className="navbar-link" onClick={() => setMobileOpen(false)}>Dashboard</Link>
              <Link to="/employer/post-job" className="navbar-link" onClick={() => setMobileOpen(false)}>Post a Job</Link>
              <Link to="/employer/manage-jobs" className="navbar-link" onClick={() => setMobileOpen(false)}>Manage Jobs</Link>
              <Link to="/profile" className="navbar-link" onClick={() => setMobileOpen(false)}>Profile</Link>
            </>
          )}
          {user ? (
            <button onClick={() => { handleSignOut(); setMobileOpen(false); }} className="btn btn-danger btn-sm" style={{ width: 'fit-content' }}>
              <LogOut size={14} /> Sign Out
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <Link to="/login" className="btn btn-secondary btn-sm" onClick={() => setMobileOpen(false)}>Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm" onClick={() => setMobileOpen(false)}>Get Started</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
