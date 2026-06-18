import { delay, http } from 'msw'

import { documents } from '../data/documents'
import { paginate } from '../utils/filter'
import { jsonEnvelope } from '../utils/response'

const BASE = import.meta.env.VITE_APP_DEFAULT_SERVER

export const documentHandlers = [
  http.get(`${BASE}/documents`, async ({ request }) => {
    await delay(200)
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 1)
    const perPage = Number(url.searchParams.get('perPage') ?? 20)
    const keyword = url.searchParams.get('keyword')?.toLowerCase() ?? ''
    const visibility = url.searchParams.get('visibility')
    const projectId = url.searchParams.get('project_id')

    let result = [...documents].sort(
      (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    )

    if (keyword) {
      result = result.filter(
        (doc) =>
          doc.title.toLowerCase().includes(keyword) ||
          doc.description.toLowerCase().includes(keyword)
      )
    }

    if (visibility) {
      result = result.filter((doc) => doc.visibility === visibility)
    }

    if (projectId) {
      result = result.filter((doc) => doc.project.id === Number(projectId))
    }

    return jsonEnvelope(paginate(result, page, perPage))
  }),
]
