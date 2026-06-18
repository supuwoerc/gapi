import type { Document, DocumentVisibility } from '@/schema/document/document'
import { documentListSchema } from '@/schema/document/document'
import type { PaginatedResponse } from '@/types/shared'

import { get } from '@/lib/http'

export interface GetDocumentsParams {
  page: number
  perPage: number
  keyword?: string
  visibility?: DocumentVisibility
  project_id?: number
}

export async function getDocuments(
  params: GetDocumentsParams
): Promise<PaginatedResponse<Document>> {
  const searchParams: Record<string, string> = {
    page: String(params.page),
    perPage: String(params.perPage),
  }

  if (params.keyword) searchParams.keyword = params.keyword
  if (params.visibility) searchParams.visibility = params.visibility
  if (params.project_id) searchParams.project_id = String(params.project_id)

  const res = await get<PaginatedResponse<Document>>('/documents', { searchParams })
  return { data: documentListSchema.parse(res.data), total: res.total }
}
