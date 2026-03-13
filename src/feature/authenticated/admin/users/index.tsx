import { useDataTable } from '@/hooks/use-data-table'

import { DataTable } from '@/components/data-table/data-table'
import { DataTableSortList } from '@/components/data-table/data-table-sort-list'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'

import { columns } from './data/columns'
import { users } from './data/data'

const Users = () => {
  const { table } = useDataTable({
    data: users,
    columns,
    pageCount: Math.ceil(users.length / 10),
  })

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Manage your team members and their account permissions.
          </p>
        </div>
      </div>

      <DataTable table={table}>
        <DataTableToolbar table={table}>
          <DataTableSortList table={table} />
        </DataTableToolbar>
      </DataTable>
    </div>
  )
}

export default Users
