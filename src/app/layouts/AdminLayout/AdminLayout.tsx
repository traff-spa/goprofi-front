import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Header } from '@/app/layouts/MainLayout/Header';
import { Footer } from '@/app/layouts/MainLayout/Footer';
import { ROUTES } from '@/app/routes/paths';

export const AdminLayout: React.FC = () => {
    const location = useLocation();
    debugger;

    // Admin sidebar navigation links
    const navLinks = [
        { path: ROUTES.ADMIN, label: 'Dashboard', exact: true },
        { path: `${ROUTES.ADMIN}/tests`, label: 'Manage Tests' },
        { path: `${ROUTES.ADMIN}/users`, label: 'User Statistics' },
        { path: `${ROUTES.ADMIN}/deleted-tests`, label: 'Deleted Tests' }
    ];

    const isActivePath = (path: string, exact: boolean = false) => {
        if (exact) {
            return location.pathname === path;
        }
        return location.pathname.startsWith(path);
    };

    return (
        <div className="admin-layout">
            <Header />
            <div className="admin-layout__container">
                {/* Sidebar */}
                <aside className="admin-sidebar">
                    <nav className="admin-sidebar__nav">
                        <ul className="admin-sidebar__menu">
                            {navLinks.map((link) => (
                                <li key={link.path} className="admin-sidebar__item">
                                    <Link
                                        to={link.path}
                                        className={`admin-sidebar__link ${
                                            isActivePath(link.path, link.exact) ? 'active' : ''
                                        }`}
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </aside>

                {/* Main content */}
                <main className="admin-layout__content">
                    <Outlet />
                </main>
            </div>
            <Footer />
        </div>
    );
};