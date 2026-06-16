import type {
  Project,
  ProjectMember,
  ProjectRole,
  ProjectVisibility,
} from '@/schema/project/project'
import { Send, UserPlus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { MembersTable } from './members-table'
import { ProjectLogo } from './project-logo'
import { ProjectSettingsCard } from './project-settings-card'
import { ProjectVisibilityBadge } from './project-visibility-badge'

interface ProjectDetailProps {
  project: Project
  roles: ProjectRole[]
  members: ProjectMember[]
  membersTotal: number
  isRolesFetching: boolean
  isMembersFetching: boolean
  isUpdatingRole: boolean
  isRemoving: boolean
  isUpdatingLogo: boolean
  isUpdatingVisibility: boolean
  isApplying: boolean
  onInvite: () => void
  onApply: () => void
  onRoleChange: (memberId: number, roleId: number) => void
  onRemove: (member: ProjectMember) => void
  onLogoChange: (logo: string) => void
  onVisibilityChange: (visibility: ProjectVisibility) => void
}

export function ProjectDetail({
  project,
  roles,
  members,
  membersTotal,
  isRolesFetching,
  isMembersFetching,
  isUpdatingRole,
  isRemoving,
  isUpdatingLogo,
  isUpdatingVisibility,
  isApplying,
  onInvite,
  onApply,
  onRoleChange,
  onRemove,
  onLogoChange,
  onVisibilityChange,
}: ProjectDetailProps) {
  const { t } = useTranslation('feature')
  const currentMembership = project.current_user_membership
  const isOwner =
    currentMembership?.status === 'active' && currentMembership.project_role.name === 'Owner'
  const canApply = project.visibility === 'public' && currentMembership === null
  const isPending = currentMembership?.status === 'pending'

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-col gap-4 overflow-hidden">
      <div className="flex shrink-0 flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <ProjectLogo logo={project.logo} name={project.name} className="size-12" />
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-xl font-semibold">{project.name}</h3>
              <ProjectVisibilityBadge visibility={project.visibility} />
            </div>
            <p className="text-sm text-muted-foreground">{project.description}</p>
          </div>
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

      <Tabs defaultValue="members" className="min-h-0 w-full min-w-0 flex-1 gap-4 overflow-hidden">
        <TabsList className="shrink-0">
          <TabsTrigger value="members">{t('projects.tabs.members')}</TabsTrigger>
          {isOwner && <TabsTrigger value="settings">{t('projects.tabs.settings')}</TabsTrigger>}
        </TabsList>

        <TabsContent
          value="members"
          className="flex min-h-0 w-full min-w-0 flex-col overflow-hidden data-[state=inactive]:hidden"
        >
          <MembersTable
            members={members}
            membersTotal={membersTotal}
            roles={roles}
            canManageMembers={isOwner}
            isFetching={isMembersFetching || isRolesFetching}
            isUpdatingRole={isUpdatingRole}
            isRemoving={isRemoving}
            onRoleChange={onRoleChange}
            onRemove={onRemove}
          />
        </TabsContent>

        {isOwner && (
          <TabsContent
            value="settings"
            className="min-h-0 w-full min-w-0 overflow-y-auto data-[state=inactive]:hidden"
          >
            <ProjectSettingsCard
              project={project}
              roles={roles}
              isUpdatingLogo={isUpdatingLogo}
              isUpdatingVisibility={isUpdatingVisibility}
              onLogoChange={onLogoChange}
              onVisibilityChange={onVisibilityChange}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
