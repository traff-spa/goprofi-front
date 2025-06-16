import {useState, useEffect} from 'react';
import {useNavigate, useLocation} from 'react-router-dom';
import {Input, Form, Button, message} from 'antd';
import type {FormProps} from 'antd';
import {Link} from 'react-router-dom';

import useGetViewport from '@app/hooks/useGetViewport';
import {useAuthStore} from '@/store/authStore';
import {useTestStore} from '@/store/testStore';
import {ROUTES} from '@/app/routes/paths';
import {authService} from '@/app/api/services';
import type {FieldLoginType, FieldRegistrationType} from '@app/types/auth.ts'

const Auth = () => {
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

    const {viewportWidth} = useGetViewport();

    const location = useLocation();
    const navigate = useNavigate();

    const {login, register, loginWithGoogle, setUser} = useAuthStore();
    const {startTest, fetchUserTestResults} = useTestStore();

    const handlePostAuthRedirection = async (user: any) => {
        try {
            if (!user?.id) {
                throw new Error('Invalid user data received');
            }

            const userId = parseInt(user.id.toString(), 10);
            if (isNaN(userId)) {
                throw new Error(`Invalid user ID: ${user.id}`);
            }

            // Check if user has any existing test results
            const userTestResults = await fetchUserTestResults(userId);

            if (userTestResults && userTestResults.length > 0) {
                // User has test history, redirect to test history page
                navigate(ROUTES.TEST_HISTORY);
            } else {
                // User has no tests, start a new test
                const testId = 1; // Default test ID
                const testResult = await startTest(userId, testId);

                if (testResult) {
                    navigate(`/test/${testResult.id}`);
                } else {
                    // Fallback if test creation fails
                    message.error('Unable to start the test. Please try again later.');
                    navigate(ROUTES.TEST_HISTORY);
                }
            }
        } catch (error: any) {
            console.error('Post-auth redirection error:', error);
            message.error('Authentication successful, but navigation failed. Redirecting to test history.');
            navigate(ROUTES.MAIN);
        }
    };

    // Check for token in URL when returning from Google OAuth
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');

        if (token) {
            setIsLoading(true);

            // Handle the Google OAuth callback
            authService.handleGoogleCallback(token)
                .then(response => {
                    setUser(response.user);
                    message.success('Google login successful!');
                    handlePostAuthRedirection(response.user);
                })
                .catch(() => {
                    message.error('Google login failed. Please try again.');
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [location, navigate, setUser]);

    const onLogin: FormProps<FieldLoginType>['onFinish'] = async (values) => {
        setIsLoading(true);
        try {
            await login(String(values.email).toLowerCase(), values.password);
            message.success('Login successful!');
            navigate(ROUTES.TEST_HISTORY);
        } catch (error: any) {
            console.error('Login error:', error);

            setFormErrors({
                password: error.message || 'Login failed. Please check your credentials.'
            });

            message.error(error.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    const onRegistration: FormProps<FieldRegistrationType>['onFinish'] = async (values) => {
        setIsLoading(true);
        try {
            const registeredUser = await register(
                values.email,
                values.password,
                values.firstName as string,
                values.lastName as string
            );
            message.success('Registration successful!');

            if (registeredUser?.id) {
                const userId = parseInt(registeredUser.id.toString(), 10);

                if (isNaN(userId)) {
                    throw new Error(`Invalid user ID: ${registeredUser.id}`);
                }

                const testId = 1;

                // Start the test
                const testResult = await startTest(userId, testId);

                if (testResult) {
                    navigate(`/test/${testResult.id}`);
                } else {
                    alert('Registration is successful, but unable to start the test. Please try again later.');
                }
            } else {
                navigate(ROUTES.AUTH);
                return;
            }
        } catch (error: any) {
            message.error(error?.message || error?.[0]?.msg || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        console.log('Google login button clicked');
        setIsLoading(true);
        try {
            loginWithGoogle();
            // Note: We won't reach this point as loginWithGoogle redirects the page
        } catch (error: any) {
            message.error('Failed to initiate Google login');
            setIsLoading(false);
        }
    };

    return (
        <div className="auth">
            <div className="auth__inner">
                {viewportWidth > 767 && (
                    <div className="auth__left" style={{backgroundImage: 'url(/images/auth-section-img-2x.png)'}}/>
                )}
                <div className="auth__right">
                    <div className="auth__close">
                        <Link to={ROUTES.MAIN}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                 xmlns="http://www.w3.org/2000/svg">
                                <path d="M18 6L6 18" stroke="#4C4B4A" strokeWidth="2" strokeLinecap="round"
                                      strokeLinejoin="round"/>
                                <path d="M6 6L18 18" stroke="#4C4B4A" strokeWidth="2" strokeLinecap="round"
                                      strokeLinejoin="round"/>
                            </svg>
                        </Link>
                    </div>
                    {isLoginMode ? (
                        <>
                            <Form
                                name="login"
                                autoComplete="off"
                                scrollToFirstError={{behavior: 'instant', block: 'end', focus: true}}
                                onFinish={onLogin}
                            >
                                <div className="auth__title">Увiйти</div>
                                <Form.Item<FieldLoginType>
                                    label="Email"
                                    name="email"
                                    rules={[
                                        {required: true, message: 'Введіть Email'},
                                        {type: 'email', message: 'Введіть коректний Email'}
                                    ]}
                                >
                                    <Input placeholder="Введіть Email"/>
                                </Form.Item>
                                <Form.Item<FieldLoginType>
                                    label="Пароль"
                                    name="password"
                                    rules={[{required: true, message: 'Введіть пароль'}]}
                                    validateStatus={formErrors.password ? 'error' : ''}
                                    help={formErrors.password}
                                >
                                    <Input.Password placeholder="Введіть пароль"/>
                                </Form.Item>
                                <Form.Item label={null}>
                                    <Button
                                        className="submit-button"
                                        type="primary"
                                        htmlType="submit"
                                        loading={isLoading}
                                    >
                                        Увiйти
                                    </Button>
                                </Form.Item>
                            </Form>
                            <div className="auth__defer">Або продовжити</div>
                            <div
                                className="google-button"
                                onClick={handleGoogleLogin}
                                style={{cursor: 'pointer', opacity: isLoading ? 0.7 : 1}}
                            >
                                <img src="/images/google-icon.svg" width="24" height="24" alt="google logo"/>
                                Продовжити за допомогою Google
                            </div>
                        </>
                    ) : (
                        <>
                            <Form
                                name="registration"
                                onFinish={onRegistration}
                                autoComplete="off"
                            >
                                <div className="auth__title">Зареєструватися</div>
                                <Form.Item<FieldRegistrationType>
                                    label="Email"
                                    name="email"
                                    rules={[
                                        {required: true, message: 'Введіть Email'},
                                        {type: 'email', message: 'Введіть коректний Email'}
                                    ]}
                                >
                                    <Input autoComplete="off" placeholder="Введіть Email"/>
                                </Form.Item>
                                <Form.Item<FieldRegistrationType>
                                    label="Ім'я"
                                    name="firstName"
                                    rules={[
                                        {required: true, message: "Введіть, будь ласка, ім'я"},
                                        {min: 3, message: "Введіть, будь ласка, ім'я, мінімум 3 літери"},
                                        {type: "string", message: "Введіть, будь ласка, коректне ім'я"}
                                    ]}
                                >
                                    <Input autoComplete="off" placeholder="Введіть ім'я"/>
                                </Form.Item>
                                <Form.Item<FieldRegistrationType>
                                    label="Прізвище"
                                    name="lastName"
                                    rules={[
                                        {required: true, message: "Введіть, будь ласка, прізвище"},
                                        {min: 3, message: "Введіть, будь ласка, прізвище, мінімум 3 літери"},
                                        {type: "string", message: "Введіть коректне прізвище"}
                                    ]}
                                >
                                    <Input autoComplete="off" placeholder="Введіть прізвище"/>
                                </Form.Item>
                                <Form.Item<FieldRegistrationType>
                                    label="Пароль"
                                    name="password"
                                    rules={[
                                        {required: true, message: 'Введіть пароль'},
                                        {min: 6, message: 'Пароль має бути не менше 6 символів'}
                                    ]}
                                >
                                    <Input.Password autoComplete="off" placeholder="Введіть пароль"/>
                                </Form.Item>
                                <Form.Item<FieldRegistrationType>
                                    label="Повторити пароль"
                                    name="confirmPassword"
                                    dependencies={['password']}
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Підтвердіть пароль'
                                        },
                                        ({getFieldValue}) => ({
                                            validator(_, value) {
                                                if (!value || getFieldValue('password') === value) {
                                                    return Promise.resolve();
                                                }
                                                return Promise.reject(
                                                    new Error('Паролі не збігаються')
                                                );
                                            },
                                        }),
                                    ]}
                                >
                                    <Input.Password placeholder="Введіть пароль"/>
                                </Form.Item>
                                <Form.Item label={null}>
                                    <Button
                                        className="submit-button"
                                        type="primary"
                                        htmlType="submit"
                                        loading={isLoading}
                                    >
                                        Зареєструватися
                                    </Button>
                                </Form.Item>
                            </Form>
                            <div className="auth__defer">Або</div>
                            <div
                                className="google-button"
                                onClick={handleGoogleLogin}
                                style={{cursor: 'pointer', opacity: isLoading ? 0.7 : 1}}
                            >
                                <img src="/images/google-icon.svg" width="24" height="24" alt="google logo"/>
                                Зареєструватися за допомогою Google
                            </div>
                        </>
                    )}
                    <div className="auth__bottom">
                        {isLoginMode ? (
                            <div>Немає облікового запису? <span
                                onClick={() => setIsLoginMode(false)}>Зареєструватися</span></div>
                        ) : (
                            <div>Вже маєте акаунт? <span onClick={() => setIsLoginMode(true)}>Увійти</span></div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Auth;