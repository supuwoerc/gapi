import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import forbidden from '@/assets/error/forbidden.png'

import { Button } from '@/components/ui/button'

const Forbidden = () => {
  const { t } = useTranslation(['feature', 'global'])
  const navigate = useNavigate()
  return (
    <div className="h-svh w-svw">
      <div className="m-auto flex h-full w-full flex-col items-center justify-center gap-2">
        <img src={forbidden} alt="not-fount" className="w-32" />
        <span className="font-medium">{t('forbidden.title')}</span>
        <p className="text-center text-muted-foreground">{t('forbidden.subtitle')}</p>
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

export default Forbidden
