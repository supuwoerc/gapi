import { delay, http } from 'msw'

import { users } from '../data/users'
import { applyAdvancedFilters, applySorting, paginate } from '../utils/filter'
import { jsonEnvelope } from '../utils/response'

const BASE = import.meta.env.VITE_APP_DEFAULT_SERVER

export const userHandlers = [
  http.get(`${BASE}/users`, async ({ request }) => {
    await delay(200)
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 1)
    const perPage = Number(url.searchParams.get('perPage') ?? 10)
    const username = url.searchParams.get('username') ?? ''
    const status = url.searchParams.getAll('status')
    const role = url.searchParams.getAll('role')
    const sort = url.searchParams.get('sort')
    const filters = url.searchParams.get('filters') ?? undefined

    let result = [...users]

    if (username) {
      const keyword = username.toLowerCase()
      result = result.filter(
        (u) =>
          u.username.toLowerCase().includes(keyword) ||
          u.email.toLowerCase().includes(keyword) ||
          u.first_name.toLowerCase().includes(keyword) ||
          u.last_name.toLowerCase().includes(keyword)
      )
    }

    if (status.length) {
      result = result.filter((u) => status.includes(u.status))
    }

    if (role.length) {
      result = result.filter((u) => role.includes(u.role))
    }

    result = applyAdvancedFilters(result, filters)

    const sortArr: { id: string; desc: boolean }[] = sort ? JSON.parse(sort) : []
    result = applySorting(result, sortArr)

    const paged = paginate(result, page, perPage)
    return jsonEnvelope(paged)
  }),
]
