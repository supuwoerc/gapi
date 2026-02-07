<p align="center">
   <img src="./gapi.png" alt="Logo" width="280" height="auto" style="border-radius: 10px">
</p>

<div align="center">
   <a href="./README_zh.md">中文</a> |
   <a href="./README.md">English</a>
</div>

## 📖 Project Introduction

This project is a self-hosted API management platform designed to provide elegant API management services for developers, testers, and other personnel. It integrates modern UI and interaction logic, and if desired, can be connected to relevant AI services to enhance development and testing efficiency.

## ✨ Core Features

- 📝 **API Management**: Create, edit, and maintain API documentation, and report related API issues
- 🎭 **Mock Service**: Quickly define the format of interface response data
- ⌚️ **Load Testing Service**: Rapidly collect interface pressure test results
- 🧪 **API Testing**: API debugging functionality similar to Postman
- 🤖 **Automated Testing**: Supports assertions on responses
- 📥 **Data Import**: Supports importing data from Postman, HAR, and Swagger
- 👥 **Permission Management**: RBAC-based permission management for relevant personnel
- 📊 **Project/Personnel/Document Management**: Management of projects, personnel, organizations, and documents

## 🛠️ Tech Stack

- **React 19** - Latest React version with concurrent features
- **TypeScript** - Type safety
- **Vite** - Modern build tool
- **shadcn/ui** - High-quality React component library
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible low-level components
- **Zustand** / **Jotai** - Lightweight state management (choose one)
- **TanStack Query** - Server state management
- **React Router** - Routing management
- **Axios** - HTTP client
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
- [ ] Homepage redesign
- [ ] Login/Registration pages
- [ ] Project management module
- [ ] API management module
- [ ] Mock functionality
- [ ] API testing functionality
- [ ] User center
- [ ] Permission management
- [ ] Data import functionality
- [ ] Automated testing

## 🤝 Contribution Guide

Welcome to submit Issues and Pull Requests!

1. Fork this repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Submit a Pull Request
