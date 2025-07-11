import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import logo from '@/assets/logo.svg';
import LoginIcon from '@/assets/icons/login-icon.svg?react';
import MenuHistoryIcon from '@/assets/icons/menu-history.svg?react';
import MenuProfileIcon from '@/assets/icons/menu-profile.svg?react';
import MenuLogoutIcon from '@/assets/icons/menu-logout.svg?react';

import '@/app/styles/header.scss';
import { ROUTES } from '@/app/routes/paths';
import { useAuthStore } from '@/store/authStore';
import { useTestStore } from "@/store/testStore";
import useGetViewport from "@app/hooks/useGetViewport.ts";

export const Header = () => {
    const location = useLocation();
    const isMainPage = location.pathname === ROUTES.MAIN;

    const {viewportWidth} = useGetViewport();

    const navigate = useNavigate();
    const { user, logout, isAuthenticated } = useAuthStore();

    // Use separate selectors for each state value to avoid an infinite loop
    const isTestPage = useTestStore(state => state.isTestPage);
    const testTitle = useTestStore(state => state.testTitle);
    const isTestResultPage = useTestStore(state => state.isTestResultPage);

    const onLogout = () => {
        logout();
        if (!isMainPage) {
            navigate(ROUTES.MAIN);
        }
    };

    const hasToken = !!localStorage.getItem('auth_token');

    const userDisplayName = user?.name || user?.firstName || user?.email;

    const items: MenuProps['items'] = [
        {
            label: (
                <div className="user-dropdown__box">
                    <div className="user-dropdown__avatar"><UserOutlined /></div>
                    <div className="user-dropdown__name">{userDisplayName}</div>
                </div>
            ),
            key: '0',
        },
        {
            label: (
                <Link
                    to={ROUTES.TEST_HISTORY}
                    className="user-dropdown__item"
                >
                    <MenuHistoryIcon width={24} height={24} />
                    Історія тестів
                </Link>
            ),
            key: '1',
        },
        {
            label: (
                <Link
                    to={ROUTES.PROFILE}
                    className="user-dropdown__item"
                >
                    <MenuProfileIcon width={24} height={24} />
                    Профіль
                </Link>
            ),
            key: '2',
        },
        {
            label: (
                <div onClick={() => onLogout()} className="user-dropdown__logout">
                    <MenuLogoutIcon width={24} height={24} />
                    Вийти
                </div>
            ),
            key: '3',
        }
    ];

    return (
        <>
        <header className="header">
            <div className="header__inner">
                <div className="logo-wrapper">
                    <div className="logo">
                        {!isMainPage ? (
                            <Link to={ROUTES.MAIN}>
                                <img src={logo} className="logo" alt="logo"/>
                            </Link>
                        ) : (
                            <img src={logo} className="logo" alt="logo"/>
                        )}
                    </div>

                    {testTitle && (isTestPage && viewportWidth > 767) && (
                        <div className="test-title">Тест {testTitle}</div>
                    )}
                    {testTitle && (isTestResultPage && viewportWidth > 767) && (
                        <div className="test-title">Результат теста {testTitle}</div>
                    )}
                </div>
                {isAuthenticated && hasToken ? (
                    <Dropdown menu={{ items }} trigger={['click']}>
                        <div className="user-button">
                            <span><UserOutlined /></span>
                            {userDisplayName}
                        </div>
                    </Dropdown>
                ) : (
                    <Link
                        to={ROUTES.AUTH}
                        className="login-btn"
                    >
                        <LoginIcon width={20} height={20} />
                        Увійти
                    </Link>
                )}
            </div>
        </header>
            {testTitle && viewportWidth <= 767 && (
                <>
                    {isTestPage && (
                        <div className="test-title-mobile">Тест {testTitle}</div>
                    )}
                    {isTestResultPage && (
                        <div className="test-title-mobile">Результат теста {testTitle}</div>
                    )}
                </>
            )}
        </>
    );
};
