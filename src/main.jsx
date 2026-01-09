import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  // <StrictMode>
  // 设置默认路由前缀为项目名
  <BrowserRouter>
    <App />
  </BrowserRouter>
  // </StrictMode>,
)
