import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'employee' | 'manager' | 'admin';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { token, user } = useAuthStore();
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole) {
    const hasRequiredRole = 
      requiredRole === 'employee' || 
      (requiredRole === 'manager' && (user?.role === 'manager' || user?.role === 'admin')) ||
      (requiredRole === 'admin' && user?.role === 'admin');
    
    if (!hasRequiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }
  
  return <>{children}</>;
}
