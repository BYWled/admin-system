import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import App from './App.jsx'
import staticRouter from './router/index.jsx'

createRoot(document.getElementById('root')).render(
  // <StrictMode>
  <RouterProvider router={staticRouter}>
    <App />
  </RouterProvider> 
  // </StrictMode>,
)
