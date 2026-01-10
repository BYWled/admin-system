import React, { useState } from 'react';
import s from '../../styles/layout.module.scss'
import { useNavigate, useLocation, useMatches } from 'react-router-dom';
import { AppstoreOutlined, MailOutlined, SettingOutlined } from '@ant-design/icons';
import { Flex, Menu, Avatar } from 'antd';

// 菜单列表
const items = [
  {
    id: 1,
    key: '/home',
    icon: <MailOutlined />,
    label: '首页'
  },
  {
    id: 2,
    key: '/users',
    icon: <AppstoreOutlined />,
    label: '用户管理',
    children: [
      { id: 21, key: '/user', label: '用户列表' },
      { id: 22, key: '/user/add', label: '添加用户' },
      { id: 23, key: '/user/edit', label: '编辑用户' }
    ],
  },
  {
    id: 3,
    key: '/goodss',
    icon: <SettingOutlined />,
    label: '商品管理',
    children: [
      { id: 31, key: '/goods', label: '商品列表' },
      { id: 32, key: '/goods/add', label: '添加商品' },
      { id: 33, key: '/goods/classify', label: '商品分类' }
    ],
  },
  {
    id: 4,
    key: '/order',
    icon: <MailOutlined />,
    label: '订单管理'
  },
  {
    id: 5,
    key: '/store',
    icon: <MailOutlined />,
    label: '店铺管理'
  },
  {
    id: 6,
    key: '/statisticss',
    icon: <MailOutlined />,
    label: '统计管理',
    children: [
      { id: 61, key: '/statistics', label: '商品统计' },
      { id: 62, key: '/statistics/order', label: '订单统计' },
    ]
  },
  {
    id: 7,
    key: '/roles',
    icon: <MailOutlined />,
    label: '角色管理',
    children: [
      { id: 71, key: '/role', label: '角色列表' },
      { id: 72, key: '/role/permission', label: '权限列表' },
    ]
  }
];

// 主函数
export default function LeftMenu() {
  // 初始化hooks
  const navigate = useNavigate();
  const location = useLocation();
  const matches = useMatches();
  const [stateOpenKeys, setStateOpenKeys] = useState([matches[0].pathname + 's']);
  const [selectedKeys, setSelectedKeys] = useState([location.pathname]);
  const [selectedOpenKeys, setSelectedOpenKeys] = useState([matches[0].pathname + 's']);

  const currentOpenId = () => {
    // 找到当前已选中路径对应的菜单id
    const current = items.find(item => item.key === matches[0].pathname + 's');
    return current ? current.id : null;
  };

  // 菜单切换时自动展开关闭
  const onOpenChange = openKeys => {
    // 先遍历找到key对应的id
    const openIds = items.filter(item => openKeys.includes(item.key)).map(i => i.id);
    // 找最新展开的id
    const latestOpenId = openIds.find(id => !stateOpenKeys.includes(items.find(item => item.id === id).key)); // 先找有的，没有的那个就是最新展开的
    // 如果小于2，则直接设置
    if (openIds.length > 2) {
      // 大于2则说明有多级菜单展开，只保留当前展开的和最后一个展开的
      const newOpenIds = [currentOpenId(), latestOpenId]; // 保留当前展开的和最新展开的
      // 设置新的展开keys
      const newOpenKeys = newOpenIds.map(id => items.find(item => item.id === id).key); // 根据id找key
      setStateOpenKeys(newOpenKeys);
    } else if (!openIds.includes(currentOpenId())) { // 如果不包含当前展开的，则只保留最新展开的TODO:当前选中无法关闭
      setStateOpenKeys([items.find(item => item.id === latestOpenId).key]);
    } else { // 否则直接设置
      setStateOpenKeys(openKeys);
    }
  };

  // 菜单点击跳转
  const changeRouter = ({ keyPath }) => {
    navigate(keyPath[0]);
    setSelectedKeys([keyPath[0]]);
    setSelectedOpenKeys([keyPath[1]]);
  };

  return (
    <>
      <Flex justify="center" align="center" className={s.menuLogo}>
        <Avatar src={<img draggable={false} src={"https://www.wled.top/images/Oz-Vessalius-avatar.svg"} />} />
        <span className={s.menuTitle}>后台管理系统</span>
      </Flex>
      <Menu
        mode="inline"
        defaultSelectedKeys={selectedKeys}
        defaultOpenKeys={selectedOpenKeys}
        onOpenChange={onOpenChange}
        openKeys={stateOpenKeys}
        onClick={changeRouter}
        style={{ width: '100%' }}
        items={items}
      />
    </>
  );
};