<p align="center">
   <img src="./gapi.png" alt="Logo" width="280" height="auto" style="border-radius: 10px">
</p>

<div align="center">
   <a href="./README_zh.md">中文</a> |
   <a href="./README.md">English</a>
</div>

## 📖 项目简介

GAPI 是一个可自托管的 AI 驱动通用协作平台。用户创建项目后，为项目配置不同角色和技能的 AI 员工，通过对话式交互提出需求，AI 员工按照自定义工作流自动执行任务。平台不局限于特定行业，适用于软件开发、设计、运营、财务、客服等各种团队协作场景。

## ✨ 核心功能

- 🤖 **AI 员工管理**：配置细分角色的 AI 员工，支持自定义技能与行为。可适配任意领域（开发、设计、运营、财务、客服等）
- 🔄 **自定义工作流**：可视化工作流编辑器，定义 AI 员工协作流程。支持事件驱动触发、条件分支与跨工作流联动
- 💬 **对话式需求**：在项目内通过自然对话提出需求，自动生成结构化任务卡片
- 📋 **任务管理**：看板式任务跟踪，分层展示执行状态（概要 + 可展开的详细日志）
- 🔗 **事件与集成**：通过事件源模板接入外部系统（代码仓库、IM、企业应用等），统一事件驱动工作流执行
- 🔧 **执行环境**：可扩展的任务执行环境管理（沙盒、API 调用、第三方服务连接）
- 🗺️ **Roadmap**：里程碑规划，与需求双向关联
- 📝 **文档管理**：人工维护文档，AI 辅助生成
- 👥 **权限管理**：基于 RBAC 的访问控制，支持项目可见性设置
- 📊 **项目管理**：项目创建、成员管理与配置

## 🛠️ 技术栈

- **React 19** - 最新的 React 版本，支持并发特性
- **TypeScript** - 类型安全
- **Vite** - 现代化构建工具
- **shadcn/ui** - 高质量 React 组件库
- **Tailwind CSS** - 实用优先的 CSS 框架
- **Radix UI** - 无障碍的底层组件
- **Zustand** - 轻量级状态管理
- **TanStack Query** - 服务端状态管理
- **React Router** - 路由管理
- **React Flow** - 工作流可视化编辑器
- **Lexical** - 富文本编辑器
- **ky** - HTTP 客户端
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
- [x] 登录/注册
- [x] 项目管理
- [x] 任务管理
- [x] 文档管理
- [x] 工作流编辑器
- [x] 通知系统
- [x] 管理后台（用户、角色、权限）
- [ ] AI 员工管理
- [ ] 事件驱动系统（事件源模板、连接管理、事件总线）
- [ ] 执行环境管理
- [ ] 对话式需求
- [ ] Roadmap 模块
- [ ] 实时执行状态（WebSocket/SSE）
- [ ] AI 辅助文档生成
- [ ] 事件源模板市场

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request
