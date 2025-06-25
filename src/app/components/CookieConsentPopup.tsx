import React, {useState, useEffect} from 'react';
import {Button, Modal, Typography} from 'antd';
import Cookies from 'js-cookie';

import '../styles/CookieConsentPopup.scss';
import useGetViewport from "@app/hooks/useGetViewport.ts";

const {Text, Link} = Typography;

const CookieConsentPopup: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [loading, setLoading] = React.useState<boolean>(true);
    const {viewportWidth} = useGetViewport();

    /**
     * Remove all available cookies except the httpOnly.
     */
    function rejectAllCookies(): void {
        const allCookies = Cookies.get(); // { name: value }

        Object.keys(allCookies).forEach((cookieName) => {

            Cookies.remove(cookieName);
            Cookies.remove(cookieName, { path: '/' });
        });
    }

    const cookieConsent = localStorage.getItem('cookieConsent');

    useEffect(() => {
        if (!cookieConsent) {
            setIsVisible(true)
            setLoading(true);
            document.body.style.setProperty('overflow-y', 'auto', 'important');

            setTimeout(() => {
                setLoading(false);
            }, 1000);
        }
    }, [cookieConsent]);

    const handleAcceptAll = () => {
        localStorage.setItem('cookieConsent', 'accepted');
        setIsVisible(false);
    };

    const handleRejectAll = () => {
        localStorage.setItem('cookieConsent', 'rejected');
        rejectAllCookies()
        setIsVisible(false);
    };

    const openPrivacyPolicy = () => {
        window.open('/privacy-policy', '_blank');
    };

    return (
        <>
            <Modal
                open={isVisible}
                footer={null}
                closable={false}
                width="auto"
                mask={false}
                loading={loading}
                className="cookie-consent-modal"
            >
                <div className='text'>
                    <div className="cookie-consent-title">
                        <Text className="cookie-consent-title-text">
                            We use cookies 🍪
                        </Text>
                    </div>

                    <div className="cookie-consent-message">
                        <Text className="cookie-consent-text">
                            We use cookies primarily for analytics to enhance your experience.
                            By accepting, you agree to our use of these cookies. You can
                            manage your preferences or learn more about our cookie policy.
                        </Text>
                    </div>
                </div>

                {viewportWidth > 767 ?
                    <div className="privacy_block">
                        <Link onClick={openPrivacyPolicy}
                              className="cookie-consent-privacy-link-text">
                            Privacy Policy →
                        </Link>
                        <div className="cookie-consent-buttons">
                            <Button
                                onClick={handleRejectAll}
                                className="cookie-consent-button cookie-consent-button--reject"
                            >
                                Reject all
                            </Button>
                            <Button
                                onClick={handleAcceptAll}
                                className="cookie-consent-button cookie-consent-button--accept"
                            >
                                Accept all
                            </Button>
                        </div>
                    </div>
                    :
                    <div className="privacy_block">
                        <div className="cookie-consent-buttons">
                            <Button
                                onClick={handleRejectAll}
                                className="cookie-consent-button cookie-consent-button--reject"
                            >
                                Reject all
                            </Button>
                            <Button
                                onClick={handleAcceptAll}
                                className="cookie-consent-button cookie-consent-button--accept"
                            >
                                Accept all
                            </Button>
                        </div>
                        <Link onClick={openPrivacyPolicy}
                              className="cookie-consent-privacy-link-text">
                            Privacy Policy →
                        </Link>
                    </div>
                }
            </Modal>
        </>
    );
};

export default CookieConsentPopup;