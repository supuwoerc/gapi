import { delay, http } from 'msw'

import { tasks } from '../data/tasks'
import { applyAdvancedFilters, applySorting, paginate } from '../utils/filter'
import { jsonEnvelope } from '../utils/response'

const BASE = import.meta.env.VITE_APP_DEFAULT_SERVER

export const taskHandlers = [
  http.get(`${BASE}/tasks`, async ({ request }) => {
    await delay(200)
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 1)
    const perPage = Number(url.searchParams.get('perPage') ?? 10)
    const title = url.searchParams.get('title') ?? ''
    const level = url.searchParams.getAll('level')
    const type = url.searchParams.getAll('type')
    const sort = url.searchParams.get('sort')
    const filters = url.searchParams.get('filters') ?? undefined

    let result = [...tasks]

    if (title) {
      const keyword = title.toLowerCase()
      result = result.filter((t) => t.title.toLowerCase().includes(keyword))
    }

    if (level.length) {
      result = result.filter((t) => level.includes(t.level))
    }

    if (type.length) {
      result = result.filter((t) => type.includes(t.type))
    }

    result = applyAdvancedFilters(result, filters)

    const sortArr: { id: string; desc: boolean }[] = sort ? JSON.parse(sort) : []
    if (sortArr.length > 0) {
      result = applySorting(result, sortArr)
    } else {
      result.sort((a, b) => b.updated_at.getTime() - a.updated_at.getTime())
    }

    const paged = paginate(result, page, perPage)
    return jsonEnvelope(paged)
  }),
]
