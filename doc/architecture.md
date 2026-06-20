# 项目架构与模块关系

## 整体架构

项目采用**分层架构 + 功能模块化**的设计，按职责分为以下层次：

```
┌─────────────────────────────────────────────────────────┐
│                    应用入口 (main.tsx)                    │
│  初始化: GSAP / Auth / i18n / PostHog / Router          │
└─────────────────────────────────────────────────────────┘
                            │
          ┌─────────────────┼─────────────────┐
          ▼                 ▼                  ▼
┌─────────────────┐ ┌──────────────┐ ┌──────────────────┐
│   routes/        │ │   store/     │ │   lib/           │
│   路由配置        │ │   状态管理    │ │   基础设施         │
└─────────────────┘ └──────────────┘ └──────────────────┘
          │                 │                  │
          ▼                 ▼                  ▼
┌─────────────────┐ ┌──────────────┐ ┌──────────────────┐
│   feature/       │ │   hooks/     │ │   service/       │
│   页面功能模块    │ │   自定义Hooks │ │   API 服务层      │
└─────────────────┘ └──────────────┘ └──────────────────┘
          │                                    │
          ▼                                    ▼
┌─────────────────┐                  ┌──────────────────┐
│   components/    │                  │   schema/        │
│   共享组件        │                  │   Zod 验证        │
└─────────────────┘                  └──────────────────┘
```

## 模块职责

### 1. 路由层 (`src/routes/`)

路由采用 React Router v7 的扁平配置结构，分为两大路由组：

```
routes/
├── index.tsx          # 路由聚合入口
├── public/index.tsx   # 公开路由（不需要登录）
├── async/index.tsx    # 异步路由（需要登录/权限）
└── loader/
    ├── auth-guard.ts      # 登录状态守卫
    └── permission-guard.ts # 权限点守卫
```

**路由分组设计：**

| 路由组  | 路径                                                           | 布局          | 权限要求             |
| ------- | -------------------------------------------------------------- | ------------- | -------------------- |
| Public  | `/login`, `/sign-up`, `/forgot-password`, `/otp`, `/500`, `/*` | Fullscreen    | 访客（已登录重定向） |
| General | `/dashboard`, `/tasks`, `/task/:id`, `/notifications`          | Authenticated | 需登录 + 权限点      |
| Pages   | `/projects`, `/documents`, `/workflow`                         | Authenticated | 需登录 + 权限点      |
| Other   | `/admin/*`, `/settings/*`                                      | Authenticated | 需登录 + 权限点      |

**路由守卫机制：**

- `requireAuth`: 检查 loginUser 是否存在，不存在则重定向到 `/login?redirect=xxx`
- `requireGuest`: 已登录用户访问公开页面时重定向到首页
- `withPermissions(key)`: 检查用户是否拥有对应 `route_permissions` 中的权限 key，无权限则返回 403

路由配置中通过 `handle` 字段携带元数据：

- `authMode`: 授权模式（`anonymous` / `loginRequired` / `permissionRequired`）
- `key`: 权限标识，与后端返回的 `route_permissions` 匹配
- `group`: 侧边栏菜单分组 key
- `title`: i18n 标题 key
- `icon`: lucide-react 图标名称
- `hidden`: 是否在菜单中隐藏

**权限路由动态生成流程：**

```
asyncRoutes (原始路由配置)
    │
    ▼
getPermissionRoutes(routes, userPermissions, isLogin, forbiddenLoader)
    │
    ├── authMode === 'anonymous'      → 保留路由
    ├── authMode === 'loginRequired'  → isLogin 时保留
    └── authMode === 'permissionRequired'
         └── key 在 userPermissions 中 → 保留
         └── key 不在                 → 替换为 403 页面
    │
    ▼
createBrowserRouter() 创建最终路由
```

### 2. 页面层 (`src/feature/`)

按功能域拆分为独立的页面模块，每个模块内部自包含 component、data、types：

