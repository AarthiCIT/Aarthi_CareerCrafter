import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, getEmployerLabel } from '../lib/api';
import { Search, MapPin, Briefcase, DollarSign, Filter, AlertCircle, Building2 } from 'lucide-react';

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Remote', 'Internship'];

function formatSalary(salary) {
  if (!salary) return null;
  if (salary >= 100000) {
    return `₹${(salary / 100000).toFixed(1)}L / year`;
  }
  return `₹${salary.toLocaleString('en-IN')} / year`;
}

export default function JobSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, selectedTypes, sortBy]);

  async function fetchJobs() {
    setLoading(true);
    setError('');
    try {
      const qParam = searchParams.get('q');
      const locParam = searchParams.get('location');

      let results = qParam || locParam
        ? await api.jobListings.search({ jobTitle: qParam, location: locParam })
        : await api.jobListings.getAllActive();

      results = results.filter((job) => job.active);

      if (selectedTypes.length > 0) {
        results = results.filter((job) => selectedTypes.includes(job.employmentType));
      }
      if (sortBy === 'salary') {
        results = [...results].sort((a, b) => (b.salary || 0) - (a.salary || 0));
      }

      setJobs(results);

      const uniqueEmployerIds = [...new Set(results.map((j) => j.employerId))];
      const entries = await Promise.all(
        uniqueEmployerIds.map(async (id) => [id, await getEmployerLabel(id)])
      );
      setCompanies(Object.fromEntries(entries));
    } catch (err) {
      setError(err.message || 'Failed to load jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e) {
    e.preventDefault();
    const params = {};
    if (query) params.q = query;
    if (location) params.location = location;
    setSearchParams(params);
  }

  function toggleType(type) {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }

  return (
    <div>
      <div className="search-header">
        <div className="container">
          <h1>Find Your Next Opportunity</h1>
          <p>Browse {jobs.length}+ active job listings from top companies</p>
          <form className="search-bar" onSubmit={handleSearch}>
            <Search size={18} style={{ color: 'var(--color-neutral-400)', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Job title, skills, or company..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <MapPin size={16} style={{ color: 'var(--color-neutral-400)', flexShrink: 0, marginLeft: '8px' }} />
            <input
              type="text"
              placeholder="Location or Remote"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={{ flex: '0 0 180px' }}
            />
            <button type="submit" className="btn btn-primary">Search</button>
          </form>
        </div>
      </div>

      <div className="search-body">
        <div className="container">
          <div className="search-layout">
            <aside className="filter-panel">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <Filter size={16} color="var(--color-neutral-700)" />
                <span style={{ fontWeight: 600, fontSize: '15px', color: 'var(--color-neutral-800)' }}>Filters</span>
                {selectedTypes.length > 0 && (
                  <button
                    onClick={() => setSelectedTypes([])}
                    style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--color-primary-600)', fontWeight: 500 }}
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div className="filter-section">
                <p className="filter-title">Job Type</p>
                {JOB_TYPES.map((type) => (
                  <div key={type} className="filter-option">
                    <input
                      type="checkbox"
                      id={type}
                      checked={selectedTypes.includes(type)}
                      onChange={() => toggleType(type)}
                    />
                    <label htmlFor={type}>{type}</label>
                  </div>
                ))}
              </div>

              <div className="divider" />

              <div className="filter-section">
                <p className="filter-title">Sort By</p>
                {[
                  { value: 'newest', label: 'Default' },
                  { value: 'salary', label: 'Highest Salary' },
                ].map((opt) => (
                  <div key={opt.value} className="filter-option">
                    <input
                      type="radio"
                      id={opt.value}
                      name="sortBy"
                      checked={sortBy === opt.value}
                      onChange={() => setSortBy(opt.value)}
                      style={{ accentColor: 'var(--color-primary-600)' }}
                    />
                    <label htmlFor={opt.value}>{opt.label}</label>
                  </div>
                ))}
              </div>
            </aside>

            <main>
              <div className="jobs-header">
                <span className="jobs-count">
                  {loading ? 'Loading...' : `${jobs.length} job${jobs.length !== 1 ? 's' : ''} found`}
                </span>
              </div>

              {error && (
                <div className="alert alert-error" style={{ marginBottom: '16px' }}>
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
                  <div className="spinner" />
                </div>
              ) : jobs.length === 0 ? (
                <div className="empty-state">
                  <Briefcase size={48} />
                  <h3>No jobs found</h3>
                  <p>Try adjusting your search filters or keywords</p>
                </div>
              ) : (
                <div className="jobs-grid">
                  {jobs.map((job) => {
                    const salary = formatSalary(job.salary);
                    const company = companies[job.employerId] || 'Company';
                    const logo = (company || 'J')[0].toUpperCase();
                    const skills = job.qualifications ? job.qualifications.split(',').slice(0, 4) : [];
                    return (
                      <Link to={`/jobs/${job.id}`} key={job.id} style={{ textDecoration: 'none' }}>
                        <div className="job-card">
                          <div className="job-card-top">
                            <div style={{ display: 'flex', gap: '12px' }}>
                              <div className="job-card-logo">{logo}</div>
                              <div>
                                <div className="job-card-title">{job.jobTitle}</div>
                                <div className="job-card-company">
                                  <Building2 size={12} style={{ display: 'inline', marginRight: 4 }} />
                                  {company}
                                </div>
                              </div>
                            </div>
                            <span className={`badge ${job.employmentType === 'Remote' ? 'badge-green' : 'badge-blue'}`}>
                              {job.employmentType}
                            </span>
                          </div>
                          <div className="job-card-meta">
                            <span className="job-card-meta-item"><MapPin size={12} /> {job.location}</span>
                            {job.industry && <span className="job-card-meta-item">{job.industry}</span>}
                          </div>
                          {skills.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                              {skills.map((s) => (
                                <span key={s} className="badge badge-gray">{s.trim()}</span>
                              ))}
                            </div>
                          )}
                          <div className="job-card-footer">
                            <span className="job-card-salary">
                              {salary ? <><DollarSign size={12} style={{ display: 'inline' }} /> {salary}</> : 'Salary not disclosed'}
                            </span>
                            <span className="btn btn-sm btn-primary">View Job</span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
