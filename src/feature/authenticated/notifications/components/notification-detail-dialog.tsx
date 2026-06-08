'use no memo'

import { useQuery, useQueryClient } from '@tanstack/react-query'

import type { Notification } from '@/schema/notification/notification'
import { getNotificationDetail } from '@/service/notifications/list'
import { ExternalLink } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface NotificationDetailDialogProps {
  notification: Notification | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NotificationDetailDialog({
  notification,
  open,
  onOpenChange,
}: NotificationDetailDialogProps) {
  const { t } = useTranslation('feature')
  const queryClient = useQueryClient()

  const { data: detail } = useQuery({
    queryKey: ['notification-detail', notification?.id],
    queryFn: () => getNotificationDetail({ id: notification!.id }),
    enabled: open && !!notification,
  })

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] })
    }
    onOpenChange(value)
  }

  const displayData = detail ?? notification

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="px-4 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{displayData?.title}</DialogTitle>
          <DialogDescription className="space-x-1">
            {t('notifications.dialog.from')}: {displayData?.sender} ·{' '}
            {displayData?.created_at.toLocaleDateString()}
            {displayData?.source && (
              <>
                {' · '}
                <Link
                  to={displayData.source}
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                  onClick={() => onOpenChange(false)}
                >
                  {t('notifications.dialog.source')}
                  <ExternalLink className="size-3.5" />
                </Link>
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col">
          <div className="max-h-60 overflow-y-auto text-sm whitespace-pre-wrap">
            {displayData?.content}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
