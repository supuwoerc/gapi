# AI 驱动软件开发协作平台 - 设计规格

## 概述

将 GAPI 从 API 管理平台转型为 AI 驱动的软件开发协作平台。用户创建项目后为项目配置不同角色的 AI 员工，通过对话式提出需求，AI 员工按照自定义工作流在沙盒环境中执行开发任务。

## 核心定位

- **开发 (Development):** AI 员工自动完成编码任务
- **QA:** 测试用例管理（自然语言 + Playwright）、代码审查、自动化测试报告
- **Roadmap:** 里程碑规划，与需求双向关联
- **文档管理:** 人工维护，AI 辅助生成

## 架构策略

**方案：扁平扩展** — 在 `src/feature/authenticated/` 下直接新增独立模块，与现有结构一致。现有模块（auth, projects, workflows, tasks, documents, notifications, admin, settings）全部保留不动。

## 核心实体模型

### Agent（AI 员工）

| 字段        | 类型           | 说明                                                   |
| ----------- | -------------- | ------------------------------------------------------ |
| id          | number         | 主键                                                   |
| name        | string         | 名称（如「前端工程师」）                               |
| role        | enum           | developer, qa, architect, devops, designer, pm, custom |
| avatar      | string         | 头像                                                   |
| description | string         | 描述                                                   |
| skills      | Skill[]        | 技能列表                                               |
| sandbox_id  | number \| null | 绑定的沙盒                                             |
| status      | enum           | idle, working, offline, error                          |
| project_id  | number         | 所属项目                                               |
| created_by  | User           | 创建者                                                 |
| created_at  | Date           | -                                                      |
| updated_at  | Date           | -                                                      |

**Skill 结构：**

```
{ name: string, description: string, config: Record<string, unknown> }
```

### Sandbox（沙盒）

| 字段            | 类型           | 说明                                  |
| --------------- | -------------- | ------------------------------------- |
| id              | number         | 主键                                  |
| name            | string         | 名称                                  |
| host            | string         | 物理机地址                            |
| status          | enum           | running, stopped, error, provisioning |
| env_vars        | EnvVar[]       | 环境变量                              |
| resource_limits | ResourceLimits | CPU/内存限制                          |
| project_id      | number         | 所属项目                              |
| created_at      | Date           | -                                     |
| updated_at      | Date           | -                                     |

**ResourceLimits 结构：**

```
{ cpu: number, memory: number, disk: number }
```

### Requirement（需求）

| 字段            | 类型           | 说明                                                |
| --------------- | -------------- | --------------------------------------------------- |
| id              | number         | 主键                                                |
| title           | string         | 自动从对话中提取                                    |
| description     | string         | 详细描述                                            |
| conversation_id | number         | 关联的对话                                          |
| status          | enum           | draft, confirmed, in_progress, completed, cancelled |
| priority        | enum           | low, medium, high, critical                         |
| milestone_id    | number \| null | 关联的里程碑                                        |
| tasks           | Task[]         | 拆解出的任务                                        |
| project_id      | number         | 所属项目                                            |
| created_by      | User           | 创建者                                              |
| created_at      | Date           | -                                                   |
| updated_at      | Date           | -                                                   |

### Task（扩展已有）

在现有 Task 模型基础上增加：

| 新增字段         | 类型           | 说明                                        |
| ---------------- | -------------- | ------------------------------------------- |
| requirement_id   | number \| null | 来源需求                                    |
| agent_id         | number \| null | 执行的 AI 员工                              |
| workflow_node_id | string \| null | 对应的工作流节点                            |
| execution_status | enum           | pending, running, paused, completed, failed |
| execution_logs   | ExecutionLog[] | 分层日志                                    |
| artifacts        | Artifact[]     | 产出物列表                                  |

**ExecutionLog 结构：**

```
{ timestamp: Date, level: 'summary' | 'detail', content: string }
```

**Artifact 结构：**

```
{ id: number, type: 'code' | 'document' | 'report' | 'other', name: string, url: string }
```

