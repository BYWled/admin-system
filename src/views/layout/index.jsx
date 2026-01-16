import s from '../../styles/layout.module.scss'
import LeftMenu from './leftMenu'
import LayoutHeader from './header'
import { Outlet } from 'react-router-dom'
import { App, Layout, Tour, Input, Flex, Button } from 'antd';
import { useState, useEffect } from 'react';
import { md5 } from 'js-md5';
import { useNavigate } from 'react-router-dom';


export default function layout() {
  // ******************初始化变量、Hooks******************
  const { Header, Footer, Sider, Content } = Layout;
  const [collapsed, setCollapsed] = useState(false);
  const [lockScreen, setLockScreen] = useState(false);
  const [lockPassword, setLockPassword] = useState('');
  const [nowTime, setNowTime] = useState(new Date().toLocaleTimeString());
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
    let time;
    setNowTime(new Date().toLocaleTimeString());
    if (lockScreen)
      time = setInterval(() => {
        setNowTime(new Date().toLocaleTimeString());
      }, 1000);
    // TODO: 副作用return顺带清理定时器，计时器会在不需要时自动停止
    return () => clearInterval(time);
  }, [lockScreen]);

  // ******************函数部分******************
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
      clearInterval();
    } else {
      message.error('密码错误，请重新输入！');
    }
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
            {nowTime}
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
        <Sider className={s.leftMenu} collapsed={collapsed}>
          <LeftMenu collapsed={collapsed} />
        </Sider>
        <Layout>
          <Header className={s.layoutHeader}>
            <LayoutHeader tCollapsed={setCollapsed} collapsed={collapsed} tLockScreen={(password) => onLockScreen(password)} lockScreen={lockScreen} logout={logout} />
          </Header>
          <Content>
            <Outlet />
          </Content>
          <Footer className={s.layoutFooter}>
            <Flex justify='center' align='center' style={{ width: '100%' }}>
              <span className='a' onClick={() => window.open('https://github.com/BYWled/admin-system', '_blank')}>admin-system</span>
              <span>&nbsp;©2026 Created by&nbsp;</span>
              <span className='a' onClick={() => window.open('https://github.com/BYWled', '_blank')}>BYWled</span>
            </Flex>
          </Footer>
        </Layout>
      </Layout>}
      <Tour open={lockScreen} steps={lock} mask={false} keyboard={false} arrow={false} closeIcon={false} classNames={{ root: s.lockRoot, mask: s.lockMask, section: s.lockSection }} />
    </>
  )
}