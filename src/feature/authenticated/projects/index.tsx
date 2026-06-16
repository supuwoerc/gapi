import * as React from 'react'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type {
  ProjectMember,
  ProjectMemberInvite,
  ProjectVisibility,
} from '@/schema/project/project'
import {
  createProject,
  getProjectMembers,
  getProjectRoles,
  getProjects,
  inviteProjectMember,
  removeProjectMember,
  updateProjectMemberRole,
  updateProjectVisibility,
} from '@/service/projects/projects'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

import { ConfigDrawer } from '@/components/config-drawer'
import ConfirmDialog from '@/components/confirm-dialog'
import { LanguageSwitcher } from '@/components/language-switcher'
import AppHeader from '@/components/layout/authenticated/app-header'
import AppMain from '@/components/layout/authenticated/app-main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import Search from '@/components/search'
import { ThemeModeSwitcher } from '@/components/theme-mode-switcher'

import { EmptyMembers, EmptyProjects, EmptyRoles } from './components/constants'
import { CreateProjectDialog } from './components/create-project-dialog'
import { EmptyProjectsState } from './components/empty-projects-state'
import { InviteMemberDialog } from './components/invite-member-dialog'
import { ProjectDetail } from './components/project-detail'
import { ProjectsSidebar } from './components/projects-sidebar'
import { getErrorMessage } from './components/utils'

const Projects = () => {
  const { t } = useTranslation('feature')
  const queryClient = useQueryClient()
  const [selectedProjectId, setSelectedProjectId] = React.useState<number | null>(null)
  const [createOpen, setCreateOpen] = React.useState(false)
  const [inviteOpen, setInviteOpen] = React.useState(false)
  const [memberToRemove, setMemberToRemove] = React.useState<ProjectMember | null>(null)

  const { data: projects = EmptyProjects, isLoading: isProjectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
  })

  const selectedProject = React.useMemo(
    () => projects.find((project) => project.id === selectedProjectId) ?? projects[0] ?? null,
    [projects, selectedProjectId]
  )
  const activeProjectId = selectedProject?.id ?? null

  const { data: roles = EmptyRoles, isFetching: isRolesFetching } = useQuery({
    queryKey: ['project-roles', activeProjectId],
    queryFn: () => getProjectRoles(activeProjectId!),
    enabled: activeProjectId !== null,
  })

  const { data: members = EmptyMembers, isFetching: isMembersFetching } = useQuery({
    queryKey: ['project-members', activeProjectId],
    queryFn: () => getProjectMembers(activeProjectId!),
    enabled: activeProjectId !== null,
  })

  const createMutation = useMutation({
    mutationFn: createProject,
    onSuccess: (project) => {
      toast.success(t('projects.toast.createSuccess'))
      setCreateOpen(false)
      setSelectedProjectId(project.id)
      void queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, t('projects.toast.failed')))
    },
  })

  const inviteMutation = useMutation({
    mutationFn: (values: ProjectMemberInvite) => inviteProjectMember(activeProjectId!, values),
    onSuccess: () => {
      toast.success(t('projects.toast.inviteSuccess'))
      setInviteOpen(false)
      void queryClient.invalidateQueries({ queryKey: ['project-members', activeProjectId] })
      void queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, t('projects.toast.failed')))
    },
  })

  const roleMutation = useMutation({
    mutationFn: ({ memberId, roleId }: { memberId: number; roleId: number }) =>
      updateProjectMemberRole(activeProjectId!, memberId, { project_role_id: roleId }),
    onSuccess: () => {
      toast.success(t('projects.toast.roleSuccess'))
      void queryClient.invalidateQueries({ queryKey: ['project-members', activeProjectId] })
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, t('projects.toast.failed')))
    },
  })

  const removeMutation = useMutation({
    mutationFn: (memberId: number) => removeProjectMember(activeProjectId!, memberId),
    onSuccess: () => {
      toast.success(t('projects.toast.removeSuccess'))
      setMemberToRemove(null)
      void queryClient.invalidateQueries({ queryKey: ['project-members', activeProjectId] })
      void queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, t('projects.toast.failed')))
    },
  })

  const visibilityMutation = useMutation({
    mutationFn: (visibility: ProjectVisibility) =>
      updateProjectVisibility(activeProjectId!, { visibility }),
    onSuccess: () => {
      toast.success(t('projects.toast.visibilitySuccess'))
      void queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, t('projects.toast.failed')))
    },
  })

  return (
    <>
      <AppHeader fixed>
        <Search />
        <div className="ms-auto flex items-center gap-4">
          <ThemeModeSwitcher />
          <LanguageSwitcher />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </AppHeader>
      <AppMain className="flex flex-col gap-4 sm:gap-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{t('projects.title')}</h2>
            <p className="text-muted-foreground">{t('projects.description')}</p>
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus />
            {t('projects.create')}
          </Button>
        </div>

        {isProjectsLoading ? (
          <div className="flex min-h-80 items-center justify-center">
            <Spinner />
          </div>
        ) : projects.length === 0 ? (
          <EmptyProjectsState />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
            <ProjectsSidebar
              projects={projects}
              selectedProject={selectedProject}
              onSelectProject={setSelectedProjectId}
            />

            {selectedProject && (
              <ProjectDetail
                project={selectedProject}
                roles={roles}
                members={members}
                isRolesFetching={isRolesFetching}
                isMembersFetching={isMembersFetching}
                isUpdatingRole={roleMutation.isPending}
                isRemoving={removeMutation.isPending}
                isUpdatingVisibility={visibilityMutation.isPending}
                onInvite={() => setInviteOpen(true)}
                onRoleChange={(memberId, roleId) => roleMutation.mutate({ memberId, roleId })}
                onRemove={setMemberToRemove}
                onVisibilityChange={(visibility) => visibilityMutation.mutate(visibility)}
              />
            )}
          </div>
        )}
      </AppMain>

      <CreateProjectDialog
        open={createOpen}
        isPending={createMutation.isPending}
        onOpenChange={setCreateOpen}
        onSubmit={(values) => createMutation.mutate(values)}
      />
      <InviteMemberDialog
        open={inviteOpen}
        roles={roles}
        isPending={inviteMutation.isPending}
        onOpenChange={setInviteOpen}
        onSubmit={(values) => inviteMutation.mutate(values)}
      />
      <ConfirmDialog
        open={memberToRemove !== null}
        onOpenChange={(open) => {
          if (!open) setMemberToRemove(null)
        }}
        title={t('projects.removeDialog.title')}
        desc={t('projects.removeDialog.description', {
          username: memberToRemove?.user.username ?? '',
        })}
        destructive
        isLoading={removeMutation.isPending}
        handleConfirm={() => {
          if (memberToRemove) removeMutation.mutate(memberToRemove.id)
        }}
      />
    </>
  )
}

export default Projects
