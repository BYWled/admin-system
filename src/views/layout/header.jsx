import { MenuUnfoldOutlined, MenuFoldOutlined, SettingTwoTone } from '@ant-design/icons'
import { Button, Flex, Breadcrumb, ConfigProvider } from 'antd'
import { useState, useEffect } from 'react'
import { staticRouter } from '../../router/index.jsx'
import s from '../../styles/layout.module.scss'

export default function LeftHeader(props) {
    // ******************初始化变量、Hooks******************
    const [collapsed, setCollapsed] = useState(props.collapsed || false);
    const [nowUrl, setNowUrl] = useState([]);

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
            <Flex className={s.headerIcons} align="center" gap="small">
                <span style={props.darkMode ? { color: '#eee' } : { color: '#111' }}>{props.time.toLocaleString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>
                <SettingTwoTone style={{ fontSize: '21px' }} onClick={props.tRightMenu} className={'a'} />
            </Flex>
        </Flex >
    )
}