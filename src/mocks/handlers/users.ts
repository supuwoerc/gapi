import { delay, http } from 'msw'

import { predefinedRoles, users } from '../data/users'
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

  http.delete(`${BASE}/users`, async ({ request }) => {
    await delay(300)
    const body = (await request.json()) as { ids: number[] }
    const idsSet = new Set(body.ids)
    const indicesToRemove = users
      .map((u, i) => (idsSet.has(u.id) ? i : -1))
      .filter((i) => i !== -1)
      .reverse()
    for (const i of indicesToRemove) {
      users.splice(i, 1)
    }
    return jsonEnvelope(null)
  }),

  http.patch(`${BASE}/users/:id`, async ({ params, request }) => {
    await delay(300)
    const id = Number(params.id)
    const body = (await request.json()) as { enabled: boolean; roles: string[] }
    const user = users.find((u) => u.id === id)
    if (!user) {
      return jsonEnvelope(null)
    }
    user.enabled = body.enabled
    user.roles = predefinedRoles.filter((r) => body.roles.includes(r.code))
    return jsonEnvelope(null)
  }),

  http.get(`${BASE}/roles`, async ({ request }) => {
    await delay(200)
    const url = new URL(request.url)
    const keyword = url.searchParams.get('keyword')?.toLowerCase() ?? ''
    const result = keyword
      ? predefinedRoles.filter(
          (r) => r.name.toLowerCase().includes(keyword) || r.code.toLowerCase().includes(keyword)
        )
      : [...predefinedRoles]
    return jsonEnvelope(result)
  }),
]
