import { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { MainLayout } from '@/app/layouts/MainLayout';
import { AuthLayout } from '@/app/layouts/AuthLayout';
import { PrivateRoute } from './PrivateRoute';
import { PublicRoute } from './PublicRoute';
import { ROUTES } from './paths';

const MainPage = lazy(() => import('@/app/pages/Main'));
const AuthPage = lazy(() => import('@/app/pages/Auth'));
const ProfilePage = lazy(() => import('@/app/pages/Profile'));
const TestHistoryPage = lazy(() => import('@/app/pages/TestHistory'));
const TestProgressPage = lazy(() => import('@/app/pages/Test'));
const NotFoundPage = lazy(() => import('@/app/pages/NotFound'));

export const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path={ROUTES.MAIN} element={<MainPage />} />
      </Route>
      <Route element={<AuthLayout />}>
        <Route 
          path={ROUTES.AUTH} 
          element={
            <PublicRoute>
              <AuthPage />
            </PublicRoute>
          } 
        />
      </Route>
      <Route element={<MainLayout />}>
        <Route
          path={ROUTES.PROFILE}
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          }
        />
        <Route
          path={ROUTES.TEST_HISTORY}
          element={
            <PrivateRoute>
              <TestHistoryPage />
            </PrivateRoute>
          }
        />
        <Route
          path={ROUTES.TEST_PAGE}
          element={
            <PrivateRoute>
              <TestProgressPage />
            </PrivateRoute>
          }
        />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

