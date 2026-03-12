import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import router from './router/index.jsx'
import { App, ConfigProvider } from 'antd'
import './styles/app.scss'
import zhCN from 'antd/locale/zh_CN'

createRoot(document.getElementById('root')).render(
  // <StrictMode>
  <ConfigProvider locale={zhCN}>
    <App>
      <RouterProvider router={router} />
    </App>
  </ConfigProvider>
  // </StrictMode>,
)