### Milestone（里程碑）

| 字段        | 类型   | 说明                                     |
| ----------- | ------ | ---------------------------------------- |
| id          | number | 主键                                     |
| title       | string | 标题                                     |
| description | string | 描述                                     |
| start_date  | Date   | 开始日期                                 |
| due_date    | Date   | 截止日期                                 |
| status      | enum   | planned, in_progress, completed, delayed |
| project_id  | number | 所属项目                                 |
| created_at  | Date   | -                                        |
| updated_at  | Date   | -                                        |

### TestCase（测试用例）

| 字段            | 类型           | 说明                      |
| --------------- | -------------- | ------------------------- |
| id              | number         | 主键                      |
| title           | string         | 标题                      |
| description     | string         | 自然语言描述              |
| code            | string         | Playwright 代码           |
| status          | enum           | draft, active, deprecated |
| last_run_result | enum \| null   | passed, failed, skipped   |
| last_run_at     | Date \| null   | 最近执行时间              |
| requirement_id  | number \| null | 关联需求                  |
| project_id      | number         | 所属项目                  |
| created_by      | User           | 创建者                    |
| created_at      | Date           | -                         |
| updated_at      | Date           | -                         |

### Conversation（对话）

| 字段           | 类型           | 说明       |
| -------------- | -------------- | ---------- |
| id             | number         | 主键       |
| project_id     | number         | 所属项目   |
| messages       | Message[]      | 消息列表   |
| requirement_id | number \| null | 生成的需求 |
| created_by     | User           | 创建者     |
| created_at     | Date           | -          |
| updated_at     | Date           | -          |

**Message 结构：**

```
{ id: string, role: 'user' | 'assistant' | 'system', content: string, timestamp: Date, metadata?: Record<string, unknown> }
```

## 实体关系

```
Project 1:N → Agents
Project 1:N → Sandboxes
Project 1:N → Requirements
Project 1:N → Tasks
Project 1:N → Milestones
Project 1:N → TestCases
Project 1:N → Conversations
Project 1:N → Workflows
Project 1:N → Documents

Requirement N:1 → Milestone
Requirement 1:N → Tasks
Requirement 1:1 → Conversation

Task N:1 → Agent
Task N:1 → WorkflowNode (in Workflow)

Agent N:1 → Sandbox
```

## 模块结构与路由

### 新增路由

| 路由               | 模块         | 说明               |
| ------------------ | ------------ | ------------------ |
| `/agents`          | agents       | AI 员工卡片列表    |
| `/agent/:id`       | agents       | AI 员工详情/编辑   |
| `/sandboxes`       | sandboxes    | 沙盒列表           |
| `/sandbox/:id`     | sandboxes    | 沙盒详情/配置      |
| `/requirements`    | requirements | 需求列表           |
| `/requirement/:id` | requirements | 需求详情（含对话） |
| `/roadmap`         | roadmap      | 时间线/看板视图    |
| `/qa`              | qa           | QA 概览            |
| `/qa/cases`        | qa           | 测试用例管理       |
| `/qa/reviews`      | qa           | 代码审查列表       |
| `/qa/reports`      | qa           | 测试报告           |

### 文件组织

