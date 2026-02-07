<p align="center">
   <img src="./gapi.png" alt="Logo" width="280" height="auto" style="border-radius: 10px">
</p>

## 📖 项目简介

本项目是一个可以自托管的 API 管理平台，目的是提供更优雅的接口管理服务给开发和测试等人员，集成了现代化的UI和交互逻辑，如果你愿意，还可以接入相关 AI 服务来提升开发和测试效率。

## ✨ 核心功能

- 📝 **接口管理**：创建、编辑、维护 API 接口文档，反馈相关 API 问题
- 🎭 **Mock 服务**：快速定义接口返回数据的格式
- ⌚️ **压测服务**：快速收集接口压力测试结果
- 🧪 **接口测试**：类似 Postman 的接口调试功能
- 🤖 **自动化测试**：支持对 Response 断言
- 📥 **数据导入**：支持 Postman、HAR、Swagger 数据导入
- 👥 **权限管理**：RBAC权限对相关人员进行权限管理
- 📊 **项目/人员/文档管理**：项目、人员、组织和文档管理

## 🛠️ 技术栈

- **React 19** - 最新的 React 版本，支持并发特性
- **TypeScript** - 类型安全
- **Vite** - 现代化构建工具
- **shadcn/ui** - 高质量 React 组件库
- **Tailwind CSS** - 实用优先的 CSS 框架
- **Radix UI** - 无障碍的底层组件
- **Zustand** / **Jotai** - 轻量级状态管理（二选一）
- **TanStack Query** - 服务端状态管理
- **React Router** - 路由管理
- **Axios** - HTTP 客户端
- **Zod** - 数据验证

## 🚀 快速开始

### 环境要求

- Node.js 22.16.0
- pnpm 10.24.0

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev
```

### 构建生产版本

```bash
pnpm build
```

### 预览生产构建

```bash
pnpm preview
```

## 📝 开发规范

### 代码风格

- 使用 ESLint + Prettier 进行代码格式化
- 遵循 React 最佳实践
- 使用 TypeScript 严格模式

### 组件开发

- 使用函数组件 + Hooks
- 优先使用 shadcn/ui 组件
- 保持组件的单一职责

### Git 提交规范

遵循 Conventional Commits：

- `feat:` 新功能
- `fix:` 错误修复
- `docs:` 文档更新
- `style:` 代码格式调整
- `refactor:` 重构
- `test:` 测试相关
- `chore:` 构建/工具相关

## 🗺️ Roadmap

- [x] 项目初始化
- [x] UI 框架搭建
- [ ] 首页重构
- [ ] 登录/注册页面
- [ ] 项目管理模块
- [ ] 接口管理模块
- [ ] Mock 功能
- [ ] 接口测试功能
- [ ] 用户中心
- [ ] 权限管理
- [ ] 数据导入功能
- [ ] 自动化测试

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request
