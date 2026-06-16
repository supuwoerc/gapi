# 项目级 RBAC 权限设计

## 概述

将现有的全局 RBAC 扩展为分层 RBAC（系统级 + 项目级），实现项目粒度的权限管控。参考 GitHub Organization + Repository 的权限模型。

## 设计目标

1. 系统级角色管系统层面操作，项目级角色管项目内资源操作
2. 项目创建时自动生成预置角色和权限数据
3. 项目 Owner 可自由调整角色-权限绑定
4. 前端权限检查机制复用现有模式，仅增加项目上下文

## 权限分层

```
┌─────────────────────────────────────┐
│  系统层（全局角色）                       │
│  Admin / Member                      │
│  → 用户管理、创建项目、系统设置、审计日志  │
└─────────────────────────────────────┘
              │ 用户进入某个项目
              ▼
┌─────────────────────────────────────┐
│  项目层（项目角色）                       │
│  Owner / Editor / Viewer + 自定义角色  │
│  → API、Mock、测试、文档等资源操作        │
└─────────────────────────────────────┘
```

### 系统级角色

| 角色   | 职责                                        |
| ------ | ------------------------------------------- |
| Admin  | 全部系统操作 + 所有项目全权（无需加入）     |
| Member | 登录系统、被邀请进项目、创建/删除自己的项目 |

系统级角色精简为两个，原有的细分权限中涉及项目内资源的部分下沉到项目层。创建和删除项目不需要系统级权限，任何用户都可以创建项目，项目 Owner 可以删除自己的项目。

### 项目级角色

| 角色       | 预置 | 可删除 | 说明                                              |
| ---------- | ---- | ------ | ------------------------------------------------- |
| Owner      | 是   | 否     | 项目全部操作 + 项目设置 + 成员管理 + 角色权限管理 |
| Editor     | 是   | 否     | 项目资源 CRUD                                     |
| Viewer     | 是   | 否     | 项目资源只读                                      |
| 自定义角色 | 否   | 是     | Owner 创建，支持继承                              |

## 数据模型

### 新增表

```sql
-- 项目成员表
project_member {
  id            PK
  project_id    FK → project.id
  user_id       FK → user.id
  project_role_id  FK → project_role.id
  status        enum(active, pending)  -- pending 用于申请待审批
  joined_at     timestamp
  invited_by    FK → user.id (nullable)
  created_at    timestamp
  updated_at    timestamp
  deleted_at    timestamp (nullable)
}

-- 项目角色表
project_role {
  id            PK
  project_id    FK → project.id
  name          string        -- "Owner", "Editor", "Viewer", 或自定义名称
  description   string
  is_preset     boolean       -- 预置角色不可删除
  parent_id     FK → project_role.id (nullable)  -- 角色继承
  created_at    timestamp
  updated_at    timestamp
  deleted_at    timestamp (nullable)
}

-- 项目角色权限表
project_role_permission {
  id              PK
  project_role_id FK → project_role.id
  module          string    -- api, mock, test, doc...
  action          string    -- create, read, update, delete
  effect          enum(allow, deny)
  created_at      timestamp
  updated_at      timestamp
  deleted_at      timestamp (nullable)
}
```

### 项目表扩展

```sql
-- project 表新增字段
project {
  ...existing fields
  visibility    enum(public, private)  -- 项目可见性
}
```

### 与现有模型关系

| 现有       | 新增                    | 职责               |
| ---------- | ----------------------- | ------------------ |
| role       | 保留                    | 系统级操作         |
| permission | 保留                    | 系统级权限定义     |
| user_role  | 保留                    | 用户-系统角色绑定  |
| —          | project_role            | 项目级角色定义     |
| —          | project_member          | 用户-项目-角色绑定 |
| —          | project_role_permission | 项目角色-权限绑定  |

## 权限检查流程

```
用户请求操作
    │
    ▼
是系统级操作？（用户管理、项目创建/删除、系统设置）
    ├── 是 → 走现有全局 RBAC 检查（不变）
    │
    └── 否 → 项目内操作
              │
              ▼
         用户是系统 Admin？
              ├── 是 → 允许（short-circuit）
              │
              └── 否 → 用户是该项目成员？
                        ├── 否 → 拒绝（公开项目可见但无操作权限）
                        │
                        └── 是 → 获取用户项目角色的有效权限
                                  （自身权限 + 继承链权限）
                                  │
                                  ▼
                             检查对应 module + action 的 effect
                                  ├── allow → 允许
                                  └── 无匹配或 deny → 拒绝
```

## 项目角色规则

### 预置角色

- Owner / Editor / Viewer 在项目创建时自动生成
- 不可删除，不可改名
- 权限绑定可由 Owner 自由调整

### 自定义角色

- Owner 可创建新角色
- 支持选择父角色（继承父角色权限）
- 不选父角色则初始权限为空
- 可删除（需先将该角色的成员迁移到其他角色）

### 权限池

权限条目由系统定义，项目内不可新增也不可删除。所有项目共享同一套权限池：

```
api:create, api:read, api:update, api:delete
mock:create, mock:read, mock:update, mock:delete
test:create, test:read, test:update, test:delete
doc:create, doc:read, doc:update, doc:delete
...（根据实际模块扩展）
```

### 角色继承

与现有系统级角色继承机制一致：

- 子角色继承父角色所有 allow 权限
- 子角色可覆盖父角色权限（通过 deny）
- 有效权限 = 继承链上所有 allow - 自身 deny