```
src/
├── schema/
│   ├── agent/agent.ts
│   ├── sandbox/sandbox.ts
│   ├── requirement/requirement.ts
│   ├── milestone/milestone.ts
│   ├── qa/test-case.ts
│   ├── qa/review.ts
│   ├── qa/report.ts
│   └── conversation/conversation.ts
├── service/
│   ├── agents/agents.ts
│   ├── sandboxes/sandboxes.ts
│   ├── requirements/requirements.ts
│   ├── milestones/milestones.ts
│   ├── qa/test-cases.ts
│   ├── qa/reviews.ts
│   ├── qa/reports.ts
│   └── conversations/conversations.ts
├── feature/authenticated/
│   ├── agents/
│   │   ├── index.tsx              # 卡片列表页
│   │   ├── detail.tsx             # 详情/编辑页
│   │   └── components/
│   │       ├── agent-card.tsx
│   │       ├── agent-skill-editor.tsx
│   │       └── create-agent-dialog.tsx
│   ├── sandboxes/
│   │   ├── index.tsx              # 列表页
│   │   ├── detail.tsx             # 详情/配置页
│   │   └── components/
│   │       ├── sandbox-card.tsx
│   │       ├── sandbox-env-editor.tsx
│   │       └── create-sandbox-dialog.tsx
│   ├── requirements/
│   │   ├── index.tsx              # 列表页
│   │   ├── detail.tsx             # 详情页（含对话面板）
│   │   └── components/
│   │       ├── requirement-card.tsx
│   │       ├── conversation-panel.tsx
│   │       └── task-generation-preview.tsx
│   ├── roadmap/
│   │   ├── index.tsx              # 时间线视图
│   │   └── components/
│   │       ├── milestone-card.tsx
│   │       ├── timeline-view.tsx
│   │       └── create-milestone-dialog.tsx
│   └── qa/
│       ├── index.tsx              # QA 概览
│       ├── cases.tsx              # 测试用例列表
│       ├── reviews.tsx            # 代码审查列表
│       ├── reports.tsx            # 测试报告
│       └── components/
│           ├── test-case-editor.tsx
│           ├── test-case-table.tsx
│           ├── review-card.tsx
│           └── report-summary.tsx
```

## 关键交互流程

### 需求 → 任务执行

```
1. 用户在项目内对话面板发起对话
2. AI 理解需求，进行 clarification 问答
3. 用户确认需求内容
4. 系统生成 Requirement 实体 + 标题提取
5. 根据项目绑定的 Workflow 模板，拆解为 Tasks
6. Tasks 自动分配给对应角色的 Agent
7. Agent 在绑定的 Sandbox 中执行
8. 通过 WebSocket/SSE 实时推送执行状态
9. 任务完成后，产出物（代码/文档/报告）归档
10. QA Agent 自动触发代码审查和测试
```

### 对话面板

- 嵌入项目详情页侧边，绑定 `active-project` 上下文
- 支持普通对话和需求确认两种模式
- 需求确认后自动生成结构化任务卡片预览
- 用户可在预览中调整任务分配再确认执行

### 执行状态分层展示

- **第一层（默认）：** 状态标签 + 进度指示 + 耗时 + Agent 头像
- **第二层（点击展开）：** 流式执行日志、命令输出、AI 思考过程、产出物预览

## 实时通信

- 使用 WebSocket 或 SSE 推送 Agent 执行状态
- Zustand store 管理实时数据（`src/store/execution-status.ts`）
- TanStack Query 管理持久化数据（任务列表、历史记录）
- 状态更新粒度：任务级别（不是消息级别）

## QA 模块

### 测试用例管理

- 表格式列表，支持筛选和搜索
- 每条用例：自然语言描述（可编辑）+ Playwright 代码编辑器（Shiki 高亮）
- 支持 AI 辅助生成：用户描述测试场景 → AI 生成 Playwright 代码
- 关联到具体 Requirement

### 代码审查

- QA 角色 Agent 对其他 Agent 产出进行 review
- 以 inline comment 形式展示（类似 GitHub PR review）
- 支持 approve / request changes 状态

### 测试报告

- 自动化执行后生成
- 展示：通过/失败/跳过统计 + 详细断言结果
- 历史趋势图（可选）

## 技术约束

- 复用现有技术栈：React 19, TypeScript, Vite, shadcn/ui, TanStack Query, Zustand, React Router, Zod, ky
- 所有 schema 使用 Zod 定义
- 所有 API 调用通过 service 层封装（ky）
- 国际化使用 i18next
- 权限复用现有 permission-guard 机制
- 工作流编辑器复用现有 @xyflow/react 实现

## 不在范围内

- 后端 API 实现
- AI 模型接入层
- 沙盒运行时管理
- CI/CD 集成
- 支付/计费
