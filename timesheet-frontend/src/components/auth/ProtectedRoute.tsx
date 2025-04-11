import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'employee' | 'manager' | 'admin';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { token, user, fetchCurrentUser } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    // If we have a token but no user, fetch the user data
    if (token && !user) {
      fetchCurrentUser();
    }
  }, [token, user, fetchCurrentUser]);

  // If there's no token, redirect to login
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If we're still loading or waiting for user data, you could show a loading spinner
  if (!user) {
    return <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-navy-600 border-t-transparent"></div>
    </div>;
  }

  // If a specific role is required, check if the user has it
  if (requiredRole) {
    const hasRequiredRole = 
      requiredRole === 'admin' ? user.role === 'admin' :
      requiredRole === 'manager' ? (user.role === 'manager' || user.role === 'admin') :
      true; // 'employee' role - everyone has access

    if (!hasRequiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // If all checks pass, render the protected content
  return <>{children}</>;
}
