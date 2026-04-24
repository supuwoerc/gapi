# DataTable 数据表格组件

基于 [TanStack React Table](https://tanstack.com/table) 和 [DiceUI DataTable](https://www.diceui.com/docs/components/radix/data-table) 构建的高级数据表格组件系统，提供筛选、排序、分页、列固定、行选择等功能，并通过 `nuqs` 实现 URL 状态同步。

## 目录

- [整体架构](#整体架构)
- [快速上手](#快速上手)
- [核心组件](#核心组件)
  - [DataTable](#datatable)
  - [DataTableToolbar](#datatableadvancedtoolbar--datatabletoolbar)
  - [DataTableColumnHeader](#datatablecolumnheader)
  - [DataTablePagination](#datatablepagination)
  - [DataTableSkeleton](#datatableskeleton)
  - [DataTableViewOptions](#datatableviewoptions)
- [筛选组件](#筛选组件)
  - [DataTableFilterList](#datatablefilterlist)
  - [DataTableFilterMenu](#datatablefiltermenu)
  - [DataTableFacetedFilter](#datatablefacetedfilter)
  - [DataTableDateFilter](#datatabledatefilter)
  - [DataTableSliderFilter](#datatablesliderfilter)
  - [DataTableRangeFilter](#datatablerangefilter)
- [排序组件](#排序组件)
  - [DataTableSortList](#datatablesortlist)
- [核心 Hook](#核心-hook)
  - [useDataTable](#usedatatable)
- [类型系统](#类型系统)
- [筛选操作符](#筛选操作符)
- [完整使用示例](#完整使用示例)

---

## 整体架构

```
DataTable (核心表格渲染)
├── DataTablePagination (分页控件)
└── children (工具栏 / 筛选器)

DataTableToolbar (简单行内筛选工具栏)
├── DataTableSliderFilter (范围滑块)
├── DataTableDateFilter (日期选择)
├── DataTableFacetedFilter (分面筛选)
└── DataTableViewOptions (列可见性)

DataTableAdvancedToolbar (高级工具栏容器)
└── DataTableViewOptions

DataTableFilterList (高级可排序筛选列表)
├── DataTableRangeFilter (范围输入)
└── SortableContent (拖拽排序)

DataTableFilterMenu (紧凑型筛选菜单)
├── DataTableRangeFilter
└── FilterValueSelector

DataTableSortList (多列排序管理)
├── DataTableSortItem
└── SortableContent (拖拽排序)
```

### 组件适用场景速查

| 组件                         | 适用场景                                               |
| ---------------------------- | ------------------------------------------------------ |
| **DataTable**                | 核心表格渲染，所有场景都要用                           |
| **DataTableToolbar**         | 简单筛选场景，根据列 meta 自动渲染筛选控件             |
| **DataTableAdvancedToolbar** | 只需要列可见性切换、不需要内联筛选的场景               |
| **DataTableColumnHeader**    | 需要列头排序、隐藏列的下拉菜单                         |
| **DataTablePagination**      | 分页导航，显示页码和每页条数选择                       |
| **DataTableSkeleton**        | 数据加载中的骨架屏占位                                 |
| **DataTableViewOptions**     | 让用户勾选显示/隐藏哪些列                              |
| **DataTableFilterList**      | 高级筛选 — 弹出面板中拖拽排序多个筛选条件，支持 AND/OR |
| **DataTableFilterMenu**      | 高级筛选 — 紧凑的药丸标签式筛选，带命令面板交互        |
| **DataTableFacetedFilter**   | 单选/多选下拉筛选（如状态、角色）                      |
| **DataTableDateFilter**      | 日期/日期范围筛选                                      |
| **DataTableSliderFilter**    | 数值范围滑块筛选                                       |
| **DataTableRangeFilter**     | 数值区间输入筛选（最小值/最大值）                      |
| **DataTableSortList**        | 多列排序管理，弹出面板中拖拽调整排序优先级             |

**选择路径：**

- 基础表格：`DataTable` + `DataTableToolbar` + `DataTablePagination`
- 需要高级筛选：把 `DataTableToolbar` 换成 `DataTableAdvancedToolbar` + `DataTableFilterList` 或 `DataTableFilterMenu`
- 需要多列排序：加 `DataTableSortList`

---

## 快速上手

### 1. 定义列

```tsx
import type { Column, ColumnDef } from '@tanstack/react-table'

import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'

interface Product {
  id: string
  name: string
  category: string
  price: number
  createdAt: Date
}

const categoryOptions = [
  { label: '电子产品', value: 'electronics' },
  { label: '服装', value: 'clothing' },
  { label: '食品', value: 'food' },
]

const columns: ColumnDef<Product>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }: { column: Column<Product, unknown> }) => (
      <DataTableColumnHeader column={column} label="名称" />
    ),
    cell: ({ row }) => <span>{row.original.name}</span>,
    meta: {
      label: '名称',
      placeholder: '搜索产品...',
      variant: 'text',
    },
    enableColumnFilter: true,
  },
  {
    id: 'category',
    accessorKey: 'category',
    header: ({ column }: { column: Column<Product, unknown> }) => (
      <DataTableColumnHeader column={column} label="分类" />
    ),
    meta: {
      label: '分类',
      variant: 'multiSelect',
      options: categoryOptions,
    },
    enableColumnFilter: true,
  },
  {
    id: 'price',
    accessorKey: 'price',
    header: ({ column }: { column: Column<Product, unknown> }) => (
      <DataTableColumnHeader column={column} label="价格" />
    ),
    cell: ({ cell }) => `¥${cell.getValue<number>().toFixed(2)}`,
    meta: {
      label: '价格',
      variant: 'range',
      range: [0, 10000],
      unit: '¥',
    },
    enableColumnFilter: true,
  },
]
```

### 2. 使用 `useDataTable` 创建表格实例

```tsx
import { useDataTable } from '@/hooks/use-data-table'

const { table } = useDataTable({
  data: products,
  columns,
  pageCount: totalPages,
  initialState: {
    sorting: [{ id: 'createdAt', desc: true }],
  },
})
```

### 3. 渲染表格

```tsx
import { DataTable } from '@/components/data-table/data-table'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'

;<DataTable table={table} isFetching={isFetching}>
  <DataTableToolbar table={table} />
</DataTable>
```

---

## 核心组件

### DataTable

核心表格渲染组件，负责展示表头、数据行、空状态和加载骨架屏。

**文件:** `data-table.tsx`

**Props:**

| 属性         | 类型              | 必填 | 默认值  | 说明                                 |
| ------------ | ----------------- | :--: | ------- | ------------------------------------ |
| `table`      | `Table<TData>`    |  是  | -       | TanStack Table 实例                  |
| `actionBar`  | `React.ReactNode` |  否  | -       | 操作栏，选中行时显示                 |
| `isFetching` | `boolean`         |  否  | `false` | 是否正在加载，为 `true` 时显示骨架屏 |

**功能特性:**

- 支持列固定（`getColumnPinningStyle`）
- 加载时自动显示骨架动画
- 无数据时展示"No results"空状态
- 底部自动渲染分页组件
- 支持通过 `children` 插槽传入工具栏

**使用示例:**

```tsx
import { DataTable } from '@/components/data-table/data-table'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'

;<DataTable table={table} isFetching={isFetching} actionBar={<BatchActionBar />}>
  <DataTableToolbar table={table} />
</DataTable>
```

---

### DataTableAdvancedToolbar / DataTableToolbar

提供两种工具栏方案：

#### DataTableToolbar（简单工具栏）

**文件:** `data-table-toolbar.tsx`

根据列的 `meta.variant` 自动渲染对应类型的行内筛选控件，支持的类型：

| variant                  | 渲染组件                 | 说明     |
| ------------------------ | ------------------------ | -------- |
| `text`                   | 文本输入框               | 文本搜索 |
| `number`                 | 数字输入框               | 数值筛选 |
| `range`                  | `DataTableSliderFilter`  | 范围滑块 |
| `date` / `dateRange`     | `DataTableDateFilter`    | 日期选择 |
| `select` / `multiSelect` | `DataTableFacetedFilter` | 下拉选择 |

当筛选处于活跃状态时自动显示"重置"按钮，右侧包含 `DataTableViewOptions` 列可见性控件。

```tsx
<DataTableToolbar table={table} />
```

#### DataTableAdvancedToolbar（高级工具栏）

**文件:** `data-table-advanced-toolbar.tsx`

轻量容器组件，提供 Flexbox 布局，左侧放置子元素，右侧自动渲染 `DataTableViewOptions`。适合搭配 `DataTableFilterList` 或 `DataTableSortList` 使用。

```tsx
<DataTableAdvancedToolbar table={table}>
  <DataTableFilterList table={table} />
  <DataTableSortList table={table} />
</DataTableAdvancedToolbar>
```

---

### DataTableColumnHeader

列头下拉菜单组件，提供排序和列可见性控制。

**文件:** `data-table-column-header.tsx`

**Props:**

| 属性     | 类型                    | 必填 | 说明       |
| -------- | ----------------------- | :--: | ---------- |
| `column` | `Column<TData, TValue>` |  是  | 列实例     |
| `label`  | `string`                |  是  | 列标题文本 |

**功能特性:**

- 排序状态图标：升序 `ChevronUp` / 降序 `ChevronDown` / 未排序 `ChevronsUpDown`
- 下拉菜单选项：升序、降序、重置排序、隐藏列
- 仅在列可排序或可隐藏时渲染下拉功能

```tsx
header: ({ column }) => (
  <DataTableColumnHeader column={column} label="用户名" />
),
```

---

### DataTablePagination

分页控件组件。

**文件:** `data-table-pagination.tsx`

**Props:**

| 属性              | 类型           | 必填 | 默认值                 | 说明             |
| ----------------- | -------------- | :--: | ---------------------- | ---------------- |
| `table`           | `Table<TData>` |  是  | -                      | 表格实例         |
| `pageSizeOptions` | `number[]`     |  否  | `[10, 20, 30, 40, 50]` | 每页显示条数选项 |

**功能特性:**

- 显示选中行数与总行数
- 每页条数下拉选择器
- 翻页按钮：首页、上一页、下一页、末页
- 响应式设计：小屏隐藏首页/末页按钮
- 边界条件自动禁用按钮

---

### DataTableSkeleton

加载骨架屏组件。

**文件:** `data-table-skeleton.tsx`

**Props:**

| 属性              | 类型       | 必填 | 默认值     | 说明                 |
| ----------------- | ---------- | :--: | ---------- | -------------------- |
| `columnCount`     | `number`   |  是  | -          | 列数                 |
| `rowCount`        | `number`   |  否  | `10`       | 行数                 |
| `filterCount`     | `number`   |  否  | `0`        | 筛选器占位数量       |
| `cellWidths`      | `string[]` |  否  | `['auto']` | 各列宽度             |
| `withViewOptions` | `boolean`  |  否  | `true`     | 是否显示视图选项骨架 |
| `withPagination`  | `boolean`  |  否  | `true`     | 是否显示分页骨架     |
| `shrinkZero`      | `boolean`  |  否  | `false`    | 是否允许列收缩为零宽 |

```tsx
if (isLoading) {
  return <DataTableSkeleton columnCount={6} filterCount={3} />
}
```

---

### DataTableViewOptions

列可见性切换弹出框组件。

**文件:** `data-table-view-options.tsx`

**Props:**

| 属性       | 类型           | 必填 | 说明     |
| ---------- | -------------- | :--: | -------- |
| `table`    | `Table<TData>` |  是  | 表格实例 |
| `disabled` | `boolean`      |  否  | 是否禁用 |

**功能特性:**

- 弹出式命令面板，可搜索列名
- 勾选/取消勾选切换列可见性
- 自动过滤无 accessor 的列（如 select、actions）
- 仅在 `lg` 及以上断点显示

---

## 筛选组件

### DataTableFilterList

高级可排序筛选列表，以 Popover 形式展示，支持拖拽排序。

**文件:** `data-table-filter-list.tsx`

**Props:**

| 属性         | 类型           | 必填 | 默认值 | 说明               |
| ------------ | -------------- | :--: | ------ | ------------------ |
| `table`      | `Table<TData>` |  是  | -      | 表格实例           |
| `debounceMs` | `number`       |  否  | -      | 输入防抖延迟（ms） |
| `throttleMs` | `number`       |  否  | -      | 节流延迟（ms）     |
| `shallow`    | `boolean`      |  否  | -      | 是否浅层 URL 更新  |
| `disabled`   | `boolean`      |  否  | -      | 是否禁用           |

**功能特性:**

- 键盘快捷键 `Ctrl/Cmd + Shift + F` 快速打开
- 支持所有筛选类型：text, number, range, boolean, select, multiSelect, date, dateRange
- 支持筛选条件间的逻辑运算（AND / OR）
- 拖拽排序筛选条件优先级
- 支持每个筛选条件独立选择操作符
- Backspace/Delete 快速移除最后一个筛选条件

**使用示例:**

```tsx
import { DataTableAdvancedToolbar } from '@/components/data-table/data-table-advanced-toolbar'
import { DataTableFilterList } from '@/components/data-table/data-table-filter-list'

;<DataTableAdvancedToolbar table={table}>
  <DataTableFilterList table={table} debounceMs={300} />
</DataTableAdvancedToolbar>
```

---

### DataTableFilterMenu

紧凑型筛选命令菜单，以 pills 形式展示活跃筛选条件。

**文件:** `data-table-filter-menu.tsx`

**Props:** 与 `DataTableFilterList` 相同。

**与 FilterList 的区别:**

- 更紧凑的 UI 设计，使用 pills 展示筛选条件
- 两阶段操作：先选字段 → 再选值
- 适合需要节省空间的场景

---

### DataTableFacetedFilter

分面筛选下拉组件，支持单选和多选。

**文件:** `data-table-faceted-filter.tsx`

**Props:**

| 属性       | 类型                    | 必填 | 说明                    |
| ---------- | ----------------------- | :--: | ----------------------- |
| `column`   | `Column<TData, TValue>` |  否  | 列实例                  |
| `title`    | `string`                |  否  | 筛选标题                |
| `options`  | `Option[]`              |  是  | 选项列表                |
| `multiple` | `boolean`               |  否  | 是否多选（默认 `true`） |

**功能特性:**

- 可搜索的下拉选项列表
- 支持选项图标和计数
- 选中状态以 Badge 数量展示
- 单选/多选模式切换
- 提供清除所有筛选的按钮

```tsx
<DataTableFacetedFilter
  column={table.getColumn('status')}
  title="状态"
  options={[
    { label: '启用', value: 'active', icon: CheckCircle },
    { label: '禁用', value: 'inactive', icon: XCircle },
  ]}
/>
```

---

### DataTableDateFilter

日期/日期范围筛选组件。

**文件:** `data-table-date-filter.tsx`

**Props:**

| 属性       | 类型                     | 必填 | 说明             |
| ---------- | ------------------------ | :--: | ---------------- |
| `column`   | `Column<TData, unknown>` |  是  | 列实例           |
| `title`    | `string`                 |  否  | 标题             |
| `multiple` | `boolean`                |  否  | 是否日期范围模式 |

**功能特性:**

- 支持单日期和日期范围选择
- 集成 Calendar 组件（react-day-picker）
- 月/年下拉切换
- 格式化日期显示
- 一键清除选择

---

### DataTableSliderFilter

范围滑块筛选组件。

**文件:** `data-table-slider-filter.tsx`

**Props:**

| 属性     | 类型                     | 必填 | 说明   |
| -------- | ------------------------ | :--: | ------ |
| `column` | `Column<TData, unknown>` |  是  | 列实例 |
| `title`  | `string`                 |  否  | 标题   |

**功能特性:**

- 双端滑块选择范围
- 支持手动输入最小/最大值
- 智能步进值计算
- 数值本地化格式化显示
- 支持单位后缀（通过列 `meta.unit` 配置）
- 从列 `meta.range` 或分面值获取范围边界

---

### DataTableRangeFilter

范围数值输入组件（内部组件，主要被 FilterList 和 FilterMenu 使用）。

**文件:** `data-table-range-filter.tsx`

**Props:**

| 属性             | 类型                          | 必填 | 说明         |
| ---------------- | ----------------------------- | :--: | ------------ |
| `filter`         | `ExtendedColumnFilter<TData>` |  是  | 筛选配置     |
| `column`         | `Column<TData>`               |  是  | 列实例       |
| `inputId`        | `string`                      |  是  | 输入框 ID    |
| `onFilterUpdate` | `Function`                    |  是  | 筛选更新回调 |

提供最小值和最大值两个输入框，用于 `isBetween` 操作符的范围筛选。

---

## 排序组件

### DataTableSortList

多列排序管理组件。

**文件:** `data-table-sort-list.tsx`

**Props:**

| 属性       | 类型           | 必填 | 说明     |
| ---------- | -------------- | :--: | -------- |
| `table`    | `Table<TData>` |  是  | 表格实例 |
| `disabled` | `boolean`      |  否  | 是否禁用 |

**功能特性:**

- 键盘快捷键 `Ctrl/Cmd + Shift + S` 快速打开
- 添加多列排序规则
- 拖拽调整排序优先级
- 选择升序/降序
- 防止重复列
- 单独移除或全部重置
- Badge 显示已应用排序数量

```tsx
<DataTableAdvancedToolbar table={table}>
  <DataTableSortList table={table} />
</DataTableAdvancedToolbar>
```

---

## 核心 Hook

### useDataTable

核心 Hook，管理表格的分页、排序、筛选状态，并与 URL 查询参数同步。

**文件:** `src/hooks/use-data-table.ts`

**参数:**

| 属性                   | 类型                  | 必填 | 默认值      | 说明                            |
| ---------------------- | --------------------- | :--: | ----------- | ------------------------------- |
| `data`                 | `TData[]`             |  是  | -           | 表格数据                        |
| `columns`              | `ColumnDef<TData>[]`  |  是  | -           | 列定义                          |
| `pageCount`            | `number`              |  是  | -           | 总页数                          |
| `initialState`         | `object`              |  否  | -           | 初始状态（排序、分页等）        |
| `queryKeys`            | `Partial<QueryKeys>`  |  否  | -           | 自定义 URL 参数名               |
| `history`              | `'push' \| 'replace'` |  否  | `'replace'` | URL 更新方式                    |
| `debounceMs`           | `number`              |  否  | `300`       | 筛选防抖（ms）                  |
| `throttleMs`           | `number`              |  否  | `50`        | 状态节流（ms）                  |
| `clearOnDefault`       | `boolean`             |  否  | `false`     | 默认值时是否清除 URL 参数       |
| `enableAdvancedFilter` | `boolean`             |  否  | `false`     | 启用高级筛选模式                |
| `shallow`              | `boolean`             |  否  | `true`      | 浅层 URL 更新（不触发页面导航） |
| `scroll`               | `boolean`             |  否  | `false`     | URL 更新时是否滚动              |

**返回值:**

| 字段         | 类型           | 说明                |
| ------------ | -------------- | ------------------- |
| `table`      | `Table<TData>` | TanStack Table 实例 |
| `shallow`    | `boolean`      | 浅层更新标志        |
| `debounceMs` | `number`       | 防抖延迟            |
| `throttleMs` | `number`       | 节流延迟            |

**URL 参数映射（默认）:**

| 参数     | 默认 key       | 说明                                                   |
| -------- | -------------- | ------------------------------------------------------ |
| 页码     | `page`         | 当前页（从 1 开始）                                    |
| 每页条数 | `perPage`      | 默认 10                                                |
| 排序     | `sort`         | JSON 格式 `[{id, desc}]`                               |
| 筛选     | `filters`      | JSON 格式 `[{id, value, variant, operator, filterId}]` |
| 逻辑运算 | `joinOperator` | `and` 或 `or`                                          |

**使用示例:**

```tsx
const { table, shallow, debounceMs, throttleMs } = useDataTable({
  data: users,
  columns,
  pageCount: data?.pageCount ?? -1,
  initialState: {
    sorting: [{ id: 'createdAt', desc: true }],
    columnPinning: { right: ['actions'] },
  },
  getRowId: (row) => row.id,
})
```

---

## 类型系统

### ColumnMeta 扩展

通过 TanStack Table 的模块声明扩展列元数据：

```typescript
interface ColumnMeta<TData, TValue> {
  label?: string // 列显示标签
  placeholder?: string // 筛选输入占位文本
  variant?: FilterVariant // 筛选变体类型
  options?: Option[] // 选择型筛选的选项
  range?: [number, number] // 数值范围边界
  unit?: string // 数值单位后缀
  icon?: React.FC<React.SVGProps<SVGSVGElement>> // 列图标
}
```

### Option

```typescript
interface Option {
  label: string // 显示文本
  value: string // 值
  count?: number // 计数（可选）
  icon?: React.FC<React.SVGProps<SVGSVGElement>> // 图标
}
```

### FilterVariant

```typescript
type FilterVariant =
  | 'text'
  | 'number'
  | 'range'
  | 'date'
  | 'dateRange'
  | 'boolean'
  | 'select'
  | 'multiSelect'
```

### QueryKeys

自定义 URL 查询参数名：

```typescript
interface QueryKeys {
  page: string // 默认 "page"
  perPage: string // 默认 "perPage"
  sort: string // 默认 "sort"
  filters: string // 默认 "filters"
  joinOperator: string // 默认 "joinOperator"
}
```

### DataTableRowAction

行操作类型：

```typescript
interface DataTableRowAction<TData> {
  row: Row<TData>
  variant: 'update' | 'delete'
}
```

---

## 筛选操作符

### 文本操作符

| 操作符           | 值           | 说明                 |
| ---------------- | ------------ | -------------------- |
| Contains         | `iLike`      | 包含（不区分大小写） |
| Does not contain | `notILike`   | 不包含               |
| Is               | `eq`         | 等于                 |
| Is not           | `ne`         | 不等于               |
| Is empty         | `isEmpty`    | 为空                 |
| Is not empty     | `isNotEmpty` | 不为空               |

### 数值操作符

| 操作符                      | 值           | 说明        |
| --------------------------- | ------------ | ----------- |
| Is                          | `eq`         | 等于        |
| Is not                      | `ne`         | 不等于      |
| Is less than                | `lt`         | 小于        |
| Is less than or equal to    | `lte`        | 小于等于    |
| Is greater than             | `gt`         | 大于        |
| Is greater than or equal to | `gte`        | 大于等于    |
| Is between                  | `isBetween`  | 介于...之间 |
| Is empty                    | `isEmpty`    | 为空        |
| Is not empty                | `isNotEmpty` | 不为空      |

### 日期操作符

| 操作符               | 值                  | 说明        |
| -------------------- | ------------------- | ----------- |
| Is                   | `eq`                | 等于        |
| Is not               | `ne`                | 不等于      |
| Is before            | `lt`                | 早于        |
| Is after             | `gt`                | 晚于        |
| Is on or before      | `lte`               | 不晚于      |
| Is on or after       | `gte`               | 不早于      |
| Is between           | `isBetween`         | 介于...之间 |
| Is relative to today | `isRelativeToToday` | 相对于今天  |
| Is empty             | `isEmpty`           | 为空        |
| Is not empty         | `isNotEmpty`        | 不为空      |

### 选择操作符（单选）

| 操作符       | 值           | 说明   |
| ------------ | ------------ | ------ |
| Is           | `eq`         | 等于   |
| Is not       | `ne`         | 不等于 |
| Is empty     | `isEmpty`    | 为空   |
| Is not empty | `isNotEmpty` | 不为空 |

### 多选操作符

| 操作符       | 值           | 说明       |
| ------------ | ------------ | ---------- |
| Has any of   | `inArray`    | 包含任一   |
| Has none of  | `notInArray` | 不包含任一 |
| Is empty     | `isEmpty`    | 为空       |
| Is not empty | `isNotEmpty` | 不为空     |

### 布尔操作符

| 操作符 | 值   | 说明   |
| ------ | ---- | ------ |
| Is     | `eq` | 等于   |
| Is not | `ne` | 不等于 |

---

## 完整使用示例

以下是一个用户管理表格的完整实现，展示了组件系统的核心用法：

```tsx
'use no memo'

import * as React from 'react'

import { keepPreviousData, useQuery } from '@tanstack/react-query'

import type { Column, ColumnDef } from '@tanstack/react-table'

import {
  CheckCircle,
  CreditCard,
  MoreHorizontal,
  Shield,
  Text,
  UserCheck,
  Users,
  XCircle,
} from 'lucide-react'
import { parseAsArrayOf, parseAsInteger, parseAsString, useQueryState } from 'nuqs'

import { getSortingStateParser } from '@/lib/parsers'

import { useDataTable } from '@/hooks/use-data-table'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { DataTable } from '@/components/data-table/data-table'
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { DataTableSkeleton } from '@/components/data-table/data-table-skeleton'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'

import { getUsers } from '../api/fake-users'
import type { User } from '../data/schema'

// 1. 定义筛选选项
const statusOptions = [
  { label: 'Active', value: 'active', icon: CheckCircle },
  { label: 'Inactive', value: 'inactive', icon: XCircle },
  { label: 'Invited', value: 'invited', icon: CheckCircle },
  { label: 'Suspended', value: 'suspended', icon: XCircle },
]

const roleOptions = [
  { label: 'Superadmin', value: 'superadmin', icon: Shield },
  { label: 'Admin', value: 'admin', icon: UserCheck },
  { label: 'Manager', value: 'manager', icon: Users },
  { label: 'Cashier', value: 'cashier', icon: CreditCard },
]

export function UsersTable() {
  // 2. 管理 URL 查询参数（用于服务端筛选/排序/分页）
  const columnIds = React.useMemo(
    () => new Set(['username', 'email', 'status', 'role', 'createdAt']),
    []
  )

  const [page] = useQueryState('page', parseAsInteger.withDefault(1))
  const [perPage] = useQueryState('perPage', parseAsInteger.withDefault(10))
  const [sorting] = useQueryState(
    'sort',
    getSortingStateParser<User>(columnIds).withDefault([{ id: 'createdAt', desc: true }])
  )
  const [username] = useQueryState('username', parseAsString.withDefault(''))
  const [status] = useQueryState('status', parseAsArrayOf(parseAsString, ',').withDefault([]))
  const [role] = useQueryState('role', parseAsArrayOf(parseAsString, ',').withDefault([]))

  // 3. 数据请求
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['users', { page, perPage, sorting, username, status, role }],
    queryFn: () =>
      getUsers({
        page,
        perPage,
        sort: sorting,
        username: username || undefined,
        status: status.length > 0 ? status : undefined,
        role: role.length > 0 ? role : undefined,
      }),
    placeholderData: keepPreviousData,
  })

  // 4. 定义列
  const columns = React.useMemo<ColumnDef<User>[]>(
    () => [
      // 行选择列
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        size: 32,
        enableSorting: false,
        enableHiding: false,
      },
      // 文本筛选列
      {
        id: 'username',
        accessorKey: 'username',
        header: ({ column }: { column: Column<User, unknown> }) => (
          <DataTableColumnHeader column={column} label="Username" />
        ),
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">{row.original.username}</span>
            <span className="text-xs text-muted-foreground">{row.original.email}</span>
          </div>
        ),
        meta: {
          label: 'Username',
          placeholder: 'Search users...',
          variant: 'text',
          icon: Text,
        },
        enableColumnFilter: true,
      },
      // 多选筛选列
      {
        id: 'status',
        accessorKey: 'status',
        header: ({ column }: { column: Column<User, unknown> }) => (
          <DataTableColumnHeader column={column} label="Status" />
        ),
        cell: ({ cell }) => {
          const status = cell.getValue<User['status']>()
          return (
            <Badge variant="outline" className="capitalize">
              {status}
            </Badge>
          )
        },
        meta: {
          label: 'Status',
          variant: 'multiSelect',
          options: statusOptions,
        },
        enableColumnFilter: true,
      },
      // 多选筛选列（带图标）
      {
        id: 'role',
        accessorKey: 'role',
        header: ({ column }: { column: Column<User, unknown> }) => (
          <DataTableColumnHeader column={column} label="Role" />
        ),
        cell: ({ cell }) => {
          const role = cell.getValue<User['role']>()
          const option = roleOptions.find((o) => o.value === role)
          const Icon = option?.icon
          return (
            <div className="flex items-center gap-1.5 capitalize">
              {Icon && <Icon className="size-4 text-muted-foreground" />}
              {role}
            </div>
          )
        },
        meta: {
          label: 'Role',
          variant: 'multiSelect',
          options: roleOptions,
        },
        enableColumnFilter: true,
      },
      // 日期列
      {
        id: 'createdAt',
        accessorKey: 'createdAt',
        header: ({ column }: { column: Column<User, unknown> }) => (
          <DataTableColumnHeader column={column} label="Created At" />
        ),
        cell: ({ cell }) => {
          const date = cell.getValue<Date>()
          return <div>{new Date(date).toLocaleDateString()}</div>
        },
      },
      // 操作列
      {
        id: 'actions',
        cell: function Cell() {
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
        size: 32,
      },
    ],
    []
  )

  // 5. 创建表格实例
  const { table } = useDataTable({
    data: data?.data ?? [],
    columns,
    pageCount: data?.pageCount ?? -1,
    initialState: {
      sorting: [{ id: 'createdAt', desc: true }],
      columnPinning: { right: ['actions'] },
    },
    getRowId: (row) => row.id,
  })

  // 6. 加载态
  if (isLoading) {
    return <DataTableSkeleton columnCount={6} filterCount={3} />
  }

  // 7. 渲染表格
  return (
    <div className="data-table-container">
      <DataTable table={table} isFetching={isFetching && !isLoading}>
        <DataTableToolbar table={table} />
      </DataTable>
    </div>
  )
}
```

### 关键模式说明

**列元数据驱动筛选：** 通过 `meta.variant` 声明筛选类型，工具栏自动渲染对应控件，无需手动组装筛选 UI。

**URL 状态同步：** 所有筛选、排序、分页状态自动同步到 URL 查询参数，支持页面刷新保持状态、浏览器前进/后退导航，以及分享链接时还原表格状态。

**服务端集成：** `useDataTable` 开启 `manualPagination`、`manualSorting`、`manualFiltering`，所有状态变更通过 URL 参数传递给数据请求层（如 React Query），由服务端处理实际的筛选/排序/分页逻辑。

**键盘快捷键：**

| 快捷键                 | 功能                 |
| ---------------------- | -------------------- |
| `Ctrl/Cmd + Shift + F` | 打开高级筛选面板     |
| `Ctrl/Cmd + Shift + S` | 打开多列排序面板     |
| `Backspace / Delete`   | 移除最后一个筛选条件 |

---

## 参考

- [DiceUI DataTable 文档](https://www.diceui.com/docs/components/radix/data-table)
- [TanStack React Table](https://tanstack.com/table/latest)
- [nuqs - URL 查询参数状态管理](https://nuqs.47ng.com/)
