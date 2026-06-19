import type { DocumentDetail } from '@/schema/document/document'
import { documentDetailSchema } from '@/schema/document/document'

import { get } from '@/lib/http'

export async function getDocumentDetail(params: { id: number }) {
  const res = await get<{ data: DocumentDetail }>(`/documents/${params.id}`)
  return { data: documentDetailSchema.parse(res.data) }
}
