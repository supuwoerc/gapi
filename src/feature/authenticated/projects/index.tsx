import * as React from 'react'

import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import type {
  ProjectMember,
  ProjectMemberInvite,
  ProjectVisibility,
} from '@/schema/project/project'
import {
  applyToJoinProject,
  createProject,
  getProjectMembers,
  getProjectRoles,
  getProjects,
  inviteProjectMember,
  removeProjectMember,
  updateProjectLogo,
  updateProjectMemberRole,
  updateProjectVisibility,
} from '@/service/projects/projects'
import { Plus } from 'lucide-react'
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { getErrorMessage } from '@/lib/error'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'

import { ConfigDrawer } from '@/components/config-drawer'
import ConfirmDialog from '@/components/confirm-dialog'
import { LanguageSwitcher } from '@/components/language-switcher'
import AppHeader from '@/components/layout/authenticated/app-header'
import AppMain from '@/components/layout/authenticated/app-main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import Search from '@/components/search'
import { ThemeModeSwitcher } from '@/components/theme-mode-switcher'

import { EmptyMembersPage, EmptyProjects, EmptyRoles } from './components/constants'
import { CreateProjectDialog } from './components/create-project-dialog'
import { EmptyProjectsState } from './components/empty-projects-state'
import { InviteMemberDialog } from './components/invite-member-dialog'
import { ProjectDetail } from './components/project-detail'
import { ProjectsList } from './components/projects-list'

const ProjectsPageSize = 20

