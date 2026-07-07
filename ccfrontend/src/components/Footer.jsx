import { Link } from 'react-router-dom';
import { Briefcase, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-brand-name">
              <Briefcase size={22} />
              Career<span>Crafter</span>
            </div>
            <p className="footer-desc">
              Connecting talented professionals with their dream careers. Your next opportunity is just a click away.
            </p>
            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--color-neutral-400)' }}>
                <Mail size={14} /> careers@careercrafter.com
              </div>
            </div>
          </div>

          <div>
            <p className="footer-heading">For Job Seekers</p>
            <ul className="footer-links">
              <li><Link to="/jobs">Browse Jobs</Link></li>
              <li><Link to="/register">Create Profile</Link></li>
              <li><Link to="/my-applications">My Applications</Link></li>
              <li><Link to="/profile">Manage Resume</Link></li>
            </ul>
          </div>

          <div>
            <p className="footer-heading">For Employers</p>
            <ul className="footer-links">
              <li><Link to="/employer/post-job">Post a Job</Link></li>
              <li><Link to="/employer/manage-jobs">Manage Listings</Link></li>
              <li><Link to="/employer/applications">View Applications</Link></li>
              <li><Link to="/register">Create Account</Link></li>
            </ul>
          </div>

          <div>
            <p className="footer-heading">Company</p>
            <ul className="footer-links">
              <li><a href="#">About Us</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copy">© {new Date().getFullYear()} CareerCrafter. A job portal for employers and candidates.</p>
          <div style={{ display: 'flex', gap: '16px' }}>
          </div>
        </div>
      </div>
    </footer>
  );
}
