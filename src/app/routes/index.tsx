import { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { MainLayout } from '@/app/layouts/MainLayout/MainLayout';
import { AuthLayout } from '@/app/layouts/AuthLayout';
import { AdminLayout } from '@/app/layouts/AdminLayout/AdminLayout';
import { PrivateRoute } from './PrivateRoute';
import { PublicRoute } from './PublicRoute';
import { ROUTES } from './paths';

// Lazy-loaded pages
const MainPage = lazy(() => import('@/app/pages/Main'));
const AuthPage = lazy(() => import('@/app/pages/Auth'));
const ProfilePage = lazy(() => import('@/app/pages/Profile'));
const TestHistoryPage = lazy(() => import('@/app/pages/TestHistory'));
const TestPage = lazy(() => import('@/app/pages/Test'));
const TestResultPage = lazy(() => import('@/app/pages/TestResult'));
const PrivacyPolicy = lazy(() => import('@/app/pages/PrivacyPolicy'));
const PublicOfferAgreement  = lazy(() => import("@app/pages/PublicOfferAgreement"));

const NotFoundPage = lazy(() => import('@/app/pages/NotFound'));

export const AppRoutes = () => {
    return (
        <Routes>
            <Route element={<MainLayout />}>
                <Route path={ROUTES.MAIN} element={<MainPage />} />
                <Route path={ROUTES.POLICY} element={<PrivacyPolicy />} />
                <Route path={ROUTES.OFFER} element={<PublicOfferAgreement/>} />
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
                    path={`${ROUTES.TEST_HISTORY}/:id`}
                    element={
                        <PrivateRoute>
                            <TestResultPage />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/test/:id"
                    element={
                        <PrivateRoute>
                            <TestPage />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/results/:id"
                    element={
                        <PrivateRoute>
                            <TestResultPage />
                        </PrivateRoute>
                    }
                />
            </Route>

            {/* Admin routes */}
            <Route
                path={ROUTES.ADMIN}
                element={
                    <PrivateRoute adminOnly>
                        <AdminLayout />
                    </PrivateRoute>
                }
            >
                <Route index element={<div>Admin Dashboard</div>} />
                <Route path="tests" element={<div>Admin Tests Management</div>} />
                <Route path="users" element={<div>Admin User Management</div>} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
};