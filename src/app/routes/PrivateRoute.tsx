// src/app/routes/PrivateRoute.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from './paths';
import React from "react";

interface PrivateRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export const PrivateRoute = ({ children, adminOnly = false }: PrivateRouteProps) => {
  const { user, isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login page with return url
    return <Navigate to={ROUTES.AUTH} state={{ from: location }} replace />;
  }

  if (adminOnly && !user?.roles?.includes('admin')) {
    // Redirect unauthorized users
    return <Navigate to={ROUTES.MAIN} replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;