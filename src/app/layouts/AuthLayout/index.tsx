import { FC } from 'react';
import { Outlet } from 'react-router-dom';
import logo from '@/assets/logo.svg'
import '@app/styles/auth.scss'

export const AuthLayout: FC = () => {
  return (
    <div>
      <header className="auth-header">
        <div className="logo">
          <img src={logo} className="logo" alt="logo" />
        </div>
      </header>
      <main className="auth-main">
        <Outlet />
      </main>
    </div>
  );
};