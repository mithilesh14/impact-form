import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, profile, loading } = useAuth();

  console.log('ProtectedRoute - Auth state:', { user: !!user, profile, loading, allowedRoles });

  if (loading) {
    console.log('ProtectedRoute - Still loading...');
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !profile) {
    console.log('ProtectedRoute - No user or profile, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    console.log('ProtectedRoute - Role not allowed:', profile.role, 'allowed:', allowedRoles);
    // Redirect based on role
    if (profile.role === 'client') {
      return <Navigate to="/sections" replace />;
    } else if (profile.role === 'Admin') {
      return <Navigate to="/admin" replace />;
    } else if (profile.role === 'Reviewer') {
      return <Navigate to="/reviewer" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  console.log('ProtectedRoute - Rendering children');
  return <>{children}</>;
};

export default ProtectedRoute;