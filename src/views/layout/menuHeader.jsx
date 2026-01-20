import { Flex, Avatar, Menu } from 'antd'
import { SettingTwoTone } from '@ant-design/icons'
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { staticRouter } from '../../router/index.jsx'
import s from '../../styles/layout.module.scss'

export default function MenuHeader(props) {
    // ******************初始化变量、Hooks******************
    const navigate = useNavigate();
    const location = useLocation();
    const [routers, setRouters] = useState([]);
    const [selectedKeys, setSelectedKeys] = useState([location.pathname]);

    // ******************副作用函数部分，用作生命周期与监听******************
    // 载入菜单时，格式化路由数据
    useEffect(() => {
        // TODO: forEach无法返回新数组，需改用map+filter
        // TODO: 不能对react函数组件进行JSON深拷贝，会导致<icon />变成空对象导致无法传递
        // 不传 element、path、hasErrorBoundary 等内部字段
        const menuItems = staticRouter.filter(item => item.key).map(item => {
            // children 为空判断
            let children = item.children.filter(c => c.key)
            if (children.length === 0) return { id: item.id, key: item.key, label: item.label, icon: item.icon };
            // 子节点也需要剔除
            children = children.map(c => ({
                id: c.id,
                key: c.key,
                label: c.label
            }));
            return { id: item.id, key: item.key, label: item.label, icon: item.icon, children };
        });
        setRouters(menuItems);
    }, []);

    // ******************函数部分******************
    // 菜单点击跳转
    const changeRouter = ({ keyPath }) => {
        navigate(keyPath[0]);
        setSelectedKeys([keyPath[0]]);
    };

    return (
        <Flex justify="space-between" align="center" gap="large" style={{ width: '100%', height: '100%' }}>
            <Flex justify="center" align="center" className={s.menuLogo}>
                <Avatar src={<img draggable={false} src={"https://www.wled.top/images/Oz-Vessalius-avatar.svg"} />} />
                <span className={s.menuTitle}>后台管理系统</span>
            </Flex>
            <Menu
                theme={props.darkMode ? 'dark' : 'light'}
                mode="horizontal"
                defaultSelectedKeys={selectedKeys}
                style={{ flex: 1, height: '100%', lineHeight: '6vh', minWidth: 0 }}
                items={routers}
                onClick={changeRouter}
            />
            <Flex className={s.headerIcons} align="center" gap="small">
                <span>{props.time.toLocaleString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>
                <SettingTwoTone style={{ fontSize: '21px' }} onClick={props.tRightMenu} className={'a'} />
            </Flex>
        </Flex>
    )
}