import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { Button } from '@/components/ui/button'

const RouteError = () => {
  const { t } = useTranslation(['component', 'global'])
  const navigate = useNavigate()
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-2">
        <h1 className="text-[7rem] leading-tight font-bold">💥</h1>
        <span className="font-medium">{t('routeError.title')}</span>
        <p className="text-center text-muted-foreground">{t('routeError.subtitle')}</p>
        <div className="mt-6 flex gap-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            {t('global:button.goBack')}
          </Button>
          <Button onClick={() => navigate('/')}>{t('global:button.backToHome')}</Button>
        </div>
      </div>
    </div>
  )
}

export { RouteError }
