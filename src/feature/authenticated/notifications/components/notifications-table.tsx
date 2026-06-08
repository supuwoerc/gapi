'use no memo'

import * as React from 'react'

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { ColumnDef } from '@tanstack/react-table'

import type { Notification, NotificationType } from '@/schema/notification/notification'
import {
  deleteNotifications,
  getNotifications,
  markNotificationsRead,
} from '@/service/notifications/list'
import {
  Bell,
  CheckCheck,
  MessageSquare,
  MoreHorizontal,
  ShieldAlert,
  Text,
  Trash2,
} from 'lucide-react'
import { parseAsArrayOf, parseAsInteger, parseAsString, useQueryState } from 'nuqs'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

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
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

import { DataTable } from '@/components/data-table/data-table'
import { DataTableAdvancedToolbar } from '@/components/data-table/data-table-advanced-toolbar'
import { DataTableFilterList } from '@/components/data-table/data-table-filter-list'
import { DataTableSkeleton } from '@/components/data-table/data-table-skeleton'
import { DataTableSortList } from '@/components/data-table/data-table-sort-list'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'

import { NotificationDetailDialog } from './notification-detail-dialog'
import { NotificationsTableActionBar } from './notifications-table-action-bar'

const typeIcons: Record<NotificationType, React.ComponentType<{ className?: string }>> = {
  system: Bell,
  task: CheckCheck,
  message: MessageSquare,
  alert: ShieldAlert,
}

const typeStyles: Record<NotificationType, string> = {
  system: 'bg-neutral-300/40 border-neutral-300',
  task: 'bg-sky-200/40 text-sky-900 dark:text-sky-100 border-sky-300',
  message: 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200',
  alert: 'bg-amber-200/40 text-amber-900 dark:text-amber-100 border-amber-300',
}

const EmptyList: Array<Notification> = []

