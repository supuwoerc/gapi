import { notificationListSchema, notificationSchema } from '@/schema/notifications/notifications'
import type { Notification } from '@/schema/notifications/notifications'

import { del, get, post } from '@/lib/http'

import type {
  DeleteNotificationsParams,
  GetNotificationDetailParams,
  GetNotificationsParams,
  GetNotificationsResponse,
  MarkNotificationsReadParams,
} from './dto/list'

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

  const res = await get<GetNotificationsResponse>('/notifications', { searchParams: arrayParams })
  return { ...res, data: notificationListSchema.parse(res.data) }
}

export async function getNotificationDetail(params: GetNotificationDetailParams) {
  const res = await get<Notification>(`/notifications/${params.id}`)
  return notificationSchema.parse(res)
}

export function markNotificationsRead(params: MarkNotificationsReadParams) {
  return post<{ success: boolean }>('/notifications/mark-read', { json: params })
}

export function deleteNotifications(params: DeleteNotificationsParams) {
  return del<{ success: boolean }>('/notifications', { json: params })
}
