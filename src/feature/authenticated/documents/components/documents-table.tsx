'use no memo'

import * as React from 'react'

import { keepPreviousData, useQuery } from '@tanstack/react-query'

import type { Column, ColumnDef } from '@tanstack/react-table'

import type { Document } from '@/schema/document/document'
import { getDocuments } from '@/service/documents'
import { Text } from 'lucide-react'
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs'
import { useTranslation } from 'react-i18next'

import { useDataTable } from '@/hooks/use-data-table'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

import { DataTable } from '@/components/data-table/data-table'
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { DataTableSkeleton } from '@/components/data-table/data-table-skeleton'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'

const EmptyList: Document[] = []

export function DocumentsTable() {
  const { t } = useTranslation('documents')

  const [page] = useQueryState('page', parseAsInteger.withDefault(1))
  const [perPage] = useQueryState('perPage', parseAsInteger.withDefault(10))
  const [keyword] = useQueryState('keyword', parseAsString.withDefault(''))

  const {
    data: documentsPage,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['documents', { page, perPage, keyword }],
    queryFn: () =>
      getDocuments({
        page,
        perPage,
        keyword: keyword || undefined,
      }),
    placeholderData: keepPreviousData,
  })

  const columns = React.useMemo<ColumnDef<Document>[]>(
    () => [
      {
        id: 'keyword',
        accessorFn: (row) => row.title,
        header: ({ column }: { column: Column<Document, unknown> }) => (
          <DataTableColumnHeader column={column} label={t('columns.title')} />
        ),
        cell: ({ row }) => (
          <div className="flex min-w-56 flex-col gap-1">
            <span className="font-medium">{row.original.title}</span>
            <span className="line-clamp-1 text-xs text-muted-foreground">
              {row.original.description}
            </span>
          </div>
        ),
        meta: {
          label: t('columns.title'),
          placeholder: t('search'),
          variant: 'text',
          icon: Text,
        },
        enableColumnFilter: true,
        enableSorting: false,
      },
      {
        id: 'visibility',
        accessorKey: 'visibility',
        header: ({ column }: { column: Column<Document, unknown> }) => (
          <DataTableColumnHeader column={column} label={t('columns.visibility')} />
        ),
        cell: ({ cell }) => {
          const visibility = cell.getValue<Document['visibility']>()
          const variantMap = {
            public: 'default',
            private: 'secondary',
            project: 'outline',
          } as const
          return <Badge variant={variantMap[visibility]}>{t(`visibility.${visibility}`)}</Badge>
        },
        meta: {
          label: t('columns.visibility'),
        },
        enableSorting: false,
      },
      {
        id: 'project',
        accessorFn: (row) => row.project.name,
        header: ({ column }: { column: Column<Document, unknown> }) => (
          <DataTableColumnHeader column={column} label={t('columns.project')} />
        ),
        cell: ({ row }) => {
          const project = row.original.project
          return (
            <div className="flex items-center gap-2">
              <Avatar className="size-5">
                <AvatarImage src={project.logo} alt={project.name} />
                <AvatarFallback className="text-[10px]">{project.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="max-w-32 truncate">{project.name}</span>
            </div>
          )
        },
        meta: {
          label: t('columns.project'),
        },
        enableSorting: false,
      },
      {
        id: 'owner',
        accessorFn: (row) => row.owner.username,
        header: ({ column }: { column: Column<Document, unknown> }) => (
          <DataTableColumnHeader column={column} label={t('columns.owner')} />
        ),
        cell: ({ row }) => {
          const owner = row.original.owner
          return (
            <div className="flex items-center gap-2">
              <Avatar className="size-5">
                <AvatarImage src={owner.avatar} alt={owner.username} />
                <AvatarFallback className="text-[10px]">
                  {owner.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="max-w-24 truncate">{owner.username}</span>
            </div>
          )
        },
        meta: {
          label: t('columns.owner'),
        },
        enableSorting: false,
      },
      {
        id: 'created_at',
        accessorKey: 'created_at',
        header: ({ column }: { column: Column<Document, unknown> }) => (
          <DataTableColumnHeader column={column} label={t('columns.createdAt')} />
        ),
        cell: ({ cell }) => <div>{new Date(cell.getValue<Date>()).toLocaleDateString()}</div>,
        meta: {
          label: t('columns.createdAt'),
        },
        enableSorting: false,
      },
      {
        id: 'updated_at',
        accessorKey: 'updated_at',
        header: ({ column }: { column: Column<Document, unknown> }) => (
          <DataTableColumnHeader column={column} label={t('columns.updatedAt')} />
        ),
        cell: ({ cell }) => <div>{new Date(cell.getValue<Date>()).toLocaleDateString()}</div>,
        meta: {
          label: t('columns.updatedAt'),
        },
        enableSorting: false,
      },
    ],
    [t]
  )

  const { table } = useDataTable({
    data: documentsPage?.data ?? EmptyList,
    columns,
    rowCount: documentsPage?.total ?? 0,
    getRowId: (row) => String(row.id),
  })

  if (isLoading) {
    return <DataTableSkeleton columnCount={6} filterCount={1} />
  }

  return (
    <div className="data-table-container">
      <DataTable table={table} isFetching={isFetching && !isLoading}>
        <DataTableToolbar table={table} onSearch={() => refetch()} />
      </DataTable>
    </div>
  )
}
