import type { Project, ProjectRole, ProjectVisibility } from '@/schema/project/project'
import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'

import { ProjectLogoPicker } from './project-logo'
import { ProjectVisibilityBadge } from './project-visibility-badge'

interface ProjectSettingsCardProps {
  project: Project
  roles: ProjectRole[]
  isUpdatingLogo: boolean
  isUpdatingVisibility: boolean
  onLogoChange: (logo: string) => void
  onVisibilityChange: (visibility: ProjectVisibility) => void
}

export function ProjectSettingsCard({
  project,
  roles,
  isUpdatingLogo,
  isUpdatingVisibility,
  onLogoChange,
  onVisibilityChange,
}: ProjectSettingsCardProps) {
  const { t } = useTranslation('feature')

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('projects.settings.visibilityTitle')}</CardTitle>
        <CardDescription>{t('projects.settings.visibilityDescription')}</CardDescription>
        <CardAction>
          <Switch
            checked={project.visibility === 'public'}
            disabled={isUpdatingVisibility}
            onCheckedChange={(checked) => onVisibilityChange(checked ? 'public' : 'private')}
          />
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">{t('projects.settings.logoTitle')}</span>
          <div className="flex flex-wrap items-center gap-3">
            <ProjectLogoPicker
              logo={project.logo}
              name={project.name}
              disabled={isUpdatingLogo}
              dialogTitle={t('projects.settings.logoDialogTitle')}
              onChange={onLogoChange}
            />
            <p className="text-sm text-muted-foreground">
              {t('projects.settings.logoDescription')}
            </p>
          </div>
        </div>
        <Separator />
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">{t('projects.settings.currentVisibility')}</span>
          <ProjectVisibilityBadge visibility={project.visibility} />
        </div>
        <Separator />
        <div className="flex flex-col rounded-lg border">
          {roles.map((role) => (
            <div
              key={role.id}
              className="flex flex-wrap items-start justify-between gap-3 border-b p-3 last:border-b-0"
            >
              <div className="flex min-w-0 flex-col gap-1">
                <span className="font-medium">{role.name}</span>
                <p className="text-sm text-muted-foreground">{role.description}</p>
              </div>
              {role.is_preset && <Badge variant="outline">{t('projects.roles.preset')}</Badge>}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
