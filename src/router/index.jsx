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
import { HomeOutlined, AppstoreOutlined, ShopOutlined, ContainerOutlined, BarChartOutlined, TeamOutlined, LockOutlined } from '@ant-design/icons';

export const staticRouter = [
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
        id: 1,
        key: '/home',
        path: '/home',
        label: '首页',
        icon: <HomeOutlined />,
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
        id: 2,
        key: '/users',
        path: '/user',
        label: '用户管理',
        icon: <TeamOutlined />,
        element: <Layout />,
        children: [
            {
                index: true,
                element: <UserList />,
                id: 21,
                key: '/user',
                label: '用户列表'
            },
            {
                path: '/user/add',
                element: <UserAdd />,
                id: 22,
                key: '/user/add',
                label: '添加用户'
            },
            {
                path: '/user/edit',
                element: <UserEdit />,
                id: 23,
                key: '/user/edit',
                label: '编辑用户'
            },
            {
                path: '/user/info',
                element: <UserInfo />,
                id: 24,
                key: '/user/info',
                label: '用户信息'
            }
        ]
    },
    // 商品
    {
        id: 3,
        key: '/goodss',
        path: '/goods',
        label: '商品管理',
        icon: <AppstoreOutlined />,
        element: <Layout />,
        children: [
            {
                index: true,
                element: <GoodsList />,
                id: 31,
                key: '/goods',
                label: '商品列表'
            },
            {
                path: '/goods/add',
                element: <GoodsAdd />,
                id: 32,
                key: '/goods/add',
                label: '添加商品'
            },
            {
                path: '/goods/classify',
                element: <GoodsClassify />,
                id: 33,
                key: '/goods/classify',
                label: '商品分类'
            }
        ]
    },
    // 订单
    {
        id: 4,
        key: '/order',
        path: '/order',
        label: '订单管理',
        icon: <ContainerOutlined />,
        element: <Layout />,
        children: [
            {
                index: true,
                element: <Order />,
            }
        ]
    },
    // 门店
    {
        id: 5,
        key: '/store',
        path: '/store',
        label: '店铺管理',
        icon: <ShopOutlined />,
        element: <Layout />,
        children: [
            {
                index: true,
                element: <Store />,
                label: '店铺管理'
            }
        ]
    },
    // 统计
    {
        id: 6,
        key: '/statisticss',
        path: '/statistics',
        label: '统计管理',
        icon: <BarChartOutlined />,
        element: <Layout />,
        children: [
            {
                index: true,
                element: <GoodsStatistics />,
                id: 61,
                key: '/statistics',
                label: '商品统计'
            },
            {
                path: '/statistics/order',
                element: <OrderStatistics />,
                id: 62,
                key: '/statistics/order',
                label: '订单统计'
            }
        ]
    },
    // 角色
    {
        id: 7,
        key: '/roles',
        path: '/role',
        label: '角色管理',
        icon: <LockOutlined />,
        element: <Layout />,
        children: [
            {
                index: true,
                element: <Role />,
                id: 71,
                key: '/role',
                label: '角色列表'
            },
            {
                path: '/role/permission',
                element: <Permission />,
                id: 72,
                key: '/role/permission',
                label: '权限列表'
            }
        ]
    }
]

const router = createHashRouter(staticRouter)

export default router;