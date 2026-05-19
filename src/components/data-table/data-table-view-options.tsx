'use client'
'use no memo'

import * as React from 'react'

import type { Table } from '@tanstack/react-table'

import { Check, Settings2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface DataTableViewOptionsProps<TData> extends React.ComponentProps<typeof PopoverContent> {
  table: Table<TData>
  disabled?: boolean
}

export function DataTableViewOptions<TData>({
  table,
  disabled,
  ...props
}: DataTableViewOptionsProps<TData>) {
  const { t } = useTranslation('component')
  const columns = React.useMemo(
    () =>
      table
        .getAllColumns()
        .filter((column) => typeof column.accessorFn !== 'undefined' && column.getCanHide()),
    /**
     * table 引用稳定，需要额外依赖 table.options.columns 以响应 column 定义变化（如语言切换）
     * Table ref is stable; extra dependency on table.options.columns to react to column definition changes (e.g. locale switch)
     */
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [table, table.options.columns]
  )

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          aria-label={t('dataTable.viewOptions.toggleColumns')}
          role="combobox"
          variant="outline"
          size="sm"
          className="ml-auto hidden h-8 font-normal lg:flex"
          disabled={disabled}
        >
          <Settings2 className="text-muted-foreground" />
          {t('dataTable.viewOptions.view')}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-44 p-0" {...props}>
        <Command>
          <CommandInput placeholder={t('dataTable.viewOptions.searchColumns')} />
          <CommandList>
            <CommandEmpty>{t('dataTable.viewOptions.noColumnsFound')}</CommandEmpty>
            <CommandGroup>
              {columns.map((column) => (
                <CommandItem
                  key={column.id}
                  onSelect={() => column.toggleVisibility(!column.getIsVisible())}
                >
                  <span className="truncate">{column.columnDef.meta?.label ?? column.id}</span>
                  <Check
                    className={cn(
                      'ml-auto size-4 shrink-0',
                      column.getIsVisible() ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
