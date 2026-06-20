# 技术栈详解

## 概览

| 类别   | 技术       | 版本   |
| ------ | ---------- | ------ |
| 框架   | React      | 19.2+  |
| 语言   | TypeScript | 6.0    |
| 构建   | Vite       | 8.0    |
| 包管理 | pnpm       | 10.29+ |
| Node   | Node.js    | 24.13  |

## 核心技术栈

### 1. 前端框架 — React 19

使用 React 19 的最新特性：

- **React Compiler** (babel-plugin-react-compiler)：自动 Memoization，无需手动 `useMemo`/`useCallback`
- **Server Components 就绪**：项目架构为未来迁移预留空间
- **StrictMode**: 开发环境下启用，检测潜在问题

### 2. 构建工具 — Vite 8

**插件：**
| 插件 | 用途 |
|------|------|
| `@vitejs/plugin-react` | React Fast Refresh + JSX 编译 |
| `@rolldown/plugin-babel` | Babel 转译（React Compiler preset） |
| `@tailwindcss/vite` | Tailwind CSS v4 集成 |
| `vite-plugin-svgr` | SVG → React 组件 |
| `vite-plugin-checker` | 开发时 TypeScript + ESLint 检查 |

**构建优化：**

- **代码分割**：手动配置 `manualChunks`，按库类别拆分
  - `react` — React + ReactDOM
  - `router` — React Router
  - `ui` — Radix UI + shadcn 生态组件
  - `charts` — Recharts + d3
  - `query` — TanStack 系列
  - `utils` — lodash-es, ky, zod, i18next, zustand 等工具库
- **压缩**：Terser（tree shaking + 压缩）
- **Source Map**: 生产构建关闭

**开发体验：**

- 端口 9999，默认自动打开浏览器
- HMR 端口 12345（解决 Vite issue #14328）
- 路径别名：`@/` → `src/`

### 3. 路由 — React Router v7

- **配置式路由**：扁平路由配置数组，支持嵌套
- **懒加载**：所有页面级组件通过 `lazy` + `import()` 实现代码分割
- **路由守卫**：
  - `loader` 函数实现守卫逻辑（auth guard / permission guard）
  - `redirect()` 处理未登录/无权限跳转
- **布局路由**：通过 parent route + `<Outlet />` 实现布局嵌套
- **HydrateFallback**：懒加载期间的加载状态

### 4. 状态管理 — Zustand + TanStack Query

#### Zustand（客户端状态）

三个全局 Store，均使用组合中间件：

```
create → immer → devtools → persist
```

| Store                | 持久化                   | 内容               |
| -------------------- | ------------------------ | ------------------ |
| `loginUserStore`     | ✅（排除权限等敏感字段） | 登录用户、token    |
| `systemConfigStore`  | ✅                       | 主题、语言、侧边栏 |
| `activeProjectStore` | ✅                       | 当前选中项目       |

#### TanStack Query v5（服务端缓存）

- **缓存策略**：`refetchOnWindowFocus: false`, `retry: false`
- **错误处理**：全局 `MutationCache` / `QueryCache` 错误回调，统一 toast 提示
- **缓存预填**：登录时通过 `setQueryData` 预填用户信息，避免额外请求
- **缓存恢复**：路由守卫中通过 `ensureQueryData` 确保关键数据可用

**分工原则：** Zustand 管理客户端 UI 状态，TanStack Query 管理所有服务端数据。

### 5. HTTP 客户端 — ky

基于 Fetch API 的轻量 HTTP 客户端：

- **拦截器**：`beforeRequest`（注入 token/locale）、`afterResponse`（处理 token 过期）
- **Token 自动刷新**：单例 Promise 防抖，刷新后自动重试原请求
- **响应解包**：`parseJson` 将 `{ code, data, message }` 信封解包为 `data`
- **业务错误类**：`BizRequestError` 封装业务错误码和消息

