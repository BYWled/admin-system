<h1 align="center">React Admin System</h1>

<p align="center">
	基于 React 19、Vite 7、Ant Design 6 构建的后台管理系统示例项目，覆盖登录鉴权、布局切换、统计图表等常见后台场景。
</p>

<p align="center">
	<a href="https://github.com/BYWled/admin-system"><img src="https://img.shields.io/github/stars/BYWled/admin-system?style=for-the-badge&logo=github" alt="GitHub Stars" /></a>
	<a href="https://github.com/BYWled/admin-system"><img src="https://img.shields.io/github/forks/BYWled/admin-system?style=for-the-badge&logo=github" alt="GitHub Forks" /></a>
	<a href="https://github.com/BYWled/admin-system/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-Apache%202.0-1677FF?style=for-the-badge&logo=apache&logoColor=white" alt="Apache 2.0 License" /></a>
	<a href="https://github.com/BYWled/admin-system/commits/main"><img src="https://img.shields.io/github/last-commit/BYWled/admin-system?style=for-the-badge&logo=github" alt="Last Commit" /></a>
</p>

<p align="center">
	<a href="https://gitee.com/BYWled/admin-system"><img src="https://img.shields.io/badge/Gitee-代码镜像-C71D23?style=for-the-badge&logo=gitee&logoColor=white" alt="Gitee Mirror" /></a>
	<a href="https://gitcode.com/BYWled/admin-system"><img src="https://img.shields.io/badge/GitCode-代码镜像-2962FF?style=for-the-badge" alt="GitCode Mirror" /></a>
	<a href="https://mirror-admin.wled.top"><img src="https://img.shields.io/badge/Demo-在线预览-0A7E3F?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Online Demo" /></a>
	<a href="https://reactjs.org"><img src="https://img.shields.io/badge/React-19-149ECA?style=for-the-badge&logo=react&logoColor=white" alt="React 19" /></a   >
	<a href="https://vitejs.dev"><img src="https://img.shields.io/badge/Vite-7-7C3AED?style=for-the-badge&logo=vite&logoColor=white" alt="Vite 7" /></a>
</p>

<p align="center">
	<a href="https://github.com/BYWled/admin-system">GitHub</a> ·
	<a href="https://gitee.com/BYWled/admin-system">Gitee</a> ·
	<a href="https://gitcode.com/BYWled/admin-system">GitCode</a> ·
	<a href="https://mirror-admin.wled.top">在线预览</a>
</p>

## 项目概览

这个项目更适合作为前端管理后台练习模板或课程示例，而**不是直接用于生产环境**。当前代码已经具备完整的页面骨架与基础业务流程，主要特点如下：

- React 19 + Vite 7 的现代前端工程化方案
- Ant Design 6 组件体系，适合快速搭建中后台界面
- 基于 Axios 的统一请求封装与 JWT 鉴权流程
- 基于 React Router DOM 7 的*哈希路由*方案
- 登录校验、路由前置守卫、异常访问重定向
- 图表统计、图片上传、验证码、锁屏、深色模式、全屏模式等交互能力

## 仓库入口

| 平台     | 地址                                    | 说明                                  |
| -------- | --------------------------------------- | ------------------------------------- |
| GitHub   | https://github.com/BYWled/admin-system  | 主仓库，推荐用于 Issue、PR 与版本追踪 |
| Gitee    | https://gitee.com/BYWled/admin-system   | 中国国内镜像仓库，适合国内访问        |
| GitCode  | https://gitcode.com/BYWled/admin-system | 中国镜像仓库，便于多平台分发          |
| 在线预览 | https://mirror-admin.wled.top           | 主分支展示用预览地址                  |

## 当前功能

### 技术栈

| 类别     | 技术                     |
| -------- | ------------------------ |
| 核心框架 | React 19                 |
| 构建工具 | Vite 7                   |
| 路由     | React Router DOM 7       |
| UI 组件  | Ant Design 6             |
| 网络请求 | Axios                    |
| 样式     | Sass                     |
| 图表     | ECharts 6                |
| 日期处理 | dayjs / **Temporal API** |
| 截图导出 | html2canvas              |
| 图片裁切 | antd-img-crop            |
| 工具库   | js-md5、react-countup    |

### 认证与权限

- 登录页账号密码校验与前端验证码校验
- Token 持久化到 localStorage
- 进入受保护页面前自动校验登录态

### 后台布局与交互

- 左侧导航菜单与顶部菜单两种布局模式
- 深色模式切换
- 全屏模式切换
- 锁屏与解锁流程
- 返回顶部、右侧设置抽屉、基础错误页

### 业务模块

- 首页数据总览与趋势统计
- 信息列表、添加、编辑、删除、批量删除
- 信息分类、筛选、分页、详情
- 信息维护、头像上传、图片集上传
- 统计图表
- 角色列表与权限列表

