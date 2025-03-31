import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Form, Button } from 'antd';
import type { FormProps } from 'antd';
import useGetViewport from '@app/hooks/useGetViewport'
import { useUserStore } from '@/store';
import { ROUTES } from '@/app/routes/paths';

type FieldLoginType = {
  email?: string;
  password?: string;
}

type FieldRegistrationType = {
  email?: string;
  password?: string;
  confirmPassword?: string
}

const Auth = () => {
  const [isLoginMode, setIsLoginMode] = useState(true)
  const { viewportWidth } = useGetViewport()

  const navigate = useNavigate()
  const setUser = useUserStore((state) => state.setUser)

  const onLogin: FormProps<FieldLoginType>['onFinish'] = (values) => {  
    // TODO: MOCK LOGIN
    if (values?.email === 'test@test.com' && values?.password === '0000') {
      const user = { id: '1111-2222-3333-4444', email: 'test@test.com', name: 'dev test' }
      setUser(user)

      console.log('LOGIN Success!');
      navigate(ROUTES.MAIN)
    } else {
      console.log('ERROR: USER NOT FOUND' )
    }
  }

  const onRegistration: FormProps<FieldRegistrationType>['onFinish'] = (values) => {
    console.log('REGISTRATION Success:', values);
  }

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
                onFinish={(values) => onLogin(values)}
                initialValues={{ email: 'test@test.com', password: '0000' }}
              >
                <div className="auth__title">Увiйти</div>
                <Form.Item<FieldLoginType>
                  label="Email"
                  name="email"
                  rules={[{ required: true, message: 'Введіть Email' }]}
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
                  <Button className="submit-button" type="primary" htmlType="submit">
                    Увiйти
                  </Button>
                </Form.Item>
              </Form>
              <div className="auth__defer">Або продовжити</div>
              <div className="google-button">
                <img src="images/google-icon.png" width="24" height="24" alt="google logo" />
                Продовжити за допомогою Google
              </div>
            </>
          ) : (
            <>
              <Form name="registration" onFinish={(values) => onRegistration(values)} autoComplete="off">
                <div className="auth__title">Зареєструватися</div>
                <Form.Item<FieldRegistrationType>
                  label="Email"
                  name="email"
                  rules={[{ required: true, message: 'Введіть Email' }]}
                >
                  <Input autoComplete="off" placeholder="Введіть Email" />
                </Form.Item>
                <Form.Item<FieldRegistrationType>
                  label="Пароль"
                  name="password"
                  rules={[{ required: true, message: 'Введіть пароль' }]}
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
                  <Button className="submit-button" type="primary" htmlType="submit">
                    Зареєструватися
                  </Button>
                </Form.Item>
              </Form>
              <div className="auth__defer">Або</div>
              <div className="google-button">
                <img src="images/google-icon.png" width="24" height="24" alt="google logo" />
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
  )
}

export default Auth