详细流程见 [architecture.md#4-http-层-srclibhttp](./architecture.md#4-http-层-srclibhttp)。

### 6. UI 组件 — shadcn/ui + Radix UI

**组件体系：**

```
shadcn/ui 组件 (40+)
├── 基于 Radix UI 的无障碍基础组件
│   ├── Dialog, AlertDialog, Popover, HoverCard, DropdownMenu
│   ├── Select, Checkbox, Toggle, Switch, Slider
│   ├── Tabs, Collapsible, ScrollArea, Progress
│   └── ...
├── 基于 Tailwind CSS 的样式层
└── class-variance-authority (CVA) 样式变体
```

**自定义 UI 组件：**

- `action-bar` — 表格操作栏
- `combobox` — 搜索下拉
- `cropper` — 图片裁剪
- `empty` — 空状态
- `faceted` — 多选筛选
- `input-group` — 输入框组合
- `mention` — @提及（基于 @diceui/mention）
- `sortable` — 拖拽排序（基于 @dnd-kit）
- `spinner` — 加载指示器
- `stat` — 统计数字

### 7. 样式方案 — Tailwind CSS v4

- **Tailwind CSS v4** + `tw-animate-css` 动画库
- **OKLCH 色彩空间**：所有颜色使用 OKLCH，更均匀的视觉对比
- **多主题**：支持 green / orange / red / rose / violet / yellow / blue / zinc 8 套主题色
- **暗色模式**：通过 `.dark` class 切换，支持 `prefers-color-scheme`
- **自定义 variant**：`dark` variant 通过 `@custom-variant dark (&: is(.dark *))` 定义
- **CSS 变量驱动**：所有 shadcn 组件颜色通过 CSS 变量控制，主题切换只需修改变量值

### 8. 数据表格 — TanStack React Table + 自定义组件族

基于 `@tanstack/react-table` v8 构建了完整的数据表格解决方案：

| 组件                       | 功能                         |
| -------------------------- | ---------------------------- |
| `DataTable`                | 核心表格（排序、选择、展开） |
| `DataTablePagination`      | 分页控制                     |
| `DataTableToolbar`         | 基础工具栏                   |
| `DataTableAdvancedToolbar` | 高级工具栏                   |
| `DataTableFilterMenu`      | 列筛选菜单                   |
| `DataTableFilterList`      | 活跃筛选标签                 |
| `DataTableFacetedFilter`   | 多选筛选项                   |
| `DataTableDateFilter`      | 日期筛选                     |
| `DataTableRangeFilter`     | 范围筛选                     |
| `DataTableSliderFilter`    | 滑块筛选                     |
| `DataTableSortList`        | 排序列表                     |
| `DataTableViewOptions`     | 列显隐切换                   |
| `DataTableSkeleton`        | 加载骨架屏                   |

所有管理页面（users/roles/permissions/tasks/projects/documents/notifications）均使用此表格体系。

### 9. 表单 — React Hook Form + Zod

```typescript
// 范式
const form = useForm<Schema>({
  resolver: zodResolver(schema),
  defaultValues: { ... },
})
```

- **Zod Schema** → TypeScript 类型（编译时） + 运行时验证
- **`@hookform/resolvers`** → 桥接 Zod 与 React Hook Form
- **自定义 Form 组件**：`FormField` + `FormItem` + `FormLabel` + `FormControl` + `FormMessage`

### 10. 动画 — GSAP + Motion

| 库                     | 用途                                   |
| ---------------------- | -------------------------------------- |
| GSAP (GreenSock)       | 复杂入场动画、文字分裂动画、时间线编排 |
| Motion (framer-motion) | 组件级过渡动画（布局变化、列表进出）   |
| `@gsap/react`          | GSAP 的 React 集成 hook (`useGSAP`)    |
| `shiki-magic-move`     | 代码块间的平滑过渡动画                 |

**使用场景：**

- 登录页：GSAP SplitText 文字入场 + Shiki Magic Move 代码动效
- 列表页：Motion 的 `AnimatePresence` 实现列表项动画
- 页面过渡：`useTransitionKey` + Motion 实现路由切换动画

### 11. 国际化 — i18next

- **分包策略**：每个功能页面一个 JSON 命名空间文件
- **按需加载**：`i18next-http-backend` 运行时按 `ns` 拉取
- **命名空间**：`global`, `route`, `auth`, `dashboard`, `tasks`, `task-detail`, `projects`, `documents`, `notifications`, `users`, `roles`, `permissions`, `settings`, `errors`, `component`
- **分隔符**：`ns:key` 格式（如 `route:login`）；`nsSeparator: ':'`, `keySeparator: '.'`
- **回退语言**：中文 (`zh`)
- **Zod 错误消息**：根据当前语言切换 `z.config()` 内置 locale

### 12. 测试 — Vitest + Testing Library + MSW

| 工具                      | 用途                              |
| ------------------------- | --------------------------------- |
| Vitest 4                  | 测试运行器（兼容 Jest API）       |
| @testing-library/react    | 组件渲染测试                      |
| @testing-library/jest-dom | DOM 断言扩展                      |
| @testing-library/dom      | DOM 查询                          |
| MSW 2                     | API Mock（Service Worker 层拦截） |
| jsdom 29                  | DOM 环境模拟                      |
| @vitest/coverage-v8       | 代码覆盖率                        |

**测试范围：**

- `src/components/**/*.{test,spec}.*`
- `src/test/**/*.{test,spec}.*`

### 13. 代码质量

| 工具            | 配置                                                        |
| --------------- | ----------------------------------------------------------- |
| **ESLint 9**    | flat config, TypeScript, React Hooks, import 排序, Tailwind |
| **Prettier 3**  | import 自动排序（`@trivago/prettier-plugin-sort-imports`）  |
| **Husky**       | Git hooks 管理                                              |
| **lint-staged** | 暂存文件自动格式化 + lint                                   |
| **commitlint**  | Conventional Commits 校验                                   |
| **knip**        | 死代码/未使用依赖检测                                       |

**TypeScript 严格模式：**

```json
{
  "strict": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "erasableSyntaxOnly": true,
  "noFallthroughCasesInSwitch": true
}
```

### 14. 分析监控

| 工具    | 用途                                  |
| ------- | ------------------------------------- |
| PostHog | 用户行为分析、Feature Flags、用户识别 |

通过 `@posthog/react` 的 `PostHogProvider` 包裹应用根组件。

## 依赖关系图

```
                    ┌──────────┐
                    │  React 19 │
                    └────┬─────┘
                         │
     ┌───────────────────┼───────────────────┐
     ▼                   ▼                   ▼
┌─────────┐      ┌──────────────┐     ┌───────────┐
│ 路由     │      │ 状态管理      │     │ HTTP      │
│ react   │      │ zustand      │     │ ky        │
│ router  │      │ tanstack     │     │           │
│ 7       │      │ query 5      │     │           │
└────┬────┘      └──────┬───────┘     └─────┬─────┘
     │                  │                   │
     ▼                  ▼                   ▼
┌─────────────────────────────────────────────────┐
│                   UI 层                          │
│  shadcn/ui + Radix UI + Tailwind CSS v4         │
│  TanStack React Table + Recharts                │
│  React Hook Form + Zod                          │
│  GSAP + Motion + shiki-magic-move               │
└─────────────────────┬───────────────────────────┘
                      │
     ┌────────────────┼────────────────┐
     ▼                ▼                ▼
┌─────────┐   ┌──────────┐    ┌───────────┐
│ i18n    │   │ 测试      │    │ 质量       │
│ i18next │   │ Vitest   │    │ ESLint    │
│         │   │ MSW      │    │ Prettier  │
└─────────┘   └──────────┘    └───────────┘
```
