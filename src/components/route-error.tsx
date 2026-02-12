import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { Button } from '@/components/ui/button'

const RouteError = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  return (
    <div className="h-svh w-svw">
      <div className="m-auto flex h-full w-full flex-col items-center justify-center gap-2">
        <h1 className="text-[7rem] leading-tight font-bold">
          {t('error.routeError.pageLoadError')}
        </h1>
        <span className="font-medium">{t('error.routeError.loadError')}</span>
        <p className="text-center text-muted-foreground"> {t('error.routeError.loadingTips')}</p>
        <div className="mt-6 flex gap-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            {t('common.button.goBack')}
          </Button>
          <Button onClick={() => navigate('/')}>{t('common.button.backToHome')}</Button>
        </div>
      </div>
    </div>
  )
}

export { RouteError }
