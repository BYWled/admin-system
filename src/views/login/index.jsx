import { useNavigate } from 'react-router-dom'
import s from '../../styles/login.module.scss'
import { Button, Form, Input, Typography, ConfigProvider } from 'antd';

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
                            },
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
                </ConfigProvider>

            </div>
        </div >
    )
}
