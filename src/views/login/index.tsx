import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
// import { loginApi } from "../../api/loginApi";
import GitHubLogo from "../../assets/GitHub.svg";
import s from "../../styles/login.module.scss";
import VCode from "../../utils/verifyCode";
import {
  App,
  Button,
  Form,
  Input,
  Typography,
  ConfigProvider,
  Divider,
  Flex,
  Avatar,
} from "antd";

const { Title } = Typography;

// TS新增内容
import type { FormProps } from "antd";
import service from "../../utils/service"; // 直接在这里写三层封装，防止TS和JS混用

const loginApi = (data: FormType): Promise<BackResType> => {
  return service.post("/users/checkLogin", data);
};

type FormType = {
  account: string;
  password: string;
  vCode: string;
};

type BackResType = {
  code: number;
  id: number;
  role: string;
  msg: string;
  token: string;
};

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [inCaptcha, setInCaptcha] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [fresh, setFresh] = useState(0); // 用于刷新验证码
  const { message, notification } = App.useApp();

  const onFinish: FormProps<FormType>["onFinish"] = async (values) => {
    // 验证码验证
    if (inCaptcha.toLowerCase() !== captcha.toLowerCase()) {
      message.error("验证码错误");
      setFresh(fresh + 1);
      return;
    }

    // 登录请求
    const res = await loginApi(values); //TODO: 如果不写await，res会是一个Promise对象，导致后续代码出现类型错误的问题

    // 存储信息
    localStorage.setItem(
      "admin",
      JSON.stringify({ id: res.id, role: res.role, token: res.token }),
    );
    notification.success({
      title: "登录成功",
      description: `${res.role}，欢迎回来！`,
    });
    navigate("/home");
  };

  // 刷新验证码
  useEffect(() => {
    setFresh(fresh + 1);
  }, []);
  return (
    <div className={s.login}>
      <Flex
        className={s.loginBox}
        vertical={true}
        align="center"
        justify="center"
      >
        <Title className={s.loginTitle} level={2}>
          后台管理系统
        </Title>
        <ConfigProvider
          theme={{
            components: {
              Form: {
                labelFontSize: 16,
              },
            },
            token: {
              colorSplit: "#999",
            },
          }}
        >
          <Form
            requiredMark={false}
            rootClassName={s.loginForm}
            layout="vertical"
            onFinish={onFinish}
          >
            <Form.Item<FormType>
              label="用户名"
              name="account"
              rules={[{ required: true, message: "请输入用户名！" }]}
            >
              <Input className={s.loginInput} placeholder="请输入用户名" />
            </Form.Item>
            <Form.Item<FormType>
              label="密码"
              name="password"
              rules={[{ required: true, message: "请输入密码！" }]}
            >
              <Input.Password
                className={s.loginInput}
                placeholder="请输入密码"
              />
            </Form.Item>
            <Form.Item<FormType>
              label="验证码"
              name="vCode"
              rules={[{ required: true, message: "请输入验证码" }]}
            >
              <Flex gap="small" align="center">
                <Input
                  value={inCaptcha}
                  onChange={(e) => setInCaptcha(e.target.value)}
                  placeholder="请输入验证码"
                />
                <VCode setCaptcha={setCaptcha} fresh={fresh} />
              </Flex>
            </Form.Item>
            <Form.Item label={null}>
              <Button
                htmlType="submit"
                ghost
                className={s.loginBtn}
                type="primary"
                size="large"
              >
                登录
              </Button>
            </Form.Item>
          </Form>
          <Divider
            classNames={{
              root: s.dividerRoot,
              rail: s.divider,
              content: s.divider,
            }}
            style={{ margin: "20px 0" }}
          >
            more
          </Divider>
        </ConfigProvider>
        <Flex gap={20} justify="center">
          <Avatar
            className="a"
            size={40}
            onClick={() =>
              window.open("https://github.com/BYWled/admin-system", "_blank")
            }
            src={<img draggable={false} src={GitHubLogo} alt="Github" />}
          />
          <Avatar
            className="a"
            size={40}
            onClick={() =>
              window.open("https://gitee.com/BYWled/admin-system", "_blank")
            }
            src={
              <img
                draggable={false}
                src={
                  "https://gitee.com/static/images/gitee-logos/logo_gitee_g_red.svg"
                }
                alt="Gitee"
              />
            }
          />
          <Avatar
            className="a"
            size={40}
            onClick={() => window.open("https://www.wled.top", "_blank")}
          >
            BLOG
          </Avatar>
        </Flex>
      </Flex>
    </div>
  );
};

export default Login;
