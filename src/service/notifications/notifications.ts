import { put } from '@/lib/http'

export interface UpdateNotificationsParams {
  taskEmail: boolean
  messageEmail: boolean
  versionUpdate: boolean
  security: boolean
}

export interface UpdateNotificationsResponse {
  taskEmail: boolean
  messageEmail: boolean
  versionUpdate: boolean
  security: boolean
}

export function updateNotifications(params: UpdateNotificationsParams) {
  return put<UpdateNotificationsResponse>('/notifications/settings', { json: params })
}
