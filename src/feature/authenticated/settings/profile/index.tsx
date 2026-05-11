import { useTranslation } from 'react-i18next'

import { Separator } from '@/components/ui/separator'

const ProfilePage = () => {
  const { t } = useTranslation('feature')

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">{t('settings.profile.title')}</h3>
        <p className="text-sm text-muted-foreground">{t('settings.profile.description')}</p>
      </div>
      <Separator />
      <div className="text-sm text-muted-foreground">{t('settings.profile.placeholder')}</div>
    </div>
  )
}

export default ProfilePage
