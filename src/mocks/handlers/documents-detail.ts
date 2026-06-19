import { delay, http } from 'msw'

import { documents } from '../data/documents'
import { getDocumentContent } from '../data/documents-detail'
import { errorEnvelope, jsonEnvelope } from '../utils/response'

const BASE = import.meta.env.VITE_APP_DEFAULT_SERVER

export const documentDetailHandlers = [
  http.get(`${BASE}/documents/:id`, async ({ params }) => {
    await delay(200)
    const id = Number(params.id)
    const document = documents.find((d) => d.id === id)

    if (!document) {
      return errorEnvelope(404, 'Document not found')
    }

    return jsonEnvelope({ data: { ...document, content: getDocumentContent(id) } })
  }),
]
