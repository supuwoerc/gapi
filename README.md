<p align="center">
   <img src="./gapi.png" alt="Logo" width="280" height="auto" style="border-radius: 10px">
</p>

<div align="center">
   <a href="./README_zh.md">中文</a> |
   <a href="./README.md">English</a>
</div>

## 📖 Project Introduction

GAPI is a self-hosted AI-driven universal collaboration platform. Users create projects, configure AI employees with different roles and skills, submit requirements through conversational interactions, and AI employees automatically execute tasks following customizable workflows. The platform is not limited to any specific industry — it supports software development, design, operations, finance, customer service, and other team collaboration scenarios.

## ✨ Core Features

- 🤖 **AI Employees**: Configure fine-grained AI roles with custom skills and behaviors. Adaptable to any domain (development, design, operations, finance, customer service, etc.)
- 🔄 **Custom Workflows**: Visual workflow editor to define AI employee collaboration processes. Supports event-driven triggers, conditional branching, and cross-workflow orchestration
- 💬 **Conversational Requirements**: Submit requirements through natural dialogue within projects, automatically generating structured task cards
- 📋 **Task Management**: Kanban-style tracking with layered execution status display (summary + expandable detailed logs)
- 🔗 **Events & Integrations**: Connect external systems (code repositories, IM, enterprise apps, etc.) via event source templates, driving workflow execution through a unified event bus
- 🔧 **Execution Environments**: Extensible task execution environment management (sandboxes, API calls, third-party service connections)
- 🗺️ **Roadmap**: Milestone planning with bidirectional requirement association
- 📝 **Document Management**: Human-maintained documentation with AI-assisted generation
- 👥 **Permission Management**: RBAC-based access control with project visibility settings
- 📊 **Project Management**: Project creation, member management, and configuration

## 🛠️ Tech Stack

- **React 19** - Latest React version with concurrent features
- **TypeScript** - Type safety
- **Vite** - Modern build tool
- **shadcn/ui** - High-quality React component library
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible low-level components
- **Zustand** - Lightweight state management
- **TanStack Query** - Server state management
- **React Router** - Routing management
- **React Flow** - Workflow visual editor
- **Lexical** - Rich text editor
- **ky** - HTTP client
- **Zod** - Data validation

## 🚀 Quick Start

### Environment Requirements

- Node.js 22.16.0
- pnpm 10.24.0

### Install Dependencies

```bash
pnpm install
```

### Development Mode

```bash
pnpm dev
```

### Build for Production

```bash
pnpm build
```

### Preview Production Build

```bash
pnpm preview
```

## 📝 Development Guidelines

### Code Style

- Use ESLint + Prettier for code formatting
- Follow React best practices
- Use TypeScript strict mode

### Component Development

- Use functional components + Hooks
- Prioritize shadcn/ui components
- Maintain single responsibility for components

### Git Commit Convention

Follow Conventional Commits:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation update
- `style:` Code formatting adjustments
- `refactor:` Refactoring
- `test:` Test-related
- `chore:` Build/tool-related

## 🗺️ Roadmap

- [x] Project initialization
- [x] UI framework setup
- [x] Login/Registration
- [x] Project management
- [x] Task management
- [x] Document management
- [x] Workflow editor
- [x] Notification system
- [x] Admin panel (users, roles, permissions)
- [ ] AI employee management
- [ ] Event-driven system (event source templates, connection management, event bus)
- [ ] Execution environment management
- [ ] Conversational requirements
- [ ] Roadmap module
- [ ] Real-time execution status (WebSocket/SSE)
- [ ] AI-assisted document generation
- [ ] Event source template marketplace

## 🤝 Contribution Guide

Welcome to submit Issues and Pull Requests!

1. Fork this repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Submit a Pull Request
