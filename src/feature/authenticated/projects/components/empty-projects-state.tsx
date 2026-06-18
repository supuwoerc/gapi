import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'

export function EmptyProjectsState() {
  const { t } = useTranslation('projects')

  return (
    <Empty className="min-h-80">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Plus />
        </EmptyMedia>
        <EmptyTitle>{t('emptyProjects.title')}</EmptyTitle>
        <EmptyDescription>{t('emptyProjects.description')}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
