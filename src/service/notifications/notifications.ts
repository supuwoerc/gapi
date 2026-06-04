import { put } from '@/lib/http'

import type { UpdateNotificationsParams, UpdateNotificationsResponse } from './dto/notifications'

export function updateNotifications(params: UpdateNotificationsParams) {
  return put<UpdateNotificationsResponse>('/notifications/settings', { json: params })
}
