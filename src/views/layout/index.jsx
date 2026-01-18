import s from '../../styles/layout.module.scss'
import LeftMenu from './leftMenu'
import RightMenu from './rightMenu'
import LeftHeader from './header'
import MenuHeader from './menuHeader'
import { Outlet } from 'react-router-dom'
import { App, Layout, Tour, Input, Flex, Button } from 'antd';
import { useState, useEffect, useRef } from 'react';
import { md5 } from 'js-md5';
import { useNavigate } from 'react-router-dom';


export default function layout() {
  // ******************初始化变量、Hooks******************
  const { Header, Footer, Sider, Content } = Layout;
  const [collapsed, setCollapsed] = useState(false);
  const [rightMenu, setRightMenu] = useState(false);
  const [lockScreen, setLockScreen] = useState(false);
  const [lockPassword, setLockPassword] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [topMenuMode, setTopMenuMode] = useState(false);
  const [time, setTime] = useState(Temporal.Now.zonedDateTimeISO());
  const [ms, setMs] = useState(0);
  const navigate = useNavigate();
  const { message } = App.useApp();
  // ******************副作用函数部分，用作生命周期与监听******************
  // 载入时检查是否锁屏
  useEffect(() => {
    const lsAdmin = localStorage.getItem('admin') ? JSON.parse(localStorage.getItem('admin')) : {};
    if (lsAdmin.lockScreen) setLockScreen(true);
  }, []);

  // 锁屏时更新时间
  useEffect(() => {
    const nowTime = setInterval(() => {
      setMs(tick());
    }, ms);
    return () => clearTimeout(nowTime);
  }, []);

  // 切换暗黑模式
  useEffect(() => {
    // 抓root根元素，修改css变量
    const root = document.documentElement;
    if (darkMode) {
      root.style.setProperty('--backColor', '#111');
      root.style.setProperty('--textColor', '#eee');
    } else {
      root.style.setProperty('--backColor', '#fefefe');
      root.style.setProperty('--textColor', '#111');
    }
  }, [darkMode]);

  // ******************函数部分******************
  const tick = () => {
    const now = Temporal.Now.zonedDateTimeISO(); // TODO: 每次获取最新时间
    setTime(now);

    // 1. 创建一个当前秒数 +1 的时间点，计算当前距离的微秒和纳秒
    const nextSecond = now.add({ seconds: 1 }).round({
      smallestUnit: 'second', // 取到秒
      roundingMode: 'floor' // 向下取整
    });

    // 2. 计算差值
    const msUntilNextSecond = now.until(nextSecond).total({ unit: 'millisecond' }); // 转为毫秒

    // 3. 动态设定下一次执行的时间，确保刚好在现实翻秒时触发
    return msUntilNextSecond;
  };

  // 锁屏函数
  const onLockScreen = (password) => {
    const lsAdmin = { ...JSON.parse(localStorage.getItem('admin')), lockScreen: true, lockPassword: md5(password) };
    localStorage.setItem('admin', JSON.stringify(lsAdmin));
    setLockScreen(true);
  }
  // 解锁函数
  const unLockScreen = () => {
    const lsAdmin = localStorage.getItem('admin') ? JSON.parse(localStorage.getItem('admin')) : {};
    if (md5(lockPassword) === lsAdmin.lockPassword) {
      const newAdmin = { ...lsAdmin, lockScreen: false, lockPassword: '' };
      localStorage.setItem('admin', JSON.stringify(newAdmin));
      setLockScreen(false);
      setLockPassword('');
    } else {
      message.error('密码错误，请重新输入！');
    }
  }

  // 暗黑模式切换函数
  const tDarkMode = () => {
    setDarkMode(!darkMode);
  }

  // 切换顶部菜单模式
  const tTopMenuMode = () => {
    setTopMenuMode(!topMenuMode);
  }

  // 右侧菜单切换函数
  const tRightMenu = () => {
    setRightMenu(!rightMenu);
  }

  // 退出登录函数
  const logout = () => {
    localStorage.removeItem('admin');
    navigate('/login');
  }

  // 动态元素构造相关函数
  const lock = [
    {
      // 移除 title，或改为更简洁的欢迎语
      title: '系统已锁定，当前时间：',
      description: (
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '10vh', fontWeight: 'bold', margin: '20px 0', fontFamily: 'Roboto Mono' }}>
            {time.toLocaleString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
          <Input.Password
            size="large"
            value={lockPassword}
            onChange={e => setLockPassword(e.target.value)}
            onPressEnter={unLockScreen} // 回车快速解锁
            placeholder="欢迎回来，请解锁以继续"
            style={{ marginBottom: 20 }}
          />
          <Flex justify="space-between" align="center">
            <Button size="small" type="link" onClick={logout} style={{ color: '#999' }}>忘记密码？退出账号</Button>
            <Button size="large" type="primary" onClick={unLockScreen} style={{ width: 120 }}>解锁</Button>
          </Flex>
        </div>
      ),
      // 隐藏原本的下一步按钮，依靠自定义 UI
      nextButtonProps: { style: { display: 'none' } },
    }
  ];
  return (
    <>
      {!lockScreen && <Layout>
        {
          !topMenuMode && <Sider className={s.leftMenu} collapsed={collapsed}>
            <LeftMenu collapsed={collapsed} darkMode={darkMode} />
          </Sider>
        }
        <Layout className={s.layoutMain}>
          <Header className={s.layoutHeader}>
            {
              topMenuMode ? <MenuHeader time={time} rightMenu={rightMenu} tRightMenu={tRightMenu} darkMode={darkMode} /> :
                <LeftHeader time={time} rightMenu={rightMenu} tRightMenu={tRightMenu} tCollapsed={setCollapsed} collapsed={collapsed} darkMode={darkMode} />
            }
          </Header>
          <Content className={s.layoutContent}>
            <Outlet />
          </Content>
          <Footer className={s.layoutFooter}>
            <Flex justify='center' align='center' style={{ width: '100%' }}>
              <span>右菜单状态：{rightMenu ? '打开' : '关闭'}</span>
              <span className='a' onClick={() => window.open('https://github.com/BYWled/admin-system', '_blank')}>admin-system</span>
              <span>&nbsp;©2026 Created by&nbsp;</span>
              <span className='a' onClick={() => window.open('https://github.com/BYWled', '_blank')}>BYWled</span>
            </Flex>
          </Footer>
        </Layout>
      </Layout>}
      {/* 右菜单 */}
      <RightMenu time={time} rightMenu={rightMenu} tRightMenu={tRightMenu} darkMode={darkMode} tDarkMode={tDarkMode} topMenuMode={topMenuMode} tTopMenuMode={tTopMenuMode} lockScreen={lockScreen} tLockScreen={(password) => onLockScreen(password)} logout={logout} />
      {/* 锁屏部分 */}
      <Tour open={lockScreen} steps={lock} mask={false} keyboard={false} arrow={false} closeIcon={false} classNames={{ root: s.lockRoot, mask: s.lockMask, section: s.lockSection }} />
    </>
  )
}