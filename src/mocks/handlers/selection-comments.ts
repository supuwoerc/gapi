import { delay, http } from 'msw'

import { createSelectionComment, getSelectionComments } from '../data/selection-comments'
import { jsonEnvelope } from '../utils/response'

const BASE = import.meta.env.VITE_APP_DEFAULT_SERVER

export const selectionCommentHandlers = [
  http.get(`${BASE}/selection-comments`, async ({ request }) => {
    await delay(200)
    const url = new URL(request.url)
    const targetType = url.searchParams.get('target_type')
    const targetId = Number(url.searchParams.get('target_id'))
    const field = url.searchParams.get('field')

    if (targetType !== 'document' || field !== 'content' || Number.isNaN(targetId)) {
      return jsonEnvelope({ data: [] })
    }

    return jsonEnvelope({
      data: getSelectionComments({
        target_type: targetType,
        target_id: targetId,
        field,
      }),
    })
  }),

  http.post(`${BASE}/selection-comments`, async ({ request }) => {
    await delay(300)
    const body = (await request.json()) as Parameters<typeof createSelectionComment>[0]
    const comment = createSelectionComment(body)

    return jsonEnvelope({ data: comment })
  }),
]
