import React, { useState, useEffect } from 'react';
import { Button, Modal, Space, Typography } from 'antd';
import '../styles/CookieConsentPopup.scss';

const { Text, Link } = Typography;

const CookieConsentPopup: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    useEffect(() => {
        const cookieConsent = localStorage.getItem('cookieConsent');
        if (!cookieConsent) {
            setIsVisible(true);
        }
    }, []);

    const handleAcceptAll = () => {
        localStorage.setItem('cookieConsent', 'accepted');
        setIsVisible(false);
        console.log('All cookies accepted');
    };

    const handleRejectAll = () => {
        localStorage.setItem('cookieConsent', 'rejected');
        setIsVisible(false);
        console.log('All cookies rejected');
    };

    const openPrivacyPolicy = () => {
        window.open('/privacy-policy', '_blank');
        console.log('privacy-policy window.open() func')
    };

    return (
        <>
            <div className="cookie-demo-container">
                <Button
                    type="primary"
                    onClick={() => setIsVisible(true)}
                    className="cookie-demo-button"
                >
                    Показати Cookie Попап (для тестування)
                </Button>
            </div>

            <Modal
                open={isVisible}
                footer={null}
                closable={false}
                maskClosable={false}
                centered
                width="auto"
                className="cookie-consent-modal"
            >
                <div className="cookie-consent-content">
                    <div className="cookie-consent-message">
                        <Text className="cookie-consent-text">
                            Ми використовуємо файли cookie переважно для аналітики, щоб покращити ваш досвід.
                            Погоджуючись, ви погоджуєтеся на використання нами цих файлів cookie.
                            Ви можете керувати своїми налаштуваннями або дізнатися більше про нашу{' '}
                            <Link
                                onClick={openPrivacyPolicy}
                                className="cookie-consent-inline-link"
                            >
                                політику щодо файлів cookie
                            </Link>
                            .
                        </Text>
                    </div>

                    <div className="cookie-consent-privacy-link">
                        <Link
                            onClick={openPrivacyPolicy}
                            className="cookie-consent-privacy-link-text"
                        >
                            Політика конфіденціальності
                        </Link>
                    </div>

                    <Space
                        direction="horizontal"
                        size="middle"
                        className="cookie-consent-buttons"
                    >
                        <Button
                            onClick={handleRejectAll}
                            className="cookie-consent-button cookie-consent-button--reject"
                        >
                            Відхилити всі
                        </Button>
                        <Button
                            type="primary"
                            onClick={handleAcceptAll}
                            className="cookie-consent-button cookie-consent-button--accept"
                        >
                            Прийняти всі
                        </Button>
                    </Space>
                </div>
            </Modal>
        </>
    );
};

export default CookieConsentPopup;