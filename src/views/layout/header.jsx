import { MenuUnfoldOutlined, MenuFoldOutlined, LogoutOutlined } from '@ant-design/icons'
import { Button, Flex, Avatar, Dropdown, Breadcrumb } from 'antd'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import staticRouter from '../../router/index.jsx'
import s from '../../styles/layout.module.scss'

export default function LayoutHeader(props) {
    const [collapsed, setCollapsed] = useState(props.collapsed || false);
    const [nowUrl, setNowUrl] = useState([]);
    const navigate = useNavigate();
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
            onClick: () => navigate('/login'),
        },
    ]

    const toggleCollapsed = () => {
        setCollapsed(!collapsed);
        if (props.tCollapsed) props.tCollapsed(!collapsed);
    }

    return (
        <Flex justify="space-between" align="center" gap="large" style={{ width: '100%' }}>
            <Button type="primary" onClick={toggleCollapsed} className="menuBtn" >
                {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </Button>
            {/* <Breadcrumb items={nowUrl} /> */}
            <Dropdown classNames={{ itemTitle: '用户信息' }} menu={{ items: headerDropdown }} placement="bottomRight" arrow={true}>
                <Avatar className={'a'} src={<img draggable={false} src={"https://www.wled.top/images/Oz-Vessalius-avatar.svg"} />} />
            </Dropdown>
        </Flex >
    )
}