export function NotificationsTable() {
  const { t } = useTranslation('feature')
  const queryClient = useQueryClient()

  const [selectedNotification, setSelectedNotification] = React.useState<Notification | null>(null)
  const [dialogOpen, setDialogOpen] = React.useState(false)

  const typeOptions = React.useMemo(
    () => [
      { label: t('notifications.type.system'), value: 'system', icon: Bell },
      { label: t('notifications.type.task'), value: 'task', icon: CheckCheck },
      { label: t('notifications.type.message'), value: 'message', icon: MessageSquare },
      { label: t('notifications.type.alert'), value: 'alert', icon: ShieldAlert },
    ],
    [t]
  )

  const statusOptions = React.useMemo(
    () => [
      { label: t('notifications.status.read'), value: 'true' },
      { label: t('notifications.status.unread'), value: 'false' },
    ],
    [t]
  )

  const [enableAdvancedFilter, setEnableAdvancedFilter] = React.useState(false)

  const columnIds = React.useMemo(() => new Set(['type', 'is_read', 'created_at']), [])

  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1))
  const [perPage] = useQueryState('perPage', parseAsInteger.withDefault(10))
  const [sorting] = useQueryState(
    'sort',
    getSortingStateParser<Notification>(columnIds).withDefault([{ id: 'created_at', desc: true }])
  )
  const [title, setTitle] = useQueryState('title', parseAsString.withDefault(''))
  const [type, setType] = useQueryState('type', parseAsArrayOf(parseAsString, ',').withDefault([]))
  const [isRead, setIsRead] = useQueryState(
    'is_read',
    parseAsArrayOf(parseAsString, ',').withDefault([])
  )
  const [filters, setFilters] = useQueryState('filters', parseAsString.withDefault(''))

  const onTabChange = React.useCallback(
    (value: string) => {
      const isAdvanced = value === 'advanced'
      setEnableAdvancedFilter(isAdvanced)
      void setPage(1)
      if (isAdvanced) {
        void setTitle(null)
        void setType(null)
        void setIsRead(null)
      } else {
        void setFilters(null)
      }
    },
    [setPage, setTitle, setType, setIsRead, setFilters]
  )

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['notifications', { page, perPage, sorting, title, type, isRead, filters }],
    queryFn: () =>
      getNotifications({
        page,
        perPage,
        sort: sorting,
        title: title || undefined,
        type: type.length > 0 ? type : undefined,
        is_read: isRead.length > 0 ? isRead : undefined,
        filters: filters || undefined,
      }),
    placeholderData: keepPreviousData,
  })

  const markReadMutation = useMutation({
    mutationFn: markNotificationsRead,
    onSuccess: () => {
      toast.success(t('notifications.toast.markAsReadSuccess'))
      void queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteNotifications,
    onSuccess: () => {
      toast.success(t('notifications.toast.deleteSuccess'))
      void queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  const columns = React.useMemo<ColumnDef<Notification>[]>(
    () => [
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
      {
        id: 'title',
        accessorKey: 'title',
        header: t('notifications.columns.title'),
        cell: ({ row }) => (
          <button
            type="button"
            className="cursor-pointer text-left font-medium text-primary hover:underline"
            onClick={() => {
              setSelectedNotification(row.original)
              setDialogOpen(true)
            }}
          >
            <span className={row.original.is_read ? '' : 'font-bold'}>{row.original.title}</span>
          </button>
        ),
        meta: {
          label: t('notifications.columns.title'),
          placeholder: t('notifications.search'),
          variant: 'text',
          icon: Text,
        },
        enableSorting: false,
        enableColumnFilter: true,
      },
      {
        id: 'type',
        accessorKey: 'type',
        header: t('notifications.columns.type'),
        cell: ({ cell }) => {
          const type = cell.getValue<NotificationType>()
          const Icon = typeIcons[type]
          return (
            <Badge variant="outline" className={`capitalize ${typeStyles[type]}`}>
              {Icon && <Icon className="mr-1 size-3" />}
              {t(`notifications.type.${type}`)}
            </Badge>
          )
        },
        meta: {
          label: t('notifications.columns.type'),
          variant: 'multiSelect',
          options: typeOptions,
        },
        enableColumnFilter: true,
      },
      {
        id: 'sender',
        accessorKey: 'sender',
        header: t('notifications.columns.sender'),
        enableSorting: false,
      },
      {
        id: 'is_read',
        accessorKey: 'is_read',
        header: t('notifications.columns.isRead'),
        cell: ({ cell }) => {
          const read = cell.getValue<boolean>()
          return (
            <Badge variant={read ? 'secondary' : 'default'} className="capitalize">
              {read ? t('notifications.status.read') : t('notifications.status.unread')}
            </Badge>
          )
        },
        meta: {
          label: t('notifications.columns.isRead'),
          variant: 'multiSelect',
          options: statusOptions,
        },
        enableColumnFilter: true,
      },
      {
        id: 'created_at',
        accessorKey: 'created_at',
        header: t('notifications.columns.createdAt'),
        cell: ({ cell }) => {
          const date = cell.getValue<Date>()
          return <span>{new Date(date).toLocaleDateString()}</span>
        },
        meta: {
          label: t('notifications.columns.createdAt'),
        },
        enableHiding: false,
      },
      {
        id: 'actions',
        cell: function Cell({ row }) {
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">{t('notifications.openMenu')}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => markReadMutation.mutate({ ids: [row.original.id] })}
                >
                  <CheckCheck className="mr-2 size-4" />
                  {t('notifications.markAsRead')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => deleteMutation.mutate({ ids: [row.original.id] })}
                >
                  <Trash2 className="mr-2 size-4" />
                  {t('notifications.delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
        size: 32,
      },
    ],
    [t, typeOptions, statusOptions, markReadMutation, deleteMutation]
  )

  const { table } = useDataTable({
    data: data?.data ?? EmptyList,
    columns,
    rowCount: data?.total ?? 0,
    enableAdvancedFilter,
    initialState: {
      sorting: [{ id: 'created_at', desc: true }],
      columnPinning: { right: ['actions'] },
    },
    getRowId: (row) => String(row.id),
  })

  if (isLoading) {
    return <DataTableSkeleton columnCount={7} filterCount={3} />
  }

  const filterToggle = (
    <ToggleGroup
      type="single"
      value={enableAdvancedFilter ? 'advanced' : 'simple'}
      onValueChange={(value) => {
        if (value) onTabChange(value)
      }}
      variant="outline"
      size="sm"
    >
      <ToggleGroupItem value="simple">{t('notifications.tabs.simple')}</ToggleGroupItem>
      <ToggleGroupItem value="advanced">{t('notifications.tabs.advanced')}</ToggleGroupItem>
    </ToggleGroup>
  )

  return (
    <div className="data-table-container">
      <DataTable
        table={table}
        isFetching={isFetching && !isLoading}
        actionBar={<NotificationsTableActionBar table={table} />}
      >
        {enableAdvancedFilter ? (
          <DataTableAdvancedToolbar table={table} actions={filterToggle}>
            <DataTableFilterList table={table} />
            <DataTableSortList table={table} />
          </DataTableAdvancedToolbar>
        ) : (
          <DataTableToolbar table={table} onSearch={() => refetch()}>
            {filterToggle}
          </DataTableToolbar>
        )}
      </DataTable>
      <NotificationDetailDialog
        notification={selectedNotification}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  )
}
