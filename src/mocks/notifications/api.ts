import type {
  UpdateNotificationsParams,
  UpdateNotificationsResponse,
} from '@/service/notifications/dto/notifications'

export async function updateNotifications(
  params: UpdateNotificationsParams
): Promise<UpdateNotificationsResponse> {
  await new Promise((r) => setTimeout(r, 800))
  return {
    taskEmail: params.taskEmail,
    messageEmail: params.messageEmail,
    versionUpdate: params.versionUpdate,
    security: params.security,
  }
}
