import type {
  Project,
  ProjectMember,
  ProjectRole,
  ProjectVisibility,
} from '@/schema/project/project'
import { Send, UserPlus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { MembersTable } from './members-table'
import { ProjectSettingsCard } from './project-settings-card'
import { ProjectVisibilityBadge } from './project-visibility-badge'

interface ProjectDetailProps {
  project: Project
  roles: ProjectRole[]
  members: ProjectMember[]
  isRolesFetching: boolean
  isMembersFetching: boolean
  isUpdatingRole: boolean
  isRemoving: boolean
  isUpdatingVisibility: boolean
  isApplying: boolean
  onInvite: () => void
  onApply: () => void
  onRoleChange: (memberId: number, roleId: number) => void
  onRemove: (member: ProjectMember) => void
  onVisibilityChange: (visibility: ProjectVisibility) => void
}

export function ProjectDetail({
  project,
  roles,
  members,
  isRolesFetching,
  isMembersFetching,
  isUpdatingRole,
  isRemoving,
  isUpdatingVisibility,
  isApplying,
  onInvite,
  onApply,
  onRoleChange,
  onRemove,
  onVisibilityChange,
}: ProjectDetailProps) {
  const { t } = useTranslation('feature')
  const currentMembership = project.current_user_membership
  const isOwner =
    currentMembership?.status === 'active' && currentMembership.project_role.name === 'Owner'
  const canApply = project.visibility === 'public' && currentMembership === null
  const isPending = currentMembership?.status === 'pending'

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-xl font-semibold">{project.name}</h3>
            <ProjectVisibilityBadge visibility={project.visibility} />
          </div>
          <p className="text-sm text-muted-foreground">{project.description}</p>
        </div>
        {isOwner ? (
          <Button variant="outline" onClick={onInvite}>
            <UserPlus />
            {t('projects.invite')}
          </Button>
        ) : canApply ? (
          <Button variant="outline" disabled={isApplying} onClick={onApply}>
            <Send />
            {isApplying ? t('projects.applying') : t('projects.apply')}
          </Button>
        ) : isPending ? (
          <Button variant="outline" disabled>
            <Send />
            {t('projects.applicationPending')}
          </Button>
        ) : null}
      </div>

      <Tabs defaultValue="members" className="gap-4">
        <TabsList>
          <TabsTrigger value="members">{t('projects.tabs.members')}</TabsTrigger>
          {isOwner && <TabsTrigger value="settings">{t('projects.tabs.settings')}</TabsTrigger>}
        </TabsList>

        <TabsContent value="members">
          <div className="data-table-container">
            {isMembersFetching || isRolesFetching ? (
              <div className="flex min-h-64 items-center justify-center">
                <Spinner />
              </div>
            ) : (
              <MembersTable
                members={members}
                roles={roles}
                canManageMembers={isOwner}
                isUpdatingRole={isUpdatingRole}
                isRemoving={isRemoving}
                onRoleChange={onRoleChange}
                onRemove={onRemove}
              />
            )}
          </div>
        </TabsContent>

        {isOwner && (
          <TabsContent value="settings">
            <ProjectSettingsCard
              project={project}
              roles={roles}
              isUpdatingVisibility={isUpdatingVisibility}
              onVisibilityChange={onVisibilityChange}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
