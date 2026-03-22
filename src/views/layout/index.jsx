import s from "../../styles/layout.module.scss";
import LeftMenu from "./leftMenu";
import RightMenu from "./rightMenu";
import LeftHeader from "./header";
import MenuHeader from "./menuHeader";
import LayoutFooter from "./footer";
import { Outlet } from "react-router-dom";
import { App, Layout, Tour, Input, Flex, Button, FloatButton } from "antd";
import { SettingOutlined } from "@ant-design/icons";
import { useState, useEffect, useRef } from "react";
import { md5 } from "js-md5";
import { useNavigate } from "react-router-dom";

const getLocalStorageAdmin = () => {
  const ls = localStorage.getItem("admin")
    ? JSON.parse(localStorage.getItem("admin"))
    : {};
  return ls;
};

export default function layout() {
  // ******************初始化变量、Hooks******************
  const { Header, Sider, Content } = Layout;
  const [collapsed, setCollapsed] = useState(false);
  const [rightMenu, setRightMenu] = useState(false);
  const [lockScreen, setLockScreen] = useState(false);
  const [lockPassword, setLockPassword] = useState("");
  const [time, setTime] = useState(Temporal.Now.zonedDateTimeISO());
  const isNightTime = time.hour >= 18 || time.hour < 6; // 晚上6点到早上6点
  const [darkMode, setDarkMode] = useState(isNightTime); // 晚上6点到早上6点默认暗黑模式
  const [autoDarkMode, setAutoDarkMode] = useState(true); // 是否自动跟随时间切换主题
  const [topMenuMode, setTopMenuMode] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [footerMode, setFooterMode] = useState(true);
  const timerRef = useRef(null); // TODO:使用 ref 存储定时器 ID，避免重复创建：使用useSate会在数据更新时再次渲染组件，导致定时器重复创建，从而导致内存溢出
  const navigate = useNavigate();
  const { message } = App.useApp();
  // ******************副作用函数部分，用作生命周期与监听******************
  // 载入时检查本地缓存数据
  useEffect(() => {
    const ls = getLocalStorageAdmin();
    // 是否锁屏
    if (ls.lockScreen) setLockScreen(true);
    // 布局配置
    if (ls.layoutConfig) {
      setAutoDarkMode(ls.layoutConfig.autoDarkMode || false);
      // 如果开启自动模式，根据时间设置暗黑模式，否则根据缓存设置
      ls.layoutConfig.autoDarkMode
        ? setDarkMode(isNightTime)
        : setDarkMode(ls.layoutConfig.darkMode || false);
      setTopMenuMode(ls.layoutConfig.topMenuMode || false);
      setFullscreen(ls.layoutConfig.fullscreen || false);
      setFooterMode(ls.layoutConfig.footerMode || false);
    }
  }, []);

  // 更新时间
  useEffect(() => {
    const nextTick = () => {
      const now = Temporal.Now.zonedDateTimeISO(); // TODO: 每次获取最新时间
      setTime(now);
      // 计算到下一秒的毫秒数
      const nextSecond = now
        .add({ seconds: 1 }) // TODO:加一秒
        .round({
          smallestUnit: "second", // 单位为秒
          roundingMode: "floor", // 向下取整
        });
      //
      const msUntilNextSecond = now
        .until(nextSecond)
        .total({ unit: "millisecond" }); // TODO:until 计算时间差并且返回新的 Temporal.Duration 对象，total 计算总毫秒数
      // 使用 setTimeout 递归，动态计算下次执行时间，确保每次只有一个定时器
      timerRef.current = setTimeout(nextTick, msUntilNextSecond);
    };

    // 立即执行第一次
    nextTick();

    // 清理函数：组件卸载时清除定时器
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  // 切换暗黑模式
  useEffect(() => {
    // 抓root根元素，修改css变量
    const root = document.documentElement;
    if (darkMode) {
      root.style.setProperty("--backColor", "#111");
      root.style.setProperty("--textColor", "#eee");
      document.documentElement.setAttribute('data-color-mode', 'dark');
    } else {
      root.style.setProperty("--backColor", "#fefefe");
      root.style.setProperty("--textColor", "#111");
      document.documentElement.setAttribute('data-color-mode', 'light');
    }
  }, [darkMode]);

  // ******************函数部分******************
  // 锁屏函数
  const onLockScreen = (password) => {
    const ls = getLocalStorageAdmin();
    const lsAdmin = {
      ...ls,
      lockScreen: true,
      lockPassword: md5(password),
    };
    localStorage.setItem("admin", JSON.stringify(lsAdmin));
    setLockScreen(true);
  };
  // 解锁函数
  const unLockScreen = () => {
    const ls = getLocalStorageAdmin();
    if (md5(lockPassword) === ls.lockPassword) {
      const newAdmin = { ...ls, lockScreen: false, lockPassword: "" };
      localStorage.setItem("admin", JSON.stringify(newAdmin));
      setLockScreen(false);
      setLockPassword("");
    } else {
      message.error("密码错误，请重新输入！");
    }
  };

  // 暗黑模式切换函数
  const tDarkMode = () => {
    // 保存暗黑模式状态到 localStorage
    const ls = getLocalStorageAdmin();
    localStorage.setItem(
      "admin",
      JSON.stringify({
        ...ls,
        layoutConfig: {
          ...ls.layoutConfig,
          darkMode: !darkMode,
          autoDarkMode: false, // 关闭自动跟随时间切换主题
        },
      }),
    );
    setDarkMode(!darkMode);
    setAutoDarkMode(false);
  };

  // 自动跟随时间切换主题函数
  const tAutoDarkMode = () => {
    const ls = getLocalStorageAdmin();
    localStorage.setItem(
      "admin",
      JSON.stringify({
        ...ls,
        layoutConfig: {
          ...ls.layoutConfig,
          autoDarkMode: !autoDarkMode,
          darkMode: !autoDarkMode ? isNightTime : darkMode, // 如果开启自动模式，根据时间设置暗黑模式，否则保持当前状态
        },
      }),
    );
    setAutoDarkMode(!autoDarkMode);
    setDarkMode(!autoDarkMode ? isNightTime : darkMode);
  };

  // 切换顶部菜单模式
  const tTopMenuMode = () => {
    const ls = getLocalStorageAdmin();
    localStorage.setItem(
      "admin",
      JSON.stringify({
        ...ls,
        layoutConfig: {
          ...ls.layoutConfig,
          topMenuMode: !topMenuMode,
        },
      }),
    );
    setTopMenuMode(!topMenuMode);
  };

  // 右侧菜单切换函数
  const tRightMenu = () => {
    setRightMenu(!rightMenu);
  };

  // 全屏切换函数
  const tFullscreen = () => {
    const ls = getLocalStorageAdmin();
    localStorage.setItem(
      "admin",
      JSON.stringify({
        ...ls,
        layoutConfig: {
          ...ls.layoutConfig,
          fullscreen: !fullscreen,
        },
      }),
    );
    setFullscreen(!fullscreen);
    setRightMenu(false);
  };

  // 底部显示切换函数
  const tFooterMode = () => {
    const ls = getLocalStorageAdmin();
    localStorage.setItem(
      "admin",
      JSON.stringify({
        ...ls,
        layoutConfig: {
          ...ls.layoutConfig,
          footerMode: !footerMode,
        },
      }),
    );
    setFooterMode(!footerMode);
  };

  // 退出登录函数
  const logout = () => {
    localStorage.removeItem("admin");
    navigate("/login");
  };

  // 锁屏步骤配置
  const lock = [
    {
      // 移除 title，或改为更简洁的欢迎语
      title: "系统已锁定，当前时间：",
      description: (
        <div style={{ textAlign: "center" }}>
          <p
            style={{
              fontSize: "10vh",
              fontWeight: "bold",
              margin: "20px 0",
              fontFamily: "Roboto Mono",
            }}
          >
            {time.toLocaleString("zh-CN", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </p>
          <Input.Password
            size="large"
            value={lockPassword}
            onChange={(e) => setLockPassword(e.target.value)}
            onPressEnter={unLockScreen} // 回车快速解锁
            placeholder="欢迎回来，请解锁以继续"
            style={{ marginBottom: 20 }}
          />
          <Flex justify="space-between" align="center">
            <Button
              size="small"
              type="link"
              onClick={logout}
              style={{ color: "#999" }}
            >
              忘记密码？退出账号
            </Button>
            <Button
              size="large"
              type="primary"
              onClick={unLockScreen}
              style={{ width: 120 }}
            >
              解锁
            </Button>
          </Flex>
        </div>
      ),
      // 隐藏原本的下一步按钮，依靠自定义 UI
      nextButtonProps: { style: { display: "none" } },
    },
  ];
  return (
    <>
      {
        // 非全屏且非锁屏状态下的布局
        !lockScreen && !fullscreen && (
          <Layout>
            {
              // 顶部菜单模式下不显示侧边栏
              !topMenuMode && (
                <Sider className={s.leftMenu} collapsed={collapsed}>
                  <LeftMenu collapsed={collapsed} darkMode={darkMode} />
                </Sider>
              )
            }
            {/* 主要内容区域 */}
            <Layout className={s.layoutMain}>
              <Header className={s.layoutHeader}>
                {
                  // 顶部菜单模式下显示 MenuHeader，否则显示 LeftHeader
                  topMenuMode ? (
                    <MenuHeader
                      time={time}
                      rightMenu={rightMenu}
                      tRightMenu={tRightMenu}
                      darkMode={darkMode}
                    />
                  ) : (
                    <LeftHeader
                      time={time}
                      rightMenu={rightMenu}
                      tRightMenu={tRightMenu}
                      tCollapsed={setCollapsed}
                      collapsed={collapsed}
                      darkMode={darkMode}
                    />
                  )
                }
              </Header>
              <Content className={s.layoutContent}>
                <Outlet />
              </Content>
              {footerMode && <LayoutFooter time={time} darkMode={darkMode} />}
            </Layout>
          </Layout>
        )
      }
      {
        // 全屏状态下的布局
        fullscreen && (
          <Content
            className={s.layoutContent}
            style={{ height: "100vh", boxSizing: "border-box" }}
          >
            <Outlet />
          </Content>
        )
      }
      {/* 全屏时显示设置悬浮 */}
      {fullscreen && (
        <FloatButton
          icon={<SettingOutlined />}
          onClick={tRightMenu}
          content="设置"
          shape="square"
          className={"a"}
        />
      )}
      {/* 右菜单 */}
      <RightMenu
        time={time}
        rightMenu={rightMenu}
        tRightMenu={tRightMenu}
        darkMode={darkMode}
        tDarkMode={tDarkMode}
        autoDarkMode={autoDarkMode}
        tAutoDarkMode={tAutoDarkMode}
        topMenuMode={topMenuMode}
        tTopMenuMode={tTopMenuMode}
        fullscreen={fullscreen}
        tFullscreen={tFullscreen}
        footerMode={footerMode}
        tFooterMode={tFooterMode}
        lockScreen={lockScreen}
        tLockScreen={(password) => onLockScreen(password)}
        logout={logout}
      />
      {/* 锁屏部分 */}
      <Tour
        open={lockScreen}
        steps={lock}
        mask={false}
        keyboard={false}
        arrow={false}
        closeIcon={false}
        classNames={{
          root: s.lockRoot,
          mask: s.lockMask,
          section: s.lockSection,
        }}
      />
    </>
  );
}
