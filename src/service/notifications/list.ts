import { notificationListSchema, notificationSchema } from '@/schema/notification/notification'
import type { Notification } from '@/schema/notification/notification'
import type { PaginatedResponse } from '@/types/shared'

import { del, get, post } from '@/lib/http'

export interface GetNotificationsParams {
  page: number
  perPage: number
  sort: { id: string; desc: boolean }[]
  title?: string
  type?: string[]
  is_read?: string[]
  filters?: string
}

export interface MarkNotificationsReadParams {
  ids: number[]
}

export interface DeleteNotificationsParams {
  ids: number[]
}

export async function getNotifications(params: GetNotificationsParams) {
  const searchParams: Record<string, string> = {
    page: String(params.page),
    perPage: String(params.perPage),
  }

  if (params.title) searchParams.title = params.title
  if (params.sort.length > 0) searchParams.sort = JSON.stringify(params.sort)
  if (params.filters) searchParams.filters = params.filters

  const arrayParams = new URLSearchParams(searchParams)
  params.type?.forEach((v) => arrayParams.append('type', v))
  params.is_read?.forEach((v) => arrayParams.append('is_read', v))

  const res = await get<PaginatedResponse<Notification>>('/notifications', {
    searchParams: arrayParams,
  })
  return { ...res, data: notificationListSchema.parse(res.data) }
}

export async function getNotificationDetail(params: { id: number }) {
  const res = await get<Notification>(`/notifications/${params.id}`)
  return notificationSchema.parse(res)
}

export function markNotificationsRead(params: MarkNotificationsReadParams) {
  return post<{ success: boolean }>('/notifications/mark-read', { json: params })
}

export function deleteNotifications(params: DeleteNotificationsParams) {
  return del<{ success: boolean }>('/notifications', { json: params })
}
