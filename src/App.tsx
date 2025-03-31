import { Suspense } from 'react'
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from '@/app/routes';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const App = () => {
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