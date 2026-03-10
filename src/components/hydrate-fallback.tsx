import { useTranslation } from 'react-i18next'

import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from './ui/empty'
import { Spinner } from './ui/spinner'

const HydrateFallback = () => {
  const { t } = useTranslation()
  return (
    <div className="flex h-svh w-full items-center justify-center">
      <Empty className="w-full">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Spinner />
          </EmptyMedia>
          <EmptyTitle>{t('global.loading')}</EmptyTitle>
          <EmptyDescription>{t('global.tips.hydrate')}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  )
}

export { HydrateFallback }
