import type { ProjectVisibility } from '@/schema/project/project'
import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/badge'

interface ProjectVisibilityBadgeProps {
  visibility: ProjectVisibility
}

export function ProjectVisibilityBadge({ visibility }: ProjectVisibilityBadgeProps) {
  const { t } = useTranslation('projects')

  return (
    <Badge variant={visibility === 'public' ? 'secondary' : 'outline'}>
      {t(`visibility.${visibility}`)}
    </Badge>
  )
}
