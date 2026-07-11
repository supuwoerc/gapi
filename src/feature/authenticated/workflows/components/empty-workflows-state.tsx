import { useTranslation } from 'react-i18next'

import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'

export function EmptyWorkflowsState() {
  const { t } = useTranslation('workflows')

  return (
    <Empty className="min-h-80">
      <EmptyHeader>
        <EmptyTitle>{t('emptyWorkflows.title')}</EmptyTitle>
        <EmptyDescription>{t('emptyWorkflows.description')}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
