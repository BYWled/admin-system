import { createHashRouter, useNavigate, useLocation } from 'react-router-dom'
import Login from '../views/login/index.jsx'
import Layout from '../views/layout/index.jsx'
import Home from '../views/home/index.jsx'
import User from '../views/user/index.jsx'
import GoodsList from '../views/goods/list.jsx'
import GoodsAdd from '../views/goods/add.jsx'
import GoodsClassify from '../views/goods/classify.jsx'
import Order from '../views/order/index.jsx'
import Store from '../views/store/index.jsx'
import GoodsStatistics from '../views/statistics/goods.jsx'
import OrderStatistics from '../views/statistics/order.jsx'
import Permission from '../views/role/permission.jsx'
import Role from '../views/role/role.jsx'
import { HomeOutlined, AppstoreOutlined, ShopOutlined, ContainerOutlined, BarChartOutlined, TeamOutlined, LockOutlined, LoadingOutlined } from '@ant-design/icons';
import { verifyTokenApi } from '../api/loginApi.js';
import { App, Spin } from 'antd'
import { useState, useEffect } from 'react';

// TODO:前置守卫
const BeforeEach = ({ callback }) => {
    // hooks
    const navigate = useNavigate();
    const location = useLocation();
    const { notification } = App.useApp();
    const [isChecking, setIsChecking] = useState(true);// 是否正在检查权限

    // TODO:将检查权限的逻辑包裹在 useEffect 中
    // 这样 React 会先保证 BeforeEach 渲染完成，然后再执行 Loading 的状态更新。
    // 并且避免在渲染过程中直接调用异步函数引起的问题。
    useEffect(() => {
        // 定义异步检查函数
        const checkAuth = async () => {
            try {
                const admin = JSON.parse(localStorage.getItem('admin')) || {};
                const hasToken = !!admin.token;

                // 获取当前路径
                const currentPath = location.pathname;

                // 没有token
                if (!hasToken) {
                    // 如果不在登录页，强制跳去登录页
                    if (currentPath !== '/login') {
                        navigate('/login', { replace: true });// TODO:replace: true 不保留历史记录，防止用户点返回又回到受保护页
                    }
                    // 如果已经在登录页，什么都不用做，直接放行显示登录页
                    setIsChecking(false);
                    return;
                }

                // 有token，验证token有效性
                const res = await verifyTokenApi({ token: admin.token });

                // token 失效
                if (res.code !== 0) {
                    notification.error({
                        title: '登录已失效',
                        description: '请重新登录！',
                    });

                    localStorage.removeItem('admin');

                    // 只有当前不在登录页时才跳转，避免循环
                    if (currentPath !== '/login') {
                        navigate('/login', { replace: true });
                    }
                    return;
                }

                // token有效
                // 如果用户已登录但试图访问登录页和根，踢回首页
                if (currentPath === '/login' || !callback) {
                    navigate('/home', { replace: true });
                    return;
                }
                // 最后检查完成，放行
                setIsChecking(false);

            } catch (error) {
                // 接口调用出错，安全起见通常视为未登录
                notification.error({
                    title: '登录凭证已失效',
                    description: '请重新登录！',
                });
                localStorage.removeItem('admin');
                navigate('/login', { replace: true });
            }
        };

        // 调用检查函数
        checkAuth();

    }, [navigate]); // 依赖项：当路径变化时重新检查

    // 如果正在检查中，返回一个全屏占位 div，暂停渲染子组件
    if (isChecking) {
        return (
            <div style={{ width: '100vw', height: '100vh', backgroundColor: '#333', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Spin spinning={true} indicator={<LoadingOutlined spin />} size="large" />
            </div>
        );
    }

    // 检查通过，渲染原本的组件
    return callback || null;
};

// 静态路由配置
export const staticRouter = [
    // 默认路由
    {
        path: '/',
        element: <BeforeEach />,
    },
    // 登录页
    {
        path: '/login',
        element: <BeforeEach callback={<Login />} />,
    },
    // 首页
    {
        id: 1,
        key: '/home',
        path: '/home',
        label: '首页',
        icon: <HomeOutlined />,
        element: <BeforeEach callback={<Layout />} />,
        children: [
            {
                index: true,
                element: <Home />
            }
        ]
    },
    // 用户管理
    {
        id: 2,
        key: '/user',
        path: '/user',
        label: '用户管理',
        icon: <TeamOutlined />,
        element: <BeforeEach callback={<Layout />} />,
        children: [
            {
                index: true,
                element: <User />,
            }
        ]
    },
    // 商品管理
    {
        id: 3,
        key: '/goodss',
        path: '/goods',
        label: '商品管理',
        icon: <AppstoreOutlined />,
        element: <BeforeEach callback={<Layout />} />,
        children: [
            {
                index: true,
                element: <GoodsList />,
                id: 31,
                key: '/goods',
                label: '商品列表'
            },
            {
                path: 'add',
                element: <GoodsAdd />,
                id: 32,
                key: '/goods/add',
                label: '添加商品'
            },
            {
                path: 'classify',
                element: <GoodsClassify />,
                id: 33,
                key: '/goods/classify',
                label: '商品分类'
            }
        ]
    },
    // 订单管理
    {
        id: 4,
        key: '/order',
        path: '/order',
        label: '订单管理',
        icon: <ContainerOutlined />,
        element: <BeforeEach callback={<Layout />} />,
        children: [
            {
                index: true,
                element: <Order />,
            }
        ]
    },
    // 店铺管理
    {
        id: 5,
        key: '/store',
        path: '/store',
        label: '店铺管理',
        icon: <ShopOutlined />,
        element: <BeforeEach callback={<Layout />} />,
        children: [
            {
                index: true,
                element: <Store />,
                label: '店铺管理'
            }
        ]
    },
    // 统计管理
    {
        id: 6,
        key: '/statisticss',
        path: '/statistics',
        label: '统计管理',
        icon: <BarChartOutlined />,
        element: <BeforeEach callback={<Layout />} />,
        children: [
            {
                index: true,
                element: <GoodsStatistics />,
                id: 61,
                key: '/statistics',
                label: '商品统计'
            },
            {
                path: 'order',
                element: <OrderStatistics />,
                id: 62,
                key: '/statistics/order',
                label: '订单统计'
            }
        ]
    },
    // 角色管理
    {
        id: 7,
        key: '/roles',
        path: '/role',
        label: '角色管理',
        icon: <LockOutlined />,
        element: <BeforeEach callback={<Layout />} />,
        children: [
            {
                index: true,
                element: <Role />,
                id: 71,
                key: '/role',
                label: '角色列表'
            },
            {
                path: 'permission',
                element: <Permission />,
                id: 72,
                key: '/role/permission',
                label: '权限列表'
            }
        ]
    }
]

// 创建路由对象
const router = createHashRouter(staticRouter)

// 暴露路由
export default router;