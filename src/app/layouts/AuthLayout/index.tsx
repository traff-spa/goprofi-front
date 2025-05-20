import { FC } from 'react';
import { Link } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import logo from '@/assets/logo.svg';
import '@/app/styles/auth.scss';
import { ROUTES } from '@/app/routes/paths';

export const AuthLayout: FC = () => {
    return (
        <div className="auth-layout">
            <header className="auth-header">
                <div className="logo">
                    <Link to={ROUTES.MAIN}>
                        <img src={logo} className="logo" alt="logo" />
                    </Link>
                </div>
            </header>
            <main className="auth-main">
                <Outlet />
            </main>
        </div>
    );
};
