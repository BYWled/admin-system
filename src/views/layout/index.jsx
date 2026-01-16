import s from '../../styles/layout.module.scss'
import LeftMenu from './leftMenu'
import LayoutHeader from './header'
import { Outlet } from 'react-router-dom'
import { Layout, Tour } from 'antd';
import { useState } from 'react';

export default function layout() {
  const { Header, Footer, Sider, Content } = Layout;
  const [collapsed, setCollapsed] = useState(false);
  const [lockScreen, setLockScreen] = useState(false);

  return (
    <>
      <Layout>
        <Sider className={s.leftMenu} collapsed={collapsed}>
          <LeftMenu collapsed={collapsed} />
        </Sider>
        <Layout>
          <Header className={s.layoutHeader}>
            <LayoutHeader tCollapsed={setCollapsed} collapsed={collapsed} />
          </Header>
          <Content>
            <Outlet />
          </Content>
          <Footer className={s.layoutFooter}>Footer</Footer>
        </Layout>
      </Layout>
      <Tour open={lockScreen} />
    </>
  )
}