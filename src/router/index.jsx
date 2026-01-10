import { createHashRouter, Navigate } from 'react-router-dom'
import Login from '../views/login/index.jsx'
import Layout from '../views/layout/index.jsx'
import Home from '../views/home/index.jsx'
import UserList from '../views/user/list.jsx'
import UserAdd from '../views/user/add.jsx'
import UserEdit from '../views/user/edit.jsx'
import UserInfo from '../views/user/info.jsx'
import GoodsList from '../views/goods/list.jsx'
import GoodsAdd from '../views/goods/add.jsx'
import GoodsClassify from '../views/goods/classify.jsx'
import Order from '../views/order/index.jsx'
import Store from '../views/store/index.jsx'
import GoodsStatistics from '../views/statistics/goods.jsx'
import OrderStatistics from '../views/statistics/order.jsx'
import Permission from '../views/role/permission.jsx'
import Role from '../views/role/role.jsx'

const staticRouter = createHashRouter([
    // 默认路由
    {
        path: '/',
        element: <Navigate to={'/login'} />
    },
    {
        path: '/login',
        element: <Login />
    },
    // 首页
    {
        path: '/home',
        element: <Layout />,
        children: [
            {
                index: true,
                element: <Home />
            }
        ]
    },
    // 用户
    {
        path: '/user',
        element: <Layout />,
        children: [
            {
                index: true,
                element: <UserList />
            },
            {
                path: '/user/add',
                element: <UserAdd />
            },
            {
                path: '/user/edit',
                element: <UserEdit />
            },
            {
                path: '/user/info',
                element: <UserInfo />
            }
        ]
    },
    // 商品
    {
        path: '/goods',
        element: <Layout />,
        children: [
            {
                index: true,
                element: <GoodsList />
            },
            {
                path: '/goods/add',
                element: <GoodsAdd />
            },
            {
                path: '/goods/classify',
                element: <GoodsClassify />
            }
        ]
    },
    // 订单
    {
        path: '/order',
        element: <Layout />,
        children: [
            {
                index: true,
                element: <Order />
            }
        ]
    },
    // 门店
    {
        path: '/store',
        element: <Layout />,
        children: [
            {
                index: true,
                element: <Store />
            }
        ]
    },
    // 统计
    {
        path: '/statistics',
        element: <Layout />,
        children: [
            {
                index: true,
                element: <GoodsStatistics />
            },
            {
                path: '/statistics/order',
                element: <OrderStatistics />
            }
        ]
    },
    // 角色
    {
        path: '/role',
        element: <Layout />,
        children: [
            {
                index: true,
                element: <Role />
            },
            {
                path: '/role/permission',
                element: <Permission />
            }
        ]
    }
])

export default staticRouter;