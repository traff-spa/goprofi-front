import {useEffect, useState} from 'react';
import {Modal, message} from 'antd';
import {UserOutlined, GoogleOutlined, MailOutlined} from '@ant-design/icons';
import {useAuthStore} from '@/store/authStore';
import {authService} from '@/app/api/services';
import '@/app/styles/profile.scss';

const Profile = () => {
    const [googleModalVisible, setGoogleModalVisible] = useState(false);
    const { user, setUser } = useAuthStore();

    useEffect(() => {
        // Refresh user data when the profile page loads
        const fetchCurrentUser = async () => {
            try {
                const { user: currentUser } = await authService.getCurrentUser();
                setUser(currentUser);
            } catch (error) {
                console.error('Failed to fetch current user:', error);
                message.error('Не вдалося завантажити дані профілю');
            }
        };

        fetchCurrentUser();
    }, [setUser]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const connectSuccess = params.get('connect_success');
        const token = params.get('token');

        if (connectSuccess === 'true' || token) {
            // If we got a new token, use it
            if (token) {
                localStorage.setItem('auth_token', token);
            }

            // Force refresh user data to get updated Google status
            authService.getCurrentUser()
                .then(response => {
                    setUser(response.user);
                    message.success('Google акаунт успішно підключено!');
                })
                .catch(error => {
                    message.error('Не вдалося оновити дані профілю', error);
                })
                .finally(() => {
                    // Clean up URL parameters
                    window.history.replaceState({}, document.title, window.location.pathname);
                });
        }
    }, [setUser]);

    const handleSendVerificationEmail = () => {
        message.info('Лист верифікації надіслано. Будь ласка, перевірте вашу поштову скриньку.');
        // Here you would normally call an API endpoint to send a verification email
    };

    const showGoogleModal = () => {
        setGoogleModalVisible(true);
    };

    const hideGoogleModal = () => {
        setGoogleModalVisible(false);
    };

    const handleGoogleConnect = () => {
        // Initiate the Google connection flow
        authService.connectGoogleAccount();
        hideGoogleModal();
    };

    if (!user) {
        return (
            <div className="profile">
                <div className="profile__inner"
                     style={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px'}}>
                    <div>Не вдалося завантажити дані користувача. Будь ласка, спробуйте пізніше.</div>
                </div>
            </div>
        );
    }

    const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Не вказано';

// Fix for the formatRoleName function
    const formatRoleName = (role: string) => {
        const roleMap: Record<string, string> = {
            'user': 'Користувач',
            'admin': 'Адміністратор',
            'moderator': 'Модератор'
        };

        return roleMap[role] || role.charAt(0).toUpperCase() + role.slice(1);
    };

    // removed user.id for now, no clear understanding of what it is for
    return (
        <div className="profile">
            <div className="profile__inner">
                <div className="profile__header">
                    <div className="profile__avatar">
                        <UserOutlined style={{fontSize: 48}}/>
                    </div>
                    <div>
                        <div className="profile__title">{fullName}</div>
                        <div className="profile__email">{user.email}</div>
                        <div className="profile__verification">
                            {user.isEmailVerified ? (
                                <div className="profile__verification-tag verified">
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
                                         xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M8 0C3.6 0 0 3.6 0 8C0 12.4 3.6 16 8 16C12.4 16 16 12.4 16 8C16 3.6 12.4 0 8 0ZM7 11.4L3.6 8L5 6.6L7 8.6L11 4.6L12.4 6L7 11.4Z"
                                            fill="#006654"/>
                                    </svg>
                                    Email Верифіковано
                                </div>
                            ) : (
                                <div className="profile__verification-tag not-verified">
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
                                         xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M8 0C3.6 0 0 3.6 0 8C0 12.4 3.6 16 8 16C12.4 16 16 12.4 16 8C16 3.6 12.4 0 8 0ZM12 10.4L10.4 12L8 9.6L5.6 12L4 10.4L6.4 8L4 5.6L5.6 4L8 6.4L10.4 4L12 5.6L9.6 8L12 10.4Z"
                                            fill="#F44"/>
                                    </svg>
                                    Email не верифіковано
                                </div>
                            )}
                            {user.googleId && (
                                <div className="profile__verification-tag google">
                                    <GoogleOutlined/>
                                    Google підключено
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="profile__details">
                    <div className="profile__details-title">Інформація про користувача</div>
                    <div className="profile__details-group">
                        <div className="profile__details-item">
                            <div className="profile__details-item-label">Email</div>
                            <div className="profile__details-item-value">{user.email}</div>
                        </div>
                        <div className="profile__details-item">
                            <div className="profile__details-item-label">Ім'я</div>
                            <div className="profile__details-item-value">{user.firstName || 'Не вказано'}</div>
                        </div>
                        <div className="profile__details-item">
                            <div className="profile__details-item-label">Прізвище</div>
                            <div className="profile__details-item-value">{user.lastName || 'Не вказано'}</div>
                        </div>
                        <div className="profile__details-item">
                            <div className="profile__details-item-label">Верифікація email</div>
                            <div className="profile__details-item-value">
                                {user.isEmailVerified ? 'Верифіковано' : 'Не верифіковано'}
                            </div>
                        </div>
                        <div className="profile__details-item">
                            <div className="profile__details-item-label">Google акаунт</div>
                            <div className="profile__details-item-value">
                                {user.googleId ? 'Підключено' : 'Не підключено'}
                            </div>
                        </div>
                        <div className="profile__details-item">

                            <div className="profile__details-item-label">Ролі</div>
                            <div className="profile__details-item-value">
                                {user.roles && user.roles.length > 0
                                    ? user.roles.map(role => formatRoleName(role)).join(', ')
                                    : 'Стандартний користувач'
                                }
                            </div>
                        </div>
                    </div>
                    {/*  <div className="profile__details-item">*/}
                    {/*    <div className="profile__details-item-label">Ролі</div>*/}
                    {/*    <div className="profile__details-item-value">*/}
                    {/*      {user.roles && user.roles.length > 0*/}
                    {/*          ? user.roles.map(role => formatRoleName(role)).join(', ')*/}
                    {/*          : 'Стандартний користувач'*/}
                    {/*      }*/}
                    {/*    </div>*/}
                    {/*  </div>*/}
                </div>

                <div className="profile__actions">
                    {!user.isEmailVerified && (
                        <button
                            className="primary"
                            onClick={handleSendVerificationEmail}
                        >
                            <MailOutlined/>
                            Верифікувати Email
                        </button>
                    )}

                    {!user.googleId && (
                        <button
                            className="secondary"
                            onClick={showGoogleModal}
                        >
                            <GoogleOutlined/>
                            Підключити Google
                        </button>
                    )}

                    {/*<button className="secondary"> // TODO: Add edit profile functionality */}
                    {/*  <EditOutlined />*/}
                    {/*  Редагувати профіль*/}
                    {/*</button>*/}

                    {/*<button className="danger">*/}
                    {/*  <LockOutlined />*/}
                    {/*  Змінити пароль*/}
                    {/*</button>*/}
                </div>
            </div>

            {/* Google Connect Modal */}
            <Modal
                title="Підключення Google акаунту"
                open={googleModalVisible}
                onCancel={hideGoogleModal}
                footer={null}
                centered
            >
                <div className="google-modal__content">
                    <div className="google-modal__content-icon">
                        <GoogleOutlined/>
                    </div>

                    <div className="google-modal__content-title">
                        Підключіть свій Google акаунт
                    </div>

                    <div className="google-modal__content-text">
                        Підключення Google акаунту надає такі переваги:
                    </div>

                    <ul className="google-modal__content-list">
                        <li>Легший та швидший вхід</li>
                        <li>Автоматична верифікація email</li>
                        <li>Підвищена безпека облікового запису</li>
                    </ul>

                    <button
                        className="google-modal__content-button"
                        onClick={handleGoogleConnect}
                    >
                        <GoogleOutlined/>
                        Підключити Google
                    </button>

                    <div className="google-modal__content-note">
                        Вас буде перенаправлено на сторінку Google для завершення процесу.
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Profile;