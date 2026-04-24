import type { User } from '../data/schema'
import { users } from '../data/users'

interface GetUsersParams {
  page: number
  perPage: number
  sort: { id: string; desc: boolean }[]
  username?: string
  status?: string[]
  role?: string[]
}

interface GetUsersResponse {
  data: User[]
  pageCount: number
  total: number
}

export async function getUsers(params: GetUsersParams): Promise<GetUsersResponse> {
  await new Promise((r) => setTimeout(r, 200))

  let result = users as User[]

  if (params.username) {
    const keyword = params.username.toLowerCase()
    result = result.filter(
      (u) =>
        u.username.toLowerCase().includes(keyword) ||
        u.email.toLowerCase().includes(keyword) ||
        u.firstName.toLowerCase().includes(keyword) ||
        u.lastName.toLowerCase().includes(keyword)
    )
  }

  if (params.status?.length) {
    result = result.filter((u) => params.status!.includes(u.status))
  }

  if (params.role?.length) {
    result = result.filter((u) => params.role!.includes(u.role))
  }

  if (params.sort.length > 0) {
    result = [...result].sort((a, b) => {
      for (const { id, desc } of params.sort) {
        const aVal = a[id as keyof User]
        const bVal = b[id as keyof User]
        if (aVal < bVal) return desc ? 1 : -1
        if (aVal > bVal) return desc ? -1 : 1
      }
      return 0
    })
  }

  const total = result.length
  const pageCount = Math.ceil(total / params.perPage)
  const start = (params.page - 1) * params.perPage
  const data = result.slice(start, start + params.perPage)

  return { data, pageCount, total }
}
