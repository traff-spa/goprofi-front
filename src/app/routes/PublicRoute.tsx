import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from './paths';
import React from "react";

interface PublicRouteProps {
  children: React.ReactNode;
}

export const PublicRoute = ({ children }: PublicRouteProps) => {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to={ROUTES.MAIN} replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;