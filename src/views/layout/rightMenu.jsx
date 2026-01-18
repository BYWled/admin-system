import { useEffect, useState } from 'react'
import { userInfoApi } from '../../api/userApi'
import { LockOutlined, SunFilled, MoonFilled, BorderTopOutlined, BorderLeftOutlined, CheckOutlined, LogoutOutlined } from '@ant-design/icons'
import { App, Drawer, Flex, Modal, Input, Avatar, Card, Typography, Button } from 'antd'
import s from '../../styles/layout.module.scss'

export default function RightMenu(props) {
    // ******************初始化变量、Hooks******************
    const { Text } = Typography;
    const { message } = App.useApp();
    const [userInfo, setUserInfo] = useState({});
    const [lockDialogVisible, setLockDialogVisible] = useState(false);
    const [lockPassword, setLockPassword] = useState('');
    const { id, role } = localStorage.getItem('admin') ? JSON.parse(localStorage.getItem('admin')) : {};

    // ******************副作用函数部分，用作生命周期与监听******************
    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const res = await userInfoApi({ id });
                if (!res.accountInfo) message.error('用户信息不存在');
                setUserInfo(res.accountInfo);
            } catch (e) {
                message.error('获取用户信息失败');
                console.error('获取用户信息失败:', e);
            }
        };

        fetchUserInfo();
    }, []);

    // ******************函数部分******************
    // 确认锁屏
    const confirmLock = () => {
        if (props.tLockScreen) props.tLockScreen(lockPassword);
        setLockDialogVisible(false);
        props.tRightMenu();
    }

    return <Drawer open={props.rightMenu} onClose={props.tRightMenu} closable={false} destroyOnHidden={true} mask={{ blur: false }} placement="right"
        size={'40vh'} title="关于" footer={null}
        styles={{
            section: {
                color: props.darkMode ? '#eee' : '#111',
                backgroundColor: props.darkMode ? '#222' : '#fff',
            },
            body: { paddingTop: '0' }
        }}>
        <Flex vertical={true} justify='space-between' style={{ width: '100%', height: '100%' }}>
            <Flex vertical={true} style={{ flex: 1, gap: '2vh' }}>
                {/* 时间显示 */}
                <p style={{ fontSize: '5vh', fontWeight: 'bold', margin: '0', fontFamily: 'Roboto Mono' }}>
                    {props.time.toLocaleString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </p>

                {/* 个人信息 */}
                <Card
                    style={{ width: '100%' }}
                    type="inner"
                    title="个人信息"
                >
                    <Avatar shape="square" size={64} src={<img draggable={false} src={"https://www.wled.top/images/Oz-Vessalius-avatar.svg"} />} />
                    <div><Text strong>用户Id：</Text>{userInfo.id || id}</div>
                    <div><Text strong>角色：</Text> {userInfo.userGroup || role}</div>
                </Card>

                {/* 主题设置 */}
                <Card
                    style={{ width: '100%' }}
                    type="inner"
                    title="主题设置"
                >
                    <Flex gap="small" wrap justify="space-between">
                        <div
                            onClick={() => props.darkMode && props.tDarkMode()}
                            className={s.menuThemeBox}
                            style={{
                                border: !props.darkMode ? '2px solid #1677ff' : '2px solid #d9d9d9'
                            }}
                        >
                            <SunFilled style={{ fontSize: '24px', color: !props.darkMode ? '#1677ff' : 'inherit' }} />
                            <Text>亮色主题</Text>
                            {!props.darkMode && <CheckOutlined className={s.menuCheckout} />}
                        </div>
                        <div
                            onClick={() => !props.darkMode && props.tDarkMode()}
                            className={s.menuThemeBox}
                            style={{
                                border: props.darkMode ? '2px solid #1677ff' : '2px solid #d9d9d9'
                            }}
                        >
                            <MoonFilled style={{ fontSize: '24px', color: props.darkMode ? '#1677ff' : 'inherit' }} />
                            <Text>暗色主题</Text>
                            {props.darkMode && <CheckOutlined className={s.menuCheckout} />}
                        </div>
                        <div
                            onClick={() => props.topMenuMode && props.tTopMenuMode && props.tTopMenuMode()}
                            className={s.menuThemeBox}
                            style={{
                                border: !props.topMenuMode ? '2px solid #1677ff' : '2px solid #d9d9d9'
                            }}
                        >
                            <BorderLeftOutlined style={{ fontSize: '24px', color: !props.topMenuMode ? '#1677ff' : 'inherit' }} />
                            <Text>左侧菜单</Text>
                            {!props.topMenuMode && <CheckOutlined className={s.menuCheckout} />}
                        </div>
                        <div
                            onClick={() => !props.topMenuMode && props.tTopMenuMode && props.tTopMenuMode()}
                            className={s.menuThemeBox}
                            style={{
                                border: props.topMenuMode ? '2px solid #1677ff' : '2px solid #d9d9d9'
                            }}
                        >
                            <BorderTopOutlined style={{ fontSize: '24px', color: props.topMenuMode ? '#1677ff' : 'inherit' }} />
                            <Text>顶部菜单</Text>
                            {props.topMenuMode && <CheckOutlined className={s.menuCheckout} />}
                        </div>
                    </Flex>
                </Card>
            </Flex>

            <Flex vertical={true} justify="space-between" gap='small' style={{ width: '100%' }}>
                <Button color="primary" variant="outlined" icon={<LockOutlined />} onClick={() => setLockDialogVisible(true)}>锁定屏幕</Button>
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
                <Button danger icon={<LogoutOutlined />} onClick={props.logout}>退出登录</Button>
            </Flex>
        </Flex>
    </Drawer >

}