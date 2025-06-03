import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Input, Form, Button, message } from 'antd';
import type { FormProps } from 'antd';
import useGetViewport from '@app/hooks/useGetViewport';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/app/routes/paths';
import { authService } from '@/app/api/services';
import type {FieldLoginType, FieldRegistrationType} from '@app/types/auth.ts'

const Auth = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { viewportWidth } = useGetViewport();

  const location = useLocation();
  const navigate = useNavigate();
  const { login, register, loginWithGoogle, setUser } = useAuthStore();

  // Check for token in URL when returning from Google OAuth
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (token) {
      console.log('Google auth token detected in URL');
      setIsLoading(true);

      // Handle the Google OAuth callback
      authService.handleGoogleCallback(token)
          .then(response => {
            setUser(response.user);
            message.success('Google login successful!');
            navigate(ROUTES.MAIN);
          })
          .catch(error => {
            console.error('Failed to process Google login:', error);
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
      navigate(ROUTES.MAIN);
    } catch (error: any) {
      console.error('Login error:', error);
      message.error(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const onRegistration: FormProps<FieldRegistrationType>['onFinish'] = async (values) => {
    setIsLoading(true);
    try {
      await register(
          values.email,
          values.password,
          values.firstName || '',
          values.lastName || ''
      );
      message.success('Registration successful!');
      navigate(ROUTES.MAIN);
    } catch (error: any) {
      console.error('Registration error:', error);
      message.error(error.message || 'Registration failed. Please try again.');
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
      console.error('Google login error:', error);
      message.error('Failed to initiate Google login');
      setIsLoading(false);
    }
  };

  return (
      <div className="auth">
        <div className="auth__inner">
          {viewportWidth > 767 && (
              <div className="auth__left">
                <img src="/images/auth-section-img.png" width="424" height="640" alt="" />
              </div>
          )}
          <div className="auth__right">
            {isLoginMode ? (
                <>
                  <Form
                      name="login"
                      autoComplete="off"
                      scrollToFirstError={{ behavior: 'instant', block: 'end', focus: true }}
                      onFinish={onLogin}
                  >
                    <div className="auth__title">Увiйти</div>
                    <Form.Item<FieldLoginType>
                        label="Email"
                        name="email"
                        rules={[
                          { required: true, message: 'Введіть Email' },
                          { type: 'email', message: 'Введіть коректний Email' }
                        ]}
                    >
                      <Input placeholder="Введіть Email" />
                    </Form.Item>
                    <Form.Item<FieldLoginType>
                        label="Пароль"
                        name="password"
                        rules={[{ required: true, message: 'Введіть пароль' }]}
                    >
                      <Input.Password placeholder="Введіть пароль" />
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
                      style={{ cursor: 'pointer', opacity: isLoading ? 0.7 : 1 }}
                  >
                    <img src="/images/google-icon.png" width="24" height="24" alt="google logo" />
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
                          { required: true, message: 'Введіть Email' },
                          { type: 'email', message: 'Введіть коректний Email' }
                        ]}
                    >
                      <Input autoComplete="off" placeholder="Введіть Email" />
                    </Form.Item>
                    <Form.Item<FieldRegistrationType>
                        label="Ім'я"
                        name="firstName"
                        rules={[
                          { required: true, message: "Введіть, будь ласка, ім'я" },
                          { min: 3, message: "Введіть, будь ласка, ім'я, мінімум 3 літери" },
                          { type: "string", message: "Введіть, будь ласка, коректне ім'я" }
                        ]}
                    >
                      <Input autoComplete="off" placeholder="Введіть ім'я" />
                    </Form.Item>
                    <Form.Item<FieldRegistrationType>
                        label="Прізвище"
                        name="lastName"
                        rules={[
                          { required: true, message: "Введіть, будь ласка, прізвище" },
                          { min: 3, message: "Введіть, будь ласка, прізвище, мінімум 3 літери" },
                          { type: "string", message: "Введіть коректне прізвище" }
                        ]}
                    >
                      <Input autoComplete="off" placeholder="Введіть прізвище" />
                    </Form.Item>
                    <Form.Item<FieldRegistrationType>
                        label="Пароль"
                        name="password"
                        rules={[
                          { required: true, message: 'Введіть пароль' },
                          { min: 6, message: 'Пароль має бути не менше 6 символів' }
                        ]}
                    >
                      <Input.Password autoComplete="off" placeholder="Введіть пароль" />
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
                          ({ getFieldValue }) => ({
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
                      <Input.Password placeholder="Введіть пароль" />
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
                      style={{ cursor: 'pointer', opacity: isLoading ? 0.7 : 1 }}
                  >
                    <img src="/images/google-icon.png" width="24" height="24" alt="google logo" />
                    Зареєструватися за допомогою Google
                  </div>
                </>
            )}
            <div className="auth__bottom">
              {isLoginMode ? (
                  <div>Немає облікового запису? <span onClick={() => setIsLoginMode(false)}>Зареєструватися</span></div>
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