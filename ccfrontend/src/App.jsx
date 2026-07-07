import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import JobSearch from './pages/JobSearch';
import JobDetail from './pages/JobDetail';
import ApplyJob from './pages/ApplyJob';
import MyApplications from './pages/MyApplications';
import Profile from './pages/Profile';
import JobSeekerDashboard from './pages/JobSeekerDashboard';
import EmployerDashboard from './pages/EmployerDashboard';
import PostJob from './pages/PostJob';
import ManageJobs from './pages/ManageJobs';
import ViewApplications from './pages/ViewApplications';

function AuthRedirect({ children }) {
  const { user, profile, loading } = useAuth();
  if (loading) return <div className="loader-overlay"><div className="spinner" /></div>;
  if (user && profile) {
    return <Navigate to={profile.role === 'employer' ? '/employer/dashboard' : '/dashboard'} replace />;
  }
  return children;
}

function Layout({ children, noFooter }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      {!noFooter && <Footer />}
    </>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Layout><Home /></Layout>} />
      <Route path="/jobs" element={<Layout><JobSearch /></Layout>} />
      <Route path="/jobs/:id" element={<Layout><JobDetail /></Layout>} />

      {/* Auth (redirect if logged in) */}
      <Route path="/login" element={<AuthRedirect><Login /></AuthRedirect>} />
      <Route path="/register" element={<AuthRedirect><Register /></AuthRedirect>} />
      <Route path="/forgot-password" element={<AuthRedirect><ForgotPassword /></AuthRedirect>} />
      <Route path="/reset-password" element={<AuthRedirect><ResetPassword /></AuthRedirect>} />

      {/* Job Seeker Protected */}
      <Route path="/dashboard" element={
        <ProtectedRoute requiredRole="job_seeker">
          <Layout><JobSeekerDashboard /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/jobs/:id/apply" element={
        <ProtectedRoute requiredRole="job_seeker">
          <Layout><ApplyJob /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/my-applications" element={
        <ProtectedRoute requiredRole="job_seeker">
          <Layout><MyApplications /></Layout>
        </ProtectedRoute>
      } />

      {/* Employer Protected */}
      <Route path="/employer/dashboard" element={
        <ProtectedRoute requiredRole="employer">
          <Layout><EmployerDashboard /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/employer/post-job" element={
        <ProtectedRoute requiredRole="employer">
          <Layout><PostJob /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/employer/manage-jobs" element={
        <ProtectedRoute requiredRole="employer">
          <Layout><ManageJobs /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/employer/applications" element={
        <ProtectedRoute requiredRole="employer">
          <Layout><ViewApplications /></Layout>
        </ProtectedRoute>
      } />

      {/* Shared Protected */}
      <Route path="/profile" element={
        <ProtectedRoute>
          <Layout><Profile /></Layout>
        </ProtectedRoute>
      } />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