## 项目可见性

| 可见性  | 非成员行为                                                     |
| ------- | -------------------------------------------------------------- |
| public  | 可以看到项目存在，可以申请加入，但无任何资源操作权限（包括读） |
| private | 不可见，仅邀请加入                                             |

由项目 Owner 在项目设置中配置。公开项目不自动授予读权限，避免出现"外部用户权限大于项目成员"的矛盾（比如 Owner 把 Viewer 的 read 权限收掉后，未加入的用户反而能读）。

**非成员访问公开项目的权限处理：** 非成员不在 project_member 表中，后端对公开项目的非成员请求隐式返回所有模块的 read 权限。前端通过 fetchPermissions 正常获取，无需特殊分支。

**待审批状态（pending）：** project_member.status 为 pending 的记录视为未加入，权限检查时忽略。审批通过后 status 变为 active 才生效。

## 成员管理

### 加入方式

| 方式 | 适用范围       | 流程                         |
| ---- | -------------- | ---------------------------- |
| 邀请 | 所有项目       | Owner 邀请 → 用户接受 → 加入 |
| 申请 | 仅 public 项目 | 用户申请 → Owner 审批 → 加入 |

### 成员操作

- Owner 可邀请用户并指定角色
- Owner 可修改成员角色
- Owner 可移除成员
- 成员可主动退出项目（Owner 不可退出，需先转让）

## 前端改造

### API 层

`fetchPermissions` 接口扩展：

```ts
// 现有 — 系统级权限
fetchPermissions({ module })

// 新增 — 项目级权限
fetchPermissions({ module, projectId })
```

后端根据是否传 `projectId` 决定走哪层权限检查。

### Store 扩展

```ts
// 现有 useLoginUserStore 保留

// 新增项目权限相关 state
interface ProjectPermissionState {
  currentProjectId: string | null
  // projectId → { module → permissions[] }
  projectPermissions: Record<string, Record<string, string[]>>
  setCurrentProject: (projectId: string) => void
  fetchProjectPermissions: (params: { module: string; projectId: string }) => Promise<void>
  getProjectModulePermissions: (module: string) => string[]
  hasProjectPermission: (permission: string) => boolean
}
```

### 权限检查 Hook

```ts
// 系统级 — 不变
const canManageUsers = usePermission('system:user:create')

// 项目级 — 新增，自动取 currentProjectId
const canEditApi = useProjectPermission('api:update')
const canDeleteMock = useProjectPermission('mock:delete')
```

### 登录数据扩展

```ts
interface LoginResponse {
  // 现有字段保留
  menu_permissions: string[]
  route_permissions: string[]
  role: string[]

  // 新增
  project_memberships: Array<{
    project_id: string
    project_role: string // 角色名称
    visibility: 'public' | 'private'
  }>
}
```

项目内的具体权限不在登录时全量返回，而是进入项目后按模块懒加载（复用现有模式）。

### UI 新增页面

| 页面           | 位置       | 功能                              |
| -------------- | ---------- | --------------------------------- |
| 项目成员管理   | 项目设置内 | 邀请/移除成员、修改角色、审批申请 |
| 项目角色管理   | 项目设置内 | 查看/新增自定义角色、编辑角色权限 |
| 项目可见性设置 | 项目设置内 | 切换 public/private               |
| 申请加入       | 项目详情页 | 非成员看到公开项目时的申请入口    |

## 创建项目流程

```
用户创建项目
    │
    ▼
1. 创建 project 记录（visibility 默认 private）
2. 创建三个预置 project_role（Owner/Editor/Viewer）
3. 为每个预置角色创建 project_role_permission 记录（按模板）
4. 创建 project_member 记录（创建者 → Owner 角色）
```

### 预置权限模板

```
Owner:
  所有 module × 所有 action = allow

Editor:
  所有 module × [create, read, update, delete] = allow

Viewer:
  所有 module × [read] = allow
```

Owner 和 Editor 初始权限相同，区别在于 Owner 拥有项目设置、成员管理、角色管理的额外能力（这部分作为系统固定逻辑，不走 project_role_permission 表）。

**Owner 身份判定：** "谁是 Owner"由 project_member.project_role_id 指向预置 Owner 角色决定。项目设置、成员管理、角色管理这些操作在后端硬编码检查用户是否持有 Owner 角色，不走 permission effect 检查。即使 Owner 角色的 permission 被修改，这些管理能力也不会丢失。

## 系统管理员行为

- Admin 对所有项目拥有全部权限，无需加入项目
- 权限检查时 Admin 角色直接 short-circuit 返回 allow
- Admin 在项目成员列表中不显示（除非显式加入）

## 实施阶段

### Phase 1：基础项目成员体系

- 数据模型：project_member、project_role、project_role_permission 表
- 创建项目时自动生成预置数据
- 项目成员管理页面（邀请/移除/改角色）
- 项目可见性设置

### Phase 2：项目级权限检查

- 后端 fetchPermissions 接口支持 projectId 参数
- 前端 useProjectPermission hook
- 项目内页面接入权限控制（按钮显隐、操作拦截）
- 系统 Admin short-circuit 逻辑

### Phase 3：角色管理与继承

- 项目角色管理页面（新增自定义角色、编辑权限）
- 角色继承机制
- 有效权限计算（继承链 + deny 覆盖）

### Phase 4：申请加入流程

- 公开项目申请入口
- Owner 审批页面
- 通知机制（申请/审批结果）