## 目录结构

```text
react-admin-system/
├─ public/
├─ src/
│  ├─ api/                 # 接口请求封装
│  ├─ assets/              # 静态资源
│  ├─ router/              # 路由与前置守卫
│  ├─ styles/              # 全局样式与模块样式
│  ├─ utils/               # 请求实例、工具函数、验证码组件
│  ├─ views/
│  │  ├─ login/            # 登录页
│  │  ├─ layout/           # 主布局、头部、菜单、设置区
│  │  ├─ home/             # 首页总览
│  │  └─ .../              # 其它业务页面
│  └─ main.jsx             # 入口文件
├─ .github/workflows/      # GitHub Actions 工作流
├─ eslint.config.js
├─ index.html
├─ package.json
└─ vite.config.js
```

## 快速开始

### 环境要求

- Node.js 18 及以上
- 推荐使用 pnpm 9
- [**重要**] Temporal API：如果目标环境不支持，可能需要补充 Polyfill 或调整相关代码逻辑

说明：仓库包含 pnpm 锁文件，CI 工作流也使用 pnpm；如果使用 npm，也可以正常安装和运行。

### 1. 安装依赖

```bash
pnpm install
```

如果你使用 npm：

```bash
npm install
```

### 2. 启动开发环境

```bash
pnpm dev
```

默认访问地址：<http://localhost:5173>

### 3. 生产构建

```bash
pnpm build
```

### 4. 本地预览构建产物

```bash
pnpm preview
```

### 5. 代码检查

```bash
pnpm lint
```

### 后端与接口配置

项目使用统一的 Axios 实例并对API进行三层封装，请在 src/utils/service.js 中维护接口基地址：

```js
export const baseURL = 'https://******';
```

## 部署说明

仓库内提供了 GitHub Actions 自动部署工作流，可用于发布到 GitHub Pages
  - 如果需要部署到 Github ，需要调整 `.github/workflows/deploy.yml` 中的相关配置：
    - 构建前替换生产环境 baseUrl：
      ```yaml
      - name: 构建前替换生产环境 baseUrl
        run: |
          sed -i "s|export const baseURL = '/api'|export const baseURL = '***你的后端地址***'|g" src/utils/service.js
      ```
    - 部署到 gh-pages 分支
        ```yaml
        - name: 部署到 gh-pages 分支 🚀
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }} # 确保你提前给工作流授权
          publish_dir: ./dist
          publish_branch: gh-pages # 部署生成的分支
          commit_message: ${{ github.event.head_commit.message }}
          cname: ***你的域名或删除本行***
        ```
  - 如果你计划连接不同环境的后端，建议通过环境变量进一步拆分开发与生产配置

## 兼容性说明

项目中使用了 Temporal API，例如 `Temporal.Now.zonedDateTimeISO()`。这部分 API 仍属于较新的 JavaScript 时间能力，在部分浏览器或运行环境中可能需要 Polyfill 支持。

如果你想继续使用 Temporal API，可以参考 [Temporal API 文档](https://www.wled.top/2026/03/01/HelloTemporal/) 了解更多细节；如果你需要兼容不支持 Temporal 的环境，建议在相关代码中增加兼容性处理，例如使用 dayjs 或其他时间库作为替代方案。

## 适用场景与开发建议

本项目在遵守开源协议的情况下，包括但不限于以下场景使用：

- React 后台项目练习
- 管理系统课程作业或实训项目
- 中后台脚手架学习样例
- Ant Design 组件与业务页面组织方式参考

如果你准备继续维护这个项目，建议优先补充以下内容：

- 使用环境变量管理 API 地址与部署参数
- 为 Temporal 增加 Polyfill 或兼容性处理
- 为关键页面补充异常边界与请求错误兜底
- 为表单、鉴权与接口层补充测试
- 清理历史注释与遗留的实验代码

## 开源协议

本项目采用 Apache License 2.0 开源发布，详见 LICENSE。

这意味着你可以在遵守 Apache 2.0 协议要求的前提下使用、修改和分发本项目，包括商业使用；但你需要保留原始版权声明、许可证文本以及相关 NOTICE 信息（如适用），并明确说明你做出的修改。

## 致谢

- 
- UI 组件基于 [Ant Design](https://ant.design/)
- 图表能力基于 [Apache ECharts](https://echarts.apache.org/)
- 构建能力基于 [Vite](https://vitejs.dev/)
- 代码示例与项目结构参考了多个开源项目和社区资源

## 仓库说明

主分支 README 已按当前项目结构重新整理。如果你正在查看的是镜像仓库，请以当前分支代码和本 README 为准；历史版本中的**旧说明***、**旧协议**与**旧运行限制**已经不再适用。