const Projects = () => {
  const { t } = useTranslation('feature')
  const queryClient = useQueryClient()
  const [selectedProjectId, setSelectedProjectId] = React.useState<number | null>(null)
  const [createOpen, setCreateOpen] = React.useState(false)
  const [detailOpen, setDetailOpen] = React.useState(false)
  const [inviteOpen, setInviteOpen] = React.useState(false)
  const [memberToRemove, setMemberToRemove] = React.useState<ProjectMember | null>(null)
  const [projectKeyword, setProjectKeyword] = useQueryState(
    'projectKeyword',
    parseAsString.withDefault('')
  )
  const [memberPage, setMemberPage] = useQueryState('memberPage', parseAsInteger.withDefault(1))
  const [memberPerPage] = useQueryState('memberPerPage', parseAsInteger.withDefault(10))

  const {
    data: projectsPages,
    fetchNextPage: fetchNextProjectsPage,
    hasNextPage: hasNextProjectsPage = false,
    isFetchingNextPage: isFetchingNextProjectsPage,
    isLoading: isProjectsLoading,
  } = useInfiniteQuery({
    queryKey: ['projects', { keyword: projectKeyword }],
    queryFn: ({ pageParam }) =>
      getProjects({
        page: pageParam,
        perPage: ProjectsPageSize,
        keyword: projectKeyword || undefined,
      }),
    getNextPageParam: (_lastPage, allPages) => {
      const loaded = allPages.reduce((count, page) => count + page.data.length, 0)
      const total = allPages[0]?.total ?? 0
      return loaded < total ? allPages.length + 1 : undefined
    },
    initialPageParam: 1,
    placeholderData: keepPreviousData,
  })
  const projects = React.useMemo(
    () => projectsPages?.pages.flatMap((page) => page.data) ?? EmptyProjects,
    [projectsPages?.pages]
  )
  const projectsTotal = projectsPages?.pages[0]?.total ?? 0
  const hasProjectKeyword = projectKeyword.trim().length > 0

  const selectedProject = React.useMemo(
    () => projects.find((project) => project.id === selectedProjectId) ?? null,
    [projects, selectedProjectId]
  )
  const activeProjectId = selectedProject?.id ?? null

  React.useEffect(() => {
    void setMemberPage(1)
  }, [activeProjectId, setMemberPage])

  const { data: roles = EmptyRoles, isFetching: isRolesFetching } = useQuery({
    queryKey: ['project-roles', activeProjectId],
    queryFn: () => getProjectRoles(activeProjectId!),
    enabled: detailOpen && activeProjectId !== null,
  })

  const { data: membersPage = EmptyMembersPage, isFetching: isMembersFetching } = useQuery({
    queryKey: ['project-members', activeProjectId, { page: memberPage, perPage: memberPerPage }],
    queryFn: () =>
      getProjectMembers(activeProjectId!, { page: memberPage, perPage: memberPerPage }),
    enabled: detailOpen && activeProjectId !== null,
    placeholderData: keepPreviousData,
  })
  const memberTotalPages = Math.max(1, Math.ceil(membersPage.total / memberPerPage))

  React.useEffect(() => {
    if (memberPage > memberTotalPages) {
      void setMemberPage(memberTotalPages)
    }
  }, [memberPage, memberTotalPages, setMemberPage])

  const handleProjectKeywordChange = React.useCallback(
    (keyword: string) => {
      void setProjectKeyword(keyword || null)
    },
    [setProjectKeyword]
  )

  const handleLoadMoreProjects = React.useCallback(() => {
    void fetchNextProjectsPage()
  }, [fetchNextProjectsPage])

  const handleSelectProject = React.useCallback(
    (projectId: number) => {
      setSelectedProjectId(projectId)
      setDetailOpen(true)
      void setMemberPage(1)
    },
    [setMemberPage]
  )

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

  const applyMutation = useMutation({
    mutationFn: () => applyToJoinProject(activeProjectId!),
    onSuccess: () => {
      toast.success(t('projects.toast.applySuccess'))
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

  const logoMutation = useMutation({
    mutationFn: (logo: string) => updateProjectLogo(activeProjectId!, { logo }),
    onSuccess: () => {
      toast.success(t('projects.toast.logoSuccess'))
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
      <AppMain fixed className="min-h-0 flex-1 basis-0 gap-4 sm:gap-6">
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
        ) : projects.length === 0 && !hasProjectKeyword ? (
          <EmptyProjectsState />
        ) : (
          <div className="min-h-0 flex-1 overflow-hidden">
            <ProjectsList
              projects={projects}
              projectsTotal={projectsTotal}
              keyword={projectKeyword}
              isLoading={isProjectsLoading}
              isFetchingNextPage={isFetchingNextProjectsPage}
              hasNextPage={hasNextProjectsPage}
              onKeywordChange={handleProjectKeywordChange}
              onLoadMore={handleLoadMoreProjects}
              onSelectProject={handleSelectProject}
            />
          </div>
        )}
      </AppMain>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="flex h-[calc(100svh-2rem)] max-h-[52rem] flex-col overflow-hidden p-8 sm:max-w-6xl sm:p-8">
          <DialogTitle className="sr-only">
            {selectedProject?.name ?? t('projects.title')}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {selectedProject?.description ?? t('projects.description')}
          </DialogDescription>
          {selectedProject ? (
            <div className="flex min-h-0 flex-1 overflow-hidden">
              <ProjectDetail
                project={selectedProject}
                roles={roles}
                members={membersPage.data}
                membersTotal={membersPage.total}
                isRolesFetching={isRolesFetching}
                isMembersFetching={isMembersFetching}
                isUpdatingRole={roleMutation.isPending}
                isRemoving={removeMutation.isPending}
                isUpdatingLogo={logoMutation.isPending}
                isUpdatingVisibility={visibilityMutation.isPending}
                isApplying={applyMutation.isPending}
                onInvite={() => setInviteOpen(true)}
                onApply={() => applyMutation.mutate()}
                onRoleChange={(memberId, roleId) => roleMutation.mutate({ memberId, roleId })}
                onRemove={setMemberToRemove}
                onLogoChange={(logo) => logoMutation.mutate(logo)}
                onVisibilityChange={(visibility) => visibilityMutation.mutate(visibility)}
              />
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

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
