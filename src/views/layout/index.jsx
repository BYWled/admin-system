import s from '../../styles/layout.module.scss'
import LeftMenu from './leftMenu'
import { Outlet } from 'react-router-dom'
import { Layout } from 'antd';

export default function layout() {
  const { Header, Footer, Sider, Content } = Layout;
  return (
    <>
      <Layout>
        <Sider className={s.leftMenu}>
          <LeftMenu />
        </Sider>
        <Layout>
          <Header>Header</Header>
          <Content>
            <Outlet />
          </Content>
          <Footer>Footer</Footer>
        </Layout>
      </Layout>
    </>
  )
}