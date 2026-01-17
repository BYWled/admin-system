import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import router from './router/index.jsx'
import { App } from 'antd'
import './styles/app.scss'

createRoot(document.getElementById('root')).render(
  // <StrictMode>
  <App>
      <RouterProvider router={router} />
  </App>
  // </StrictMode>,
)
