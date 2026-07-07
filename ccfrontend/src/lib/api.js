const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

const TOKEN_KEY = 'cc_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request(path, { method = 'GET', body, params } = {}) {
  let url = `${API_BASE_URL}${path}`;

  if (params) {
    const query = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');
    if (query) url += `?${query}`;
  }

  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (response.status === 204) return null;

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = data?.message || data?.error || `Request failed (${response.status})`;
    const error = new Error(message);
    error.status = response.status;
    error.details = data;
    throw error;
  }

  return data;
}

export const api = {
  users: {
    register: (payload) => request('/users/register', { method: 'POST', body: payload }),
    login: (payload) => request('/users/login', { method: 'POST', body: payload }),
    getById: (id) => request(`/users/${id}`),
    update: (id, payload) => request(`/users/${id}`, { method: 'PUT', body: payload }),
    getSecurityQuestion: (payload) => request('/users/forgot-password', { method: 'POST', body: payload }),
    verifySecurityAnswer: (payload) => request('/users/verify-security-answer', { method: 'POST', body: payload }),
    resetPassword: (payload) => request('/users/reset-password', { method: 'POST', body: payload }),
  },
  jobListings: {
    getAllActive: () => request('/job-listings'),
    getById: (id) => request(`/job-listings/${id}`),
    getByEmployer: (employerId) => request(`/job-listings/employer/${employerId}`),
    search: (params) => request('/job-listings/search', { params }),
    create: (payload) => request('/job-listings', { method: 'POST', body: payload }),
    update: (id, payload) => request(`/job-listings/${id}`, { method: 'PUT', body: payload }),
    remove: (id) => request(`/job-listings/${id}`, { method: 'DELETE' }),
  },
  applications: {
    apply: (payload) => request('/applications', { method: 'POST', body: payload }),
    updateStatus: (id, status) => request(`/applications/${id}/status`, { method: 'PATCH', params: { status } }),
    getById: (id) => request(`/applications/${id}`),
    getByJobSeeker: (jobSeekerId) => request(`/applications/job-seeker/${jobSeekerId}`),
    getByJobListing: (jobListingId) => request(`/applications/job-listing/${jobListingId}`),
    withdraw: (id) => request(`/applications/${id}`, { method: 'DELETE' }),
  },
  resumes: {
    upload: (payload) => request('/resumes', { method: 'POST', body: payload }),
    update: (id, payload) => request(`/resumes/${id}`, { method: 'PUT', body: payload }),
    remove: (id) => request(`/resumes/${id}`, { method: 'DELETE' }),
    getById: (id) => request(`/resumes/${id}`),
    getByJobSeeker: (jobSeekerId) => request(`/resumes/job-seeker/${jobSeekerId}`),
    share: (id) => request(`/resumes/${id}/share`, { method: 'PATCH' }),
  },
};

const employerCache = new Map();

export async function getEmployerLabel(employerId) {
  if (!employerId) return null;
  if (employerCache.has(employerId)) return employerCache.get(employerId);
  try {
    const employer = await api.users.getById(employerId);
    const label = employer.companyName || employer.fullName || `Employer #${employerId}`;
    employerCache.set(employerId, label);
    return label;
  } catch {
    return `Employer #${employerId}`;
  }
}
