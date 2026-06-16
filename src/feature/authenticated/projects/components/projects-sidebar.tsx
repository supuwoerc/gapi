import type { Project } from '@/schema/project/project'
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'

import { Badge } from '@/components/ui/badge'

import { ProjectLogo } from './project-logo'
import { ProjectVisibilityBadge } from './project-visibility-badge'

interface ProjectsSidebarProps {
  projects: Project[]
  selectedProject: Project | null
  onSelectProject: (projectId: number) => void
}

function getRelationshipKey(project: Project) {
  const membership = project.current_user_membership

  if (membership?.status === 'pending') return 'pending'
  if (membership?.project_role.name === 'Owner') return 'owner'
  if (membership) return 'member'
  if (project.visibility === 'public') return 'canApply'
  return 'private'
}

export function ProjectsSidebar({
  projects,
  selectedProject,
  onSelectProject,
}: ProjectsSidebarProps) {
  const { t } = useTranslation('feature')

  return (
    <aside className="flex flex-col gap-2">
      {projects.map((project) => (
        <button
          key={project.id}
          type="button"
          className={cn(
            'flex flex-col gap-2 rounded-lg border bg-background p-3 text-start transition-colors hover:bg-accent',
            selectedProject?.id === project.id && 'border-primary bg-primary/5'
          )}
          onClick={() => onSelectProject(project.id)}
        >
          <span className="flex items-start gap-3">
            <ProjectLogo logo={project.logo} name={project.name} className="size-10" />
            <span className="flex min-w-0 flex-1 flex-col gap-2">
              <span className="flex min-w-0 items-center justify-between gap-2">
                <span className="truncate font-medium">{project.name}</span>
                <ProjectVisibilityBadge visibility={project.visibility} />
              </span>
              <span className="line-clamp-2 text-sm text-muted-foreground">
                {project.description}
              </span>
            </span>
          </span>
          <span className="text-xs text-muted-foreground">
            {t('projects.memberCount', { count: project.member_count })}
          </span>
          <Badge variant="outline" className="w-fit">
            {t(`projects.relationship.${getRelationshipKey(project)}`)}
          </Badge>
        </button>
      ))}
    </aside>
  )
}
