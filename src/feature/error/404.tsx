import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import notFound from '@/assets/error/not-found.png'

import { Button } from '@/components/ui/button'

const NotFound = () => {
  const { t } = useTranslation(['not-found', 'global'])
  const navigate = useNavigate()
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2">
      <img src={notFound} alt="not-fount" className="w-32" />
      <span className="font-medium">{t('title')}</span>
      <p className="text-center text-muted-foreground">{t('subtitle')}</p>
      <div className="mt-6 flex gap-4">
        <Button variant="outline" onClick={() => navigate(-1)}>
          {t('global:button.goBack')}
        </Button>
        <Button onClick={() => navigate('/')}>{t('global:button.backToHome')}</Button>
      </div>
    </div>
  )
}

export default NotFound
