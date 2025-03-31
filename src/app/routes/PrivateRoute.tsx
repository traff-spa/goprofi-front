import { Navigate } from 'react-router-dom';
import { ROUTES } from './paths';
import { useUserStore } from '@/store';

interface Props {
  children: React.ReactNode;
}

export const PrivateRoute = ({ children }: Props) => {
  // const isAuthenticated = useAuth(); // TODO
  const { user } = useUserStore()
  // const isAuthenticated = user && user?.id;
  const isAuthenticated = true;

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.AUTH} replace />;
  }

  return children;
}