```
feature/
├── auth/                          # 认证模块
│   ├── login.tsx                  # 登录页（含 Shiki 代码动效轮播）
│   ├── sign-up.tsx                # 注册页
│   ├── forgot-password.tsx        # 忘记密码
│   ├── otp.tsx                    # OTP 验证
│   ├── components/                # 模块私有组件
│   │   ├── auth-form.tsx          #   通用认证表单
│   │   ├── sign-up-form.tsx       #   注册表单
│   │   ├── forgot-password-form.tsx
│   │   └── otp-form.tsx
│   └── data/
│       └── constant.ts            # 轮播项、代码示例等常量
│
├── authenticated/                 # 需认证的功能页面
│   ├── dashboard/                 # 仪表盘（概览/分析/近期销售）
│   ├── tasks/                     # 任务管理（列表/详情）
│   ├── projects/                  # 项目管理（列表/详情/成员/设置）
│   ├── documents/                 # 文档管理（搜索/列表）
│   ├── notifications/             # 通知中心
│   ├── admin/                     # 管理后台
│   │   ├── users/                 #   用户管理
│   │   ├── roles/                 #   角色管理
│   │   └── permissions/           #   权限管理
│   └── settings/                  # 个人设置
│       ├── layout.tsx             #   设置页布局（含侧边导航）
│       ├── profile/               #   个人资料
│       └── notifications/         #   通知设置
│
└── error/                         # 错误页面
    ├── 403.tsx                    # 无权限
    ├── 404.tsx                    # 未找到
    └── 500.tsx                    # 服务器错误
```

所有 authenticated 页面采用路由级**懒加载**（`React.lazy`），首屏仅加载公开路由的代码。

### 3. 服务层 (`src/service/`)

API 调用封装层，每个领域一个文件/目录，与 schema 目录一一对应：

```
service/
├── auth/auth.ts          # 登录/注册/OTP/刷新令牌
├── user/user.ts          # 用户信息
├── admin/
│   ├── users.ts          # 管理端用户 CRUD
│   ├── roles.ts          # 角色管理
│   └── permissions.ts    # 权限管理
├── projects/projects.ts  # 项目 CRUD
├── tasks/
│   ├── tasks.ts          # 任务列表
│   └── detail.ts         # 任务详情
├── documents/index.ts    # 文档管理
├── notifications/
│   ├── list.ts           # 通知列表
│   └── notifications.ts  # 通知操作
├── menu/menu.ts          # 菜单数据
└── captcha/captcha.ts    # 验证码
```

每个 service 函数直接返回 `ky` 的链式调用结果，范式：

```typescript
export function login(params: LoginParams) {
  return post<LoginUser>('/auth/login', { json: params })
}
```

### 4. HTTP 层 (`src/lib/http/`)

