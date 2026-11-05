# iBlog Web

微服务博客系统的前端，Vue 3 + Vite + Element Plus。

配套后端：[blog](https://github.com/interesting-sudo/blog)（Spring Cloud Alibaba 七服务）

## 在线预览（演示模式）

打开 **https://interesting-sudo.github.io/blog-web/** 即可浏览首页、文章详情、个人主页、管理后台。

演示模式用内置示例数据撑起页面，**不需要任何后端**，右下角会有「演示模式」标识，方便与真实数据区分。

## 本地开发

```bash
npm install
npm run dev          # http://localhost:5173，接口指向 http://localhost:8080/api
```

后端起来之前页面会提示服务不可用，属于预期行为。

## 演示模式（无需后端）

```bash
npm run dev:demo     # 本地开发，接口走内置 mock
npm run build:demo   # 打出纯静态站点
```

关闭演示模式后，mock 相关代码不会被包含进构建产物（动态 import + 环境变量开关）。

相关文件：

```
src/demo/
├── index.js       # 入口：接管网络层 + 注入演示账号 + 右下角标识
├── adapter.js     # axios 自定义 adapter，按 URL 返回 mock 数据
└── mockData.js    # 文章 / 分类 / 评论 / 用户等示例数据
```

原理是把 `axios` 的 `adapter` 换成内置实现，**页面与 API 模块无需任何改动**。

## 页面

| 路由 | 说明 |
|---|---|
| `/home` | 首页：搜索、分类筛选、瀑布流文章列表、滚动加载 |
| `/article/:id` | 文章详情：目录、代码高亮、点赞收藏、两级评论 |
| `/my-home` | 个人主页：资料、统计、我的文章与收藏 |
| `/publish` `/edit/:id` | 创作与编辑，接入 AI 起标题 / 写摘要 / 选区改写 |
| `/admin/*` | 管理后台：用户、文章、分类、标签、评论 |
| `/login` `/register` `/forgot-password` | 登录注册与找回密码 |

## 构建与部署

```bash
npm run build                              # 生产构建
npx vite build --base=/blog-web/           # 部署到子路径
```

生产接口地址在 `.env.production` 的 `VITE_API_BASE_URL`，同域部署用 `/api` 走反向代理即可。

> 路由使用 `createWebHistory(import.meta.env.BASE_URL)`，配合静态托管的 `404.html` 回退，刷新子路由不会白屏。
