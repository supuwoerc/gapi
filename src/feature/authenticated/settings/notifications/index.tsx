import { useTranslation } from 'react-i18next'

import { Separator } from '@/components/ui/separator'

const NotificationsPage = () => {
  const { t } = useTranslation('feature')

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">{t('settings.notifications.title')}</h3>
        <p className="text-sm text-muted-foreground">{t('settings.notifications.description')}</p>
      </div>
      <Separator />
      <div className="text-sm text-muted-foreground">{t('settings.notifications.placeholder')}</div>
    </div>
  )
}

export default NotificationsPage
