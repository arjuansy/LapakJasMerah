import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Memuat sesi...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/register" replace />;
  }

  // Auto redirect Admin to dashboard if they try to access normal protected routes?
  // Actually, admins can use the marketplace too, but if we strictly want them in admin:
  if (profile && (profile.role === 'ADMIN' || profile.role === 'SUPER_ADMIN')) {
    // We could redirect them, but maybe they just want to buy stuff.
    // The requirement says "redirect based on role if ADMIN -> /admin/dashboard".
    // We will do that at the AuthPage level instead of blocking them from the marketplace entirely.
  }

  return <>{children}</>;
};
