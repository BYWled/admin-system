import { useState, useEffect } from 'react';
import s from '../../styles/layout.module.scss'
import { useNavigate, useLocation, useMatches } from 'react-router-dom';
import { Flex, Menu, Avatar } from 'antd';
import { staticRouter } from '../../router/index.jsx';

export default function LeftMenu(props) {
  //******************初始化变量、Hooks******************
  const navigate = useNavigate();
  const location = useLocation();
  const matches = useMatches();
  const [routers, setRouters] = useState([]);
  const [titleText, setTitleText] = useState(true);
  const [stateOpenKeys, setStateOpenKeys] = useState([matches[0].pathname + 's']); // 默认展开当前路径对应的一级菜单，即使是一级菜单导致展开无效也没关系，相当于不展开任何菜单
  const [selectedKeys, setSelectedKeys] = useState([location.pathname]);
  const [selectedOpenKeys, setSelectedOpenKeys] = useState([matches[0].pathname + 's']);

  //******************副作用函数部分，用作生命周期与监听******************
  // 载入菜单时，格式化路由数据
  useEffect(() => {
    // TODO: forEach无法返回新数组，需改用map+filter
    // TODO: 不能对react函数组件进行JSON深拷贝，会导致<icon />变成空对象导致无法传递
    const deRouters = staticRouter.routes
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

  // 标题显示隐藏控制
  // TODO: 不能直接在外面写延时生成，会导致重复执行。需使用副作用监听collapsed变化，控制标题显示隐藏
  useEffect(() => {
    props.collapsed ? setTitleText(false) : setTimeout(() => { setTitleText(true) }, 180);
  }, [props.collapsed]);

  const currentOpenId = () => {
    // 找到当前已选中路径对应的菜单id
    const current = routers.find(item => item.key === matches[0].pathname + 's');  // 由于找的是组装的一级菜单key，所以可能会找不到的情况
    return current ? current.id : null; // 找不到就说明当前页就是一级菜单
  };

  // 菜单切换时自动展开关闭
  const onOpenChange = openKeys => {
    // 先遍历找到key对应的id
    const openIds = routers.filter(item => openKeys.includes(item.key)).map(i => i.id);
    // 找最新展开的id
    const latestOpenId = openIds.find(id => !stateOpenKeys.includes(routers.find(item => item.id === id).key)); // 先找有的，没有的那个就是最新展开的
    const nowId = currentOpenId();
    // 展开数量阈值
    let num = 2;
    // 是否展开当前选中菜单
    let isNowOpen = false;
    // 当前展开的id不存在，即打开的是一级菜单
    // 一级菜单直接设置的阈值设为1
    if (!nowId) num = 1;
    // 当前展开的id存在但不在展开列表中，即关闭的是当前展开的菜单
    else if (!openIds.includes(nowId)) { num = 1; isNowOpen = false; }
    // 否则说明是多级菜单展开
    else { num = 2; isNowOpen = true; };
    // 小于长度时直接设置
    if (openIds.length <= num) setStateOpenKeys(openKeys);
    else {
      // 否则只保留当前展开的和最新展开的
      const newOpenIds = nowId && isNowOpen ? [nowId, latestOpenId] : [latestOpenId]; // 保留当前展开的和最新展开的（当前为1级页面则不放入）
      // 设置新的展开keys
      const newOpenKeys = newOpenIds.map(id => routers.find(item => item.id === id).key); // 根据id找key
      setStateOpenKeys(newOpenKeys);
    };
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
        {titleText && <span className={s.menuTitle}>后台管理系统</span>}
      </Flex>
      <Menu
        theme={props.darkMode ? 'dark' : 'light'}
        mode="inline"
        defaultSelectedKeys={selectedKeys}
        defaultOpenKeys={selectedOpenKeys}
        onOpenChange={onOpenChange}
        openKeys={stateOpenKeys}
        onClick={changeRouter}
        style={{ width: '100%' }}
        items={routers}
      />
    </>
  );
};