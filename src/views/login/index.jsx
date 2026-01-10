import { useNavigate } from 'react-router-dom'
import s from '../../styles/login.module.scss'
import { Button, Form, Input, Typography, ConfigProvider, Divider, Flex, Avatar } from 'antd';

const { Title } = Typography;

export default function Login() {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const onFinish = values => {
        console.log('Success:', values);
        navigate('/home');
    };

    return (
        <div className={s.login}>
            <div className={s.loginBox}>
                <Title className={s.loginTitle} level={2}>欢迎使用后台管理系统</Title>
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
                        size='large'
                        layout="vertical"
                        form={form}
                        onFinish={onFinish}
                    >
                        <Form.Item label="用户名" name="username"
                            rules={[{ required: true, message: '请输入用户名！' }]}>
                            <Input className={s.loginInput} placeholder="请输入用户名" />
                        </Form.Item>
                        <Form.Item label="密码" name="password"
                            rules={[{ required: true, message: '请输入密码！' }]}>
                            <Input.Password className={s.loginInput} placeholder="请输入密码" />
                        </Form.Item>
                        <Form.Item>
                            <Button htmlType="submit" ghost className={s.loginBtn} type="primary" size='large'>登录</Button>
                        </Form.Item>
                    </Form>
                    <Divider style={{ margin: '20px 0' }}>more</Divider>
                </ConfigProvider>
                <Flex gap={20} justify="center">
                    <Avatar className='a' size={40} onClick={() => window.location.href = 'https://github.com/BYWled/admin-system'} src={<img draggable={false} src={"https://github.githubassets.com/assets/GitHub-Mark-ea2971cee799.png"} alt="Github" />} />
                    <Avatar className='a' size={40} onClick={() => window.location.href = 'https://gitee.com/BYWled/admin-system'} src={<img draggable={false} src={"https://gitee.com/static/images/gitee-logos/logo_gitee_g_red.svg"} alt="Gitee" />} />
                    <Avatar className='a' size={40} onClick={() => window.location.href = 'https://www.wled.top'}>BLOG</Avatar>
                </Flex>
            </div>
        </div >
    )
}
