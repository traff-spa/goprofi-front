import { FC } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { ROUTES } from '@/app/routes/paths';
import CookieConsentPopup from "@/app/components/Modals/CookieConsentPopup";

export const MainLayout: FC = () => {
    const location = useLocation();
    const isMainPage = location.pathname === ROUTES.MAIN;

    return (
        <div className="main-layout">
            <Header />
            <main className={isMainPage ? 'main-page' : 'main-layout__content'}>
                <Outlet />
            </main>
            <CookieConsentPopup/>
            {isMainPage && <Footer />}
        </div>
    );
};