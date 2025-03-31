import { Navigate } from 'react-router-dom';
import { ROUTES } from './paths';
import { useUserStore } from '@/store';

interface Props {
  children: React.ReactNode;
}

export const PublicRoute = ({ children }: Props) => {
  const { user } = useUserStore()
  const isAuthenticated = user && user?.id;

  if (isAuthenticated) {
    return <Navigate to={ROUTES.MAIN} replace />;
  }

  return children;
}