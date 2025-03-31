import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { ROUTES } from '@app/routes/paths'
import logo from '@/assets/logo.svg'
import '@app/styles/header.scss'
import LoginIcon from '@/assets/icons/login-icon.svg?react';
import MenuHistoryIcon from '@/assets/icons/menu-history.svg?react';
import MenuProfileIcon from '@/assets/icons/menu-profile.svg?react';
import MenuLogoutIcon from '@/assets/icons/menu-logout.svg?react';
import { useUserStore } from '@/store';

export const Header = () => {
  const location = useLocation();
  const isMainPage = location.pathname === ROUTES.MAIN;

  const navigate = useNavigate()
  const { user, clearUser } = useUserStore()

  const onLogout = () => {
    clearUser()
    if (!isMainPage) {
      navigate(ROUTES.MAIN)
    }
  }

  const items: MenuProps['items'] = [
    {
      label: (
        <div className="user-dropdown__box">
          <div className="user-dropdown__avatar"><UserOutlined /></div>
          <div className="user-dropdown__name">{user?.name || user?.email}</div>
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
  ]
  
  return (
    <header className="header">
      <div className="header__inner">
        <div className="logo">
          {!isMainPage ? (
            <Link to={ROUTES.MAIN} >
              <img src={logo} className="logo" alt="logo" />
            </Link>
          ) : (
            <img src={logo} className="logo" alt="logo" />
          )}
        </div>
        {user?.id ? (
          <Dropdown menu={{ items }} trigger={['click']}>
            <div className="user-button">
              <span><UserOutlined /></span>
              {user?.name}
            </div>
          </Dropdown>
        ) : (
          <Link 
            to={ROUTES.AUTH} 
            className="login-btn"
          >
            <LoginIcon width={20} height={20} />
            Увiйти
          </Link>
        )}
      </div>
    </header>
  )
}