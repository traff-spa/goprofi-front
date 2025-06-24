import {Suspense, useEffect} from 'react'
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from '@/app/routes';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import {useAuthStore} from "@/store/authStore.ts";


const App = () => {
    const {checkAuth} = useAuthStore();

    useEffect(() => {
        checkAuth().catch(e=>console.error(e, 'error during checkAuth()'));
    }, []);

  return (
    <BrowserRouter>
      <Suspense fallback={(
        <div className="page-loader">
          <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
        </div>
      )}>
        <AppRoutes />
      </Suspense>
    </BrowserRouter>
  )
}

export default App