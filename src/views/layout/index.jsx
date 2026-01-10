import React from 'react'
import { Outlet } from 'react-router-dom'

export default function layout() {
  return (
    <div>
        <div className="left-menu">
          菜单
        </div>
        <div className="content">
            <div className="header">右边的顶部</div>
            <div className="container">
               <Outlet />
            </div>
        </div>


    </div>
  )
}