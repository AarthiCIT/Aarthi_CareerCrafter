import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Briefcase, TrendingUp, Users, Building2, Award, ArrowRight, Code, Stethoscope, DollarSign, Lightbulb, GraduationCap, Truck } from 'lucide-react';

const categories = [
  { name: 'Technology', icon: Code, color: '#eff6ff', iconColor: '#2563eb', count: '1,240' },
  { name: 'Healthcare', icon: Stethoscope, color: '#f0fdf4', iconColor: '#16a34a', count: '890' },
  { name: 'Finance', icon: DollarSign, color: '#fffbeb', iconColor: '#b45309', count: '620' },
  { name: 'Education', icon: GraduationCap, color: '#f5f3ff', iconColor: '#7c3aed', count: '430' },
  { name: 'Marketing', icon: TrendingUp, color: '#fff7ed', iconColor: '#ea580c', count: '380' },
  { name: 'Logistics', icon: Truck, color: '#f0fdf4', iconColor: '#0891b2', count: '290' },
];

const featuredJobs = [
  { id: 1, title: 'Senior Frontend Developer', company: 'TCS', location: 'Bangalore, KA', type: 'Full-time', salary: '₹12L - ₹15L', posted: '2 days ago', logo: 'T' },
  { id: 2, title: 'Product Manager', company: 'Infosys', location: 'Pune, MH', type: 'Full-time', salary: '₹10L - ₹13L', posted: '1 day ago', logo: 'I' },
  { id: 3, title: 'UX Designer', company: 'Accenture', location: 'Remote', type: 'Remote', salary: '₹8L - ₹11L', posted: '3 days ago', logo: 'A' },
];

const steps = [
  { num: 1, title: 'Create Your Profile', desc: 'Sign up and build a compelling profile that highlights your skills, experience, and career goals.' },
  { num: 2, title: 'Discover Opportunities', desc: 'Browse thousands of job listings tailored to your skills and preferences with our smart search.' },
  { num: 3, title: 'Apply with Ease', desc: 'Submit applications directly through the platform with your resume and personalized cover letter.' },
  { num: 4, title: 'Land Your Dream Job', desc: 'Track your applications, receive updates, and connect with employers who value your talent.' },
];

export default function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLocation, setSearchLocation] = useState('');

  function handleSearch(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (searchLocation) params.set('location', searchLocation);
    navigate(`/jobs?${params.toString()}`);
  }

  return (
    <div>
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">
              <TrendingUp size={14} /> Over 50,000 jobs available right now
            </div>
            <h1>
              Find Your Perfect <span>Career</span> Match Today
            </h1>
            <p>
              CareerCrafter connects ambitious professionals with top companies. Search thousands of jobs, build your profile, and land your dream role.
            </p>
            <form className="hero-search" onSubmit={handleSearch}>
              <Search size={18} style={{ color: 'var(--color-neutral-400)', flexShrink: 0, margin: '0 4px' }} />
              <input
                type="text"
                placeholder="Job title, keywords, or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div style={{ width: '1px', background: 'var(--color-neutral-200)', height: '28px' }} />
              <MapPin size={16} style={{ color: 'var(--color-neutral-400)', flexShrink: 0, margin: '0 4px' }} />
              <input
                type="text"
                placeholder="City, state or Remote"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                style={{ flex: '0 0 160px' }}
              />
              <button type="submit" className="btn btn-primary">
                Search Jobs
              </button>
            </form>

            <div className="hero-stats">
              <div>
                <div className="hero-stat-value">500+</div>
                <div className="hero-stat-label">Active Jobs</div>
              </div>
              <div>
                <div className="hero-stat-value">100+</div>
                <div className="hero-stat-label">Companies</div>
              </div>
              <div>
                <div className="hero-stat-value">2k+</div>
                <div className="hero-stat-label">Job Seekers</div>
              </div>
              <div>
                <div className="hero-stat-value">95%</div>
                <div className="hero-stat-label">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Job Categories */}
      <section className="home-section" style={{ background: '#fff' }}>
        <div className="container">
          <h2 className="home-section-title">Explore Job Categories</h2>
          <p className="home-section-subtitle">Discover opportunities across the most in-demand industries</p>
          <div className="grid-3" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <div
                  key={cat.name}
                  className="category-card"
                  onClick={() => navigate(`/jobs?category=${cat.name}`)}
                >
                  <div className="category-card-icon" style={{ background: cat.color }}>
                    <Icon size={24} color={cat.iconColor} />
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--color-neutral-800)' }}>{cat.name}</div>
                  <div className="category-count">{cat.count} jobs</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="home-section">
        <div className="container">
          <div className="section-header">
            <h2 className="home-section-title" style={{ textAlign: 'left', marginBottom: 0 }}>Featured Jobs</h2>
            <Link to="/jobs" className="btn btn-secondary btn-sm">
              View All Jobs <ArrowRight size={14} />
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
            {featuredJobs.map((job) => (
              <div key={job.id} className="job-card" style={{ flexDirection: 'row', alignItems: 'center' }}>
                <div className="job-card-logo" style={{ flexShrink: 0 }}>{job.logo}</div>
                <div style={{ flex: 1 }}>
                  <div className="job-card-title">{job.title}</div>
                  <div className="job-card-company">{job.company}</div>
                  <div className="job-card-meta" style={{ marginTop: '6px' }}>
                    <span className="job-card-meta-item"><MapPin size={12} /> {job.location}</span>
                    <span className="badge badge-blue">{job.type}</span>
                    <span style={{ fontSize: '12px', color: 'var(--color-neutral-400)' }}>{job.posted}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div className="job-card-salary">{job.salary}</div>
                  <Link to="/jobs" className="btn btn-primary btn-sm" style={{ marginTop: '8px' }}>Apply Now</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="home-section" style={{ background: 'var(--color-neutral-50)' }}>
        <div className="container">
          <h2 className="home-section-title">How CareerCrafter Works</h2>
          <p className="home-section-subtitle">Get started in four simple steps</p>
          <div className="grid-4">
            {steps.map((step) => (
              <div key={step.num} className="step-card">
                <div className="step-number">{step.num}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section style={{ background: 'var(--color-primary-800)', color: '#fff', padding: '48px 0' }}>
        <div className="container">
          <div className="grid-4" style={{ textAlign: 'center' }}>
            {[
              { icon: Briefcase, value: '50,000+', label: 'Job Listings' },
              { icon: Building2, value: '12,000+', label: 'Companies Hiring' },
              { icon: Users, value: '2M+', label: 'Registered Users' },
              { icon: Award, value: '500K+', label: 'Successful Hires' },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label}>
                  <Icon size={32} style={{ margin: '0 auto 12px', opacity: 0.8 }} />
                  <div style={{ fontSize: '32px', fontWeight: 700, marginBottom: '4px' }}>{s.value}</div>
                  <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>{s.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container">
          <h2>Ready to Take the Next Step?</h2>
          <p>Join thousands of professionals who found their dream jobs through CareerCrafter</p>
          <div className="cta-buttons">
            <Link to="/register" className="btn btn-lg" style={{ background: '#fff', color: 'var(--color-primary-700)' }}>
              Find a Job <ArrowRight size={18} />
            </Link>
            <Link to="/register" className="btn btn-lg btn-secondary" style={{ borderColor: 'rgba(255,255,255,0.5)', color: '#fff', background: 'rgba(255,255,255,0.1)' }}>
              Post a Job
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
