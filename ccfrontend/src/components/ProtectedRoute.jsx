import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="loader-overlay">
        <div className="spinner" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole && profile?.role !== requiredRole) {
    const redirect = profile?.role === 'employer' ? '/employer/dashboard' : '/dashboard';
    return <Navigate to={redirect} replace />;
  }

  return children;
}
