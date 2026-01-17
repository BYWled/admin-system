import { MenuUnfoldOutlined, MenuFoldOutlined, LogoutOutlined, LockOutlined, MoonOutlined, SunOutlined } from '@ant-design/icons'
import { Button, Flex, Avatar, Dropdown, Breadcrumb, ConfigProvider, Modal, Input } from 'antd'
import { useState, useEffect } from 'react'
import { staticRouter } from '../../router/index.jsx'
import s from '../../styles/layout.module.scss'

export default function LayoutHeader(props) {
    // ******************初始化变量、Hooks******************
    const [collapsed, setCollapsed] = useState(props.collapsed || false);
    const [lockDialogVisible, setLockDialogVisible] = useState(false);
    const [lockPassword, setLockPassword] = useState('');
    const [nowUrl, setNowUrl] = useState([]);
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
    // 载入当前路径面包屑导航
    useEffect(() => {
        // 先获取当前路径
        const path = window.location.hash.replace('#', '');
        // 拆分路径
        let urlArr = path.split('/').filter(i => i); // 过滤掉空字符串
        // 根据路径长度，判断面包屑
        const currentLv1Router = staticRouter.find(r => r.path === '/' + urlArr[0]);
        urlArr[0] = {
            title: (
                <>
                    {currentLv1Router && currentLv1Router.icon}
                    <span>{currentLv1Router ? currentLv1Router.label : '未知页面'}</span>
                </>
            ),
            path: '/' + urlArr[0]
        };
        if (urlArr.length > 1) {
            const currentLv2Router = currentLv1Router.children.find(c => c.path === urlArr[1]);
            urlArr[1] = {
                title: (
                    <>
                        {currentLv2Router && currentLv2Router.icon}
                        <span>{currentLv2Router ? currentLv2Router.label : '未知页面'}</span>
                    </>
                ),
                path: '/' + urlArr[1]
            }
        };
        setNowUrl(urlArr);
    }, [window.location.hash]);

    // ******************函数部分******************
    // 菜单折叠状态变化
    const toggleCollapsed = () => {
        setCollapsed(!collapsed);
        if (props.tCollapsed) props.tCollapsed(!collapsed);
    }

    // 确认锁屏
    const confirmLock = () => {
        if (props.tLockScreen) props.tLockScreen(lockPassword);
        setLockDialogVisible(false);
    }

    return (
        <Flex justify="space-between" align="center" gap="large" style={{ width: '100%' }}>
            <Button type="primary" onClick={toggleCollapsed} className="menuBtn" >
                {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </Button>
            <ConfigProvider
                theme={{
                    components: {
                        Breadcrumb: {
                            itemColor: '#999',
                            lastItemColor: '#fff',
                            linkColor: '#999',
                            linkHoverColor: '#666',
                            separatorColor: '#333',
                        },
                    },
                }}
            >
                <Breadcrumb items={nowUrl} separator=">" className={s.headerBreadCrumb} />
            </ConfigProvider>
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
            </Flex>
            <Dropdown classNames={{ itemTitle: '用户信息' }} menu={{ items: headerDropdown }} placement="bottomRight" arrow={true}>
                <Avatar className={'a'} src={<img draggable={false} src={"https://www.wled.top/images/Oz-Vessalius-avatar.svg"} />} />
            </Dropdown>
        </Flex >
    )
}