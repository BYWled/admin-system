import React from 'react'
import './styles/app.scss'

// 占位符  
import { Outlet } from 'react-router-dom'
export default function App() {
  return (
    <>
      <Outlet />
    </>
  )
}