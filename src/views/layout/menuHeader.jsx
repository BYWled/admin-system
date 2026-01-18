import { LogoutOutlined, LockOutlined, MoonOutlined, SunOutlined, BorderTopOutlined } from '@ant-design/icons'
import { Flex, Avatar, Dropdown, Modal, Input, Menu } from 'antd'
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
    const [lockDialogVisible, setLockDialogVisible] = useState(false);
    const [lockPassword, setLockPassword] = useState('');
    const { id, role } = localStorage.getItem('admin') ? JSON.parse(localStorage.getItem('admin')) : {};
    const headerDropdown = [
        {
            key: '1',
            label: `id: ${id}`,
            disabled: true,
        },
        {
            key: '1-2',
            label: `角色: ${role}`,
            disabled: true,
        },
        {
            type: 'divider',
        },
        {
            key: '2',
            label: '注销',
            icon: <LogoutOutlined />,
            danger: true,
            onClick: props.logout,
        },
    ]

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

    // 确认锁屏
    const confirmLock = () => {
        if (props.tLockScreen) props.tLockScreen(lockPassword);
        setLockDialogVisible(false);
    }

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
            <Flex className={s.headerIcons} align="center">
                <LockOutlined onClick={() => setLockDialogVisible(true)} className={'a'} style={{ color: '#77bbff', fontSize: '16px' }} />
                <Modal
                    open={lockDialogVisible}
                    title="锁屏"
                    onOk={confirmLock}
                    okText="确认并锁屏"
                    closable={false}
                    onCancel={() => setLockDialogVisible(false)}
                    cancelText="取消"
                >
                    <Input.Password value={lockPassword} onChange={e => setLockPassword(e.target.value)} placeholder="请输入锁屏密码" />
                </Modal>
                {
                    props.darkMode ?
                        <MoonOutlined onClick={props.tDarkMode} className={'a'} style={{ color: '#bb9955', fontSize: '16px' }} />
                        :
                        <SunOutlined onClick={props.tDarkMode} className={'a'} style={{ color: '#bb9955', fontSize: '16px' }} />
                }
                <BorderTopOutlined onClick={props.tTopMenuMode} className={'a'} style={{ color: '#77bbff', fontSize: '16px' }} />
            </Flex>
            <Dropdown classNames={{ itemTitle: '用户信息' }} menu={{ items: headerDropdown }} placement="bottomRight" arrow={true}>
                <Avatar className={'a'} src={<img draggable={false} src={"https://www.wled.top/images/Oz-Vessalius-avatar.svg"} />} />
            </Dropdown>
        </Flex >
    )
}