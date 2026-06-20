# GAPI 项目文档

## 文档目录

| 文档                                 | 说明               |
| ------------------------------------ | ------------------ |
| [architecture.md](./architecture.md) | 项目架构与模块关系 |
| [tech-stack.md](./tech-stack.md)     | 技术栈详解         |

## 项目概述

GAPI 是一个可自托管的 API 管理平台，提供接口文档管理、Mock 服务、接口测试、自动化测试、权限管理等功能。

## 快速导航

### 开发相关

- **启动开发服务器**: `pnpm dev`（默认端口 9999）
- **构建**: `pnpm build`（生产）/ `pnpm build:test`（测试）
- **测试**: `pnpm test`（Vitest）
- **代码检查**: `pnpm lint`

### 环境变量

环境变量配置在 `.env`（开发）、`.env.test`（测试）、`.env.prod`（生产）、`.env.gh`（GitHub Pages）中。

| 变量                      | 说明                         |
| ------------------------- | ---------------------------- |
| `VITE_APP_ENV`            | 环境标识（dev/test/prod）    |
| `VITE_APP_BASE`           | 路由基础路径                 |
| `VITE_APP_DEFAULT_SERVER` | 后端 API 地址                |
| `VITE_APP_ENABLE_MSW`     | 是否启用 Mock Service Worker |
| `VITE_POSTHOG_KEY`        | PostHog 分析 Key             |

### 目录结构一览

```
src/
├── main.tsx              # 应用入口
├── assets/               # 静态资源（SVG 图片等）
├── components/           # 共享组件
│   ├── ui/               #   shadcn/ui 基础组件
│   ├── layout/           #   布局组件（认证/全屏）
│   ├── data-table/       #   高级数据表格组件
│   └── lexical/          #   富文本编辑器组件
├── context/              # React Context
├── docs/                 # 文档（组件文档等）
├── feature/              # 页面级功能模块
│   ├── auth/             #   登录/注册/忘记密码
│   ├── authenticated/    #   需认证页面（仪表盘/任务/项目等）
│   └── error/            #   错误页面（403/404/500）
├── hooks/                # 自定义 Hooks
├── lib/                  # 基础设施
│   ├── http/             #   HTTP 客户端
│   ├── react-query/      #   TanStack Query 配置
│   └── posthog/          #   PostHog 分析
├── mocks/                # MSW Mock 数据
├── routes/               # 路由配置
│   ├── async/            #   需认证路由
│   ├── public/           #   公开路由
│   └── loader/           #   路由守卫
├── schema/               # Zod 验证 Schema
├── service/              # API 服务层
├── store/                # Zustand 状态管理
├── style/                # 全局样式与主题
└── types/                # TypeScript 类型定义
```
