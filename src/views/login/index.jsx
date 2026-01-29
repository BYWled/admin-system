import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { loginApi } from '../../api/loginApi';
import GitHubLogo from '../../assets/GitHub.svg'
import s from '../../styles/login.module.scss'
import VCode from '../../utils/verifyCode'
import { App, Button, Form, Input, Typography, ConfigProvider, Divider, Flex, Avatar } from 'antd';

const { Title, Text } = Typography;

export default function Login() {
    const navigate = useNavigate();
    const [inCaptcha, setInCaptcha] = useState('');
    const [captcha, setCaptcha] = useState('');
    const [fresh, setFresh] = useState(0); // 用于刷新验证码
    const [form] = Form.useForm();
    const { message, notification } = App.useApp();

    // 刷新验证码
    useEffect(() => {
        setFresh(fresh + 1);
    }, []);

    // 提交表单
    const onFinish = async values => {
        // 验证码验证
        if (inCaptcha.toLowerCase() !== captcha.toLowerCase()) {
            message.error('验证码错误');
            setFresh(fresh + 1);
            return;
        }

        const res = await loginApi(values);
        if (res.code !== 0) {
            message.error({ content: res.msg || '登录失败，请稍后重试', });
            setFresh(fresh + 1);
            return;
        }
        // 存储信息
        localStorage.setItem('admin', JSON.stringify({ id: res.id, role: res.role, token: res.token }));
        notification.success({
            title: '登录成功',
            description: `${res.role}，欢迎回来！`,
        });
        navigate('/home');
    };

    return (
        <div className={s.login}>
            <Flex className={s.loginBox} vertical={true} align="center" justify="center" >
                <Title className={s.loginTitle} level={2}>后台管理系统</Title>
                <ConfigProvider
                    theme={{
                        components: {
                            Form: {
                                labelFontSize: '16px',
                            }
                        },
                        token: {
                            colorSplit: '#999',
                        },
                    }}
                >
                    <Form
                        requiredMark={false}
                        rootClassName={s.loginForm}
                        layout="vertical"
                        form={form}
                        onFinish={onFinish}
                    >
                        <Form.Item label="用户名" name="account"
                            rules={[{ required: true, message: '请输入用户名！' }]}>
                            <Input className={s.loginInput} placeholder="请输入用户名" />
                        </Form.Item>
                        <Form.Item label="密码" name="password"
                            rules={[{ required: true, message: '请输入密码！' }]}>
                            <Input.Password className={s.loginInput} placeholder="请输入密码" />
                        </Form.Item>
                        <Form.Item label="验证码" name="vCode"
                            rules={[{ required: true, message: '请输入验证码' }]}>
                            <Flex gap="small" align="center">
                                <Input value={inCaptcha} onChange={e => setInCaptcha(e.target.value)} placeholder="请输入验证码" />
                                <VCode setCaptcha={setCaptcha} fresh={fresh} />
                            </Flex>
                        </Form.Item>
                        <Form.Item>
                            <Button htmlType="submit" ghost className={s.loginBtn} type="primary" size='large'>登录</Button>
                            <Text italic={true} style={{ fontSize: '10px', color: '#999' }}>请使用HTTP协议访问网页，HTTPS会发生报错</Text>
                        </Form.Item>
                    </Form>
                    <Divider style={{ margin: '20px 0' }}>more</Divider>
                </ConfigProvider>
                <Flex gap={20} justify="center">
                    <Avatar className='a' size={40} onClick={() => window.location.href = 'https://github.com/BYWled/admin-system'} src={<img draggable={false} src={GitHubLogo} alt="Github" />} />
                    <Avatar className='a' size={40} onClick={() => window.location.href = 'https://gitee.com/BYWled/admin-system'} src={<img draggable={false} src={"https://gitee.com/static/images/gitee-logos/logo_gitee_g_red.svg"} alt="Gitee" />} />
                    <Avatar className='a' size={40} onClick={() => window.location.href = 'https://www.wled.top'}>BLOG</Avatar>
                </Flex>
            </Flex>
        </div>
    )
}
