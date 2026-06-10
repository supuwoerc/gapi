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
    const enabled = url.searchParams.get('enabled')
    const roles = url.searchParams.getAll('roles')
    const sort = url.searchParams.get('sort')
    const filters = url.searchParams.get('filters') ?? undefined

    let result = [...users]

    if (username) {
      const keyword = username.toLowerCase()
      result = result.filter(
        (u) => u.username.toLowerCase().includes(keyword) || u.email.toLowerCase().includes(keyword)
      )
    }

    if (enabled !== null) {
      const enabledBool = enabled === 'true'
      result = result.filter((u) => u.enabled === enabledBool)
    }

    if (roles.length) {
      result = result.filter((u) => u.roles.some((r) => roles.includes(r.code)))
    }

    result = applyAdvancedFilters(result, filters)

    const sortArr: { id: string; desc: boolean }[] = sort ? JSON.parse(sort) : []
    result = applySorting(result, sortArr)

    const paged = paginate(result, page, perPage)
    return jsonEnvelope(paged)
  }),
]
