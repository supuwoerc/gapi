import { type FC, useState } from 'react'

import { ChevronsUpDown, Plus } from 'lucide-react'
import { DynamicIcon } from 'lucide-react/dynamic.mjs'
import { useTranslation } from 'react-i18next'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'

import type { Project } from '@/components/layout/authenticated/types/project'

interface ProjectSwitcherProps {
  projects: Array<Project>
}

const ProjectSwitcher: FC<ProjectSwitcherProps> = ({ projects }) => {
  const { isMobile } = useSidebar()
  const { t } = useTranslation('global')
  const [activeProject, setActiveProject] = useState(projects[0])

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <DynamicIcon name={activeProject.logo} className="size-4" />
              </div>
              <div className="grid flex-1 text-start text-sm leading-tight">
                <span className="truncate font-semibold">{activeProject.name}</span>
                <span className="truncate text-xs">{activeProject.desc}</span>
              </div>
              <ChevronsUpDown className="ms-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              {t('menu.projects')}
            </DropdownMenuLabel>
            {projects.map((project) => (
              <DropdownMenuItem
                key={project.name}
                onClick={() => setActiveProject(project)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-sm border">
                  <DynamicIcon name={project.logo} className="size-4 shrink-0" />
                </div>
                {project.name}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                <Plus className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">{t('menu.addProject')}</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export default ProjectSwitcher
