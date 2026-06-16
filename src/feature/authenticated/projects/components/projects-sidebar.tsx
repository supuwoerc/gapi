import type { Project } from '@/schema/project/project'
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'

import { ProjectVisibilityBadge } from './project-visibility-badge'

interface ProjectsSidebarProps {
  projects: Project[]
  selectedProject: Project | null
  onSelectProject: (projectId: number) => void
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
          <span className="flex items-center justify-between gap-2">
            <span className="truncate font-medium">{project.name}</span>
            <ProjectVisibilityBadge visibility={project.visibility} />
          </span>
          <span className="line-clamp-2 text-sm text-muted-foreground">{project.description}</span>
          <span className="text-xs text-muted-foreground">
            {t('projects.memberCount', { count: project.member_count })}
          </span>
        </button>
      ))}
    </aside>
  )
}
