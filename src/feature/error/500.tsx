import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import serverError from '@/assets/error/server-error.png'

import { Button } from '@/components/ui/button'

const ServerError = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  return (
    <div className="h-svh w-svw">
      <div className="m-auto flex h-full w-full flex-col items-center justify-center gap-2">
        <img src={serverError} alt="not-fount" className="w-32" />
        <span className="font-medium">{t('error.serverError.title')}</span>
        <p className="text-center text-muted-foreground">{t('error.serverError.subtitle')}</p>
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

export default ServerError