基于 [ky](https://github.com/sindresorhus/ky) 的 HTTP 客户端封装：

```
lib/http/
├── index.ts          # 主客户端实例 + 导出的 get/post/put/patch/del
├── constants.ts      # 常量（token key, locale key, 业务码）
├── auth-provider.ts  # 令牌提供者接口（依赖注入模式）
├── interceptors.ts   # 请求/响应拦截器
└── error.ts          # 业务错误类
```

**请求流程：**

```
service.login(params)
    │
    ▼
post<T>('/auth/login', { json: params })
    │
    ▼
ky.create({ prefix, retry, hooks, parseJson })
    │
    ├── beforeRequest:  注入 token (Authorization header) 和 locale
    │
    ├── 发送请求 → 后端
    │
    ├── afterResponse:
    │   ├── 5xx → 跳转 /500
    │   ├── token 过期 (BizCode) → 自动刷新 → retry 原始请求
    │   └── 刷新失败 → 清空登录态 → 跳转登录页
    │
    └── parseJson: 解包 { code, data, message } 信封
         ├── code === SUCCESS → 返回 data
         └── 其他 → throw BizRequestError
```

**关键设计：**

- **Token 刷新防抖**：多个并发的 expired 请求共享同一个 `refreshPromise`，避免重复刷新
- **AuthProvider 模式**：通过 `setAuthProvider()` 注入 token/getter/setter，解耦 HTTP 层与 store
- **重试次数预留**：`retry.limit=1` 为 token 刷新后的 `ky.retry()` 留一次重试机会

### 5. 状态管理层 (`src/store/`)

采用 Zustand + immer + devtools + persist 组合：

| Store            | 用途                               | 持久化             |
| ---------------- | ---------------------------------- | ------------------ |
| `login-user`     | 登录用户信息、token、权限          | ✅（排除敏感字段） |
| `system-config`  | 主题模式、主题色、语言、侧边栏状态 | ✅                 |
| `active-project` | 当前选中的项目                     | ✅                 |

**状态与缓存的分工：**

- **Zustand** → 客户端全局状态（用户信息、UI 偏好）
- **TanStack Query** → 服务端数据缓存（列表数据、详情数据），自动管理 loading/error/refetch

### 6. Schema 层 (`src/schema/`)

使用 Zod 定义运行时数据验证 schema，与 service 目录结构一一对应：

```
schema/
├── auth/auth.ts              # LoginUser 等
├── admin/
│   ├── permission.ts
│   └── role.ts
├── user/user.ts
├── project/project.ts
├── task/
│   ├── task.ts               # 任务列表项
│   └── detail.ts             # 任务详情
├── document/document.ts
├── notification/notification.ts
└── captcha/captcha.ts
```

Schema 的主要用途：

- **API 返回值验证**：确保后端返回数据结构符合预期
- **表单验证**：通过 `@hookform/resolvers` 集成到 React Hook Form
- **类型推导**：`z.infer<typeof schema>` 生成 TypeScript 类型

### 7. 组件层 (`src/components/`)

```
components/
├── ui/               # shadcn/ui 基础组件 (40+)
│                     # button, dialog, form, table, sidebar, select...
├── layout/           # 布局组件
│   ├── fullscreen.tsx         # 全屏布局（登录页等）
│   └── authenticated/         # 认证布局（主应用布局）
│       ├── authenticated.tsx  #   布局容器
│       ├── app-sidebar.tsx    #   左侧菜单栏
│       ├── app-header.tsx     #   顶部导航
│       ├── app-main.tsx       #   主内容区
│       └── components/        #   布局内组件
│           ├── menu-group.tsx       # 菜单分组
│           ├── project-switcher.tsx # 项目切换器
│           ├── sidebar-user.tsx     # 用户信息
│           └── top-menu.tsx         # 顶部菜单导航
├── data-table/       # 高级数据表格组件族
│                     # 含分页、排序、筛选、工具栏、视图选项
├── lexical/          # Lexical 富文本编辑器
│   └── read-only-editor.tsx  # 只读编辑器
└── 全局共享组件
    ├── captcha-dialog.tsx    # 验证码弹窗
    ├── command-menu.tsx      # 命令面板 (⌘K)
    ├── config-drawer.tsx     # 配置抽屉（主题/布局切换）
    ├── confirm-dialog.tsx    # 确认弹窗
    ├── language-switcher.tsx # 语言切换
    ├── profile-dropdown.tsx  # 个人菜单下拉
    ├── theme-switcher.tsx    # 主题切换
    ├── search.tsx            # 搜索
    └── ...
```

**布局层次:**

```
FullscreenLayout (login/sign-up/forgot-password/otp)
    └── 居中卡片式内容

AuthenticatedLayout (主应用)
    ├── AppSidebar（可折叠，支持 offcanvas/icon/none 模式）
    │   ├── ProjectSwitcher     # 项目选择下拉
    │   ├── MenuGroup × N       # 菜单分组（General/Pages/Other）
    │   └── SidebarUser         # 用户信息
    └── AppMain
        ├── AppHeader
        │   ├── TopMenu         # 面包屑导航
        │   ├── Search          # 搜索按钮
        │   ├── LanguageSwitcher
        │   ├── ThemeModeSwitcher
        │   └── ProfileDropdown
        └── <Outlet />         # 页面内容
```

### 8. Hooks 层 (`src/hooks/`)

```
hooks/
├── use-data-table.ts            # 数据表格状态管理（排序/筛选/分页）
├── use-sidebar-menu.ts          # 侧边栏菜单生成（基于路由 + 权限）
├── use-mobile.ts                # 移动端检测
├── use-theme.ts                 # 主题管理
├── use-debounced-callback.ts    # 防抖回调
├── use-dialog-state.tsx         # 弹窗状态管理
├── use-scroll-restoration.ts    # 滚动位置恢复
├── use-transition-key.ts        # 路由过渡 Key
├── use-as-ref.ts / use-callback-ref.ts / use-lazy-ref.ts  # Ref 工具
├── use-isomorphic-layout-effect.ts  # SSR 安全的 useLayoutEffect
└── tour/
    ├── constants.ts
    └── use-tour.ts              # 产品导览 (driver.js)
```

### 9. 国际化 (i18n)

基于 i18next + react-i18next，采用**按页面分包 + 按需加载**策略：

```
public/locales/
├── zh/                          # 中文
│   ├── global.json              #   全局通用文案
│   ├── route.json               #   路由/菜单标题
│   ├── auth.json                #   登录/注册
│   ├── dashboard.json           #   仪表盘
│   ├── tasks.json / task-detail.json
│   ├── projects.json
│   ├── documents.json
│   ├── notifications.json
│   ├── users.json / roles.json / permissions.json
│   ├── settings.json
│   ├── errors.json              #   错误信息
│   └── component.json           #   组件文案
└── en/                          # 英文（结构同上）
```

**加载方式**: `i18next-http-backend` 在运行时按页面的 `ns` 声明按需拉取对应 JSON 文件。

### 10. Mock 层 (`src/mocks/`)

使用 MSW (Mock Service Worker) 在浏览器 Service Worker 层面拦截请求：

```
mocks/
├── browser.ts           # 浏览器端 MSW worker
├── data/                # Mock 数据生成（基于 @faker-js/faker）
├── handlers/            # 请求处理器
└── utils/               # Mock 工具函数
```

开发环境下通过 `VITE_APP_ENABLE_MSW=true` 启用，`bootstrap()` 中条件加载。

## 核心数据流

```
用户操作
    │
    ▼
Feature 页面组件
    │
    ├── 表单提交 → react-hook-form → zod 验证 → service → ky → 后端 API
    │                                                              │
    │                                              ┌───────────────┘
    │                                              ▼
    │                                     parseJson 解包
    │                                              │
    │                                    ┌─────────┴─────────┐
    │                                    ▼                   ▼
    │                              code === SUCCESS      code !== SUCCESS
    │                                    │                   │
    │                                    ▼                   ▼
    │                              返回 data           throw BizRequestError
    │                                    │                   │
    │                                    ▼                   ▼
    └────────────────────────→  TanStack Query    toast 错误提示
                                          │
                                          ▼
                                   更新缓存 / UI
```

## 页面功能清单

| 功能       | 路径                      | 权限 Key        | 状态      |
| ---------- | ------------------------- | --------------- | --------- |
| 登录       | `/login`                  | -               | ✅ 已实现 |
| 注册       | `/sign-up`                | -               | ✅ 已实现 |
| 忘记密码   | `/forgot-password`        | -               | ✅ 已实现 |
| OTP 验证   | `/otp`                    | -               | ✅ 已实现 |
| 仪表盘     | `/dashboard`              | `dashboard`     | ✅ 已实现 |
| 任务列表   | `/tasks`                  | `tasks`         | ✅ 已实现 |
| 任务详情   | `/task/:id`               | `tasks`         | ✅ 已实现 |
| 通知中心   | `/notifications`          | `notifications` | ✅ 已实现 |
| 项目列表   | `/projects`               | `projects`      | ✅ 已实现 |
| 文档管理   | `/documents`              | `documents`     | ✅ 已实现 |
| 工作流     | `/workflow`               | `workflow`      | 🚧 占位   |
| 用户管理   | `/admin/users`            | `admin`         | ✅ 已实现 |
| 角色管理   | `/admin/roles`            | `admin`         | ✅ 已实现 |
| 权限管理   | `/admin/permissions`      | `admin`         | ✅ 已实现 |
| 个人资料   | `/settings`               | -               | ✅ 已实现 |
| 通知设置   | `/settings/notifications` | -               | ✅ 已实现 |
| 错误页 403 | -                         | -               | ✅ 已实现 |
| 错误页 404 | `/*`                      | -               | ✅ 已实现 |
| 错误页 500 | `/500`                    | -               | ✅ 已实现 |
