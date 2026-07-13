import type {
  Project,
  ProjectMember,
  ProjectMemberInvite,
  ProjectMemberStatus,
  ProjectMemberUser,
  ProjectMutation,
  ProjectRole,
  ProjectRolePermission,
} from '@/schema/project/project'
import { faker } from '@faker-js/faker'

import { users } from './users'
import { workflows } from './workflows'

faker.seed(24680)

const modules = ['api', 'mock', 'test', 'doc']
const actions = ['create', 'read', 'update', 'delete']
const presetRoleNames = ['Owner', 'Editor', 'Viewer'] as const

let nextProjectId = 1000
let nextProjectRoleId = 5000
let nextProjectRolePermissionId = 9000
let nextProjectMemberId = 12000
let nextInvitedUserId = 90000

const projectLogoUrl = (name: string) =>
  `https://api.dicebear.com/9.x/shapes/svg?seed=${encodeURIComponent(name)}`

export const projects: Project[] = []
export const projectRoles: ProjectRole[] = []
export const projectRolePermissions: ProjectRolePermission[] = []
export const projectMembers: ProjectMember[] = []
export const projectWorkflowLinks: { project_id: number; workflow_id: number }[] = []

function toProjectUser(user: (typeof users)[number]): ProjectMemberUser {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
  }
}

export const currentProjectUser = toProjectUser(users[0])

function makeProjectRole(projectId: number, name: (typeof presetRoleNames)[number]): ProjectRole {
  const now = new Date()

  return {
    id: nextProjectRoleId++,
    project_id: projectId,
    name,
    description: `${name} preset role`,
    is_preset: true,
    parent_id: null,
    created_at: now,
    updated_at: now,
  }
}

function createPresetRoles(projectId: number) {
  return presetRoleNames.map((name) => makeProjectRole(projectId, name))
}

function createPresetPermissions(roles: ProjectRole[]) {
  const rows: ProjectRolePermission[] = []
  const now = new Date()

  for (const role of roles) {
    const allowedActions = role.name === 'Viewer' ? ['read'] : actions

    for (const module of modules) {
      for (const action of allowedActions) {
        rows.push({
          id: nextProjectRolePermissionId++,
          project_role_id: role.id,
          module,
          action,
          effect: 'allow',
          created_at: now,
          updated_at: now,
        })
      }
    }
  }

  return rows
}

function toMemberRole(role: ProjectRole) {
  return {
    id: role.id,
    name: role.name,
    is_preset: role.is_preset,
  }
}

function makeMember(
  projectId: number,
  user: ProjectMemberUser,
  role: ProjectRole,
  invitedBy: ProjectMemberUser | null = null,
  status: ProjectMemberStatus = 'active'
): ProjectMember {
  const now = new Date()

  return {
    id: nextProjectMemberId++,
    project_id: projectId,
    user,
    project_role_id: role.id,
    project_role: toMemberRole(role),
    status,
    joined_at: status === 'active' ? now : null,
    invited_by: invitedBy
      ? { id: invitedBy.id, username: invitedBy.username, email: invitedBy.email }
      : null,
    created_at: now,
    updated_at: now,
  }
}

function getCurrentUserMembership(projectId: number): Project['current_user_membership'] {
  const member = projectMembers.find(
    (item) => item.project_id === projectId && item.user.id === currentProjectUser.id
  )

  if (!member) return null

  return {
    status: member.status,
    project_role: member.project_role,
  }
}

function syncProjectState(projectId: number) {
  const project = projects.find((item) => item.id === projectId)
  if (!project) return

  project.member_count = projectMembers.filter(
    (member) => member.project_id === projectId && member.status === 'active'
  ).length
  project.current_user_membership = getCurrentUserMembership(projectId)
  project.updated_at = new Date()
}

function syncWorkflowUsedCounts() {
  const usedCounts = new Map<number, number>()

  for (const link of projectWorkflowLinks) {
    usedCounts.set(link.workflow_id, (usedCounts.get(link.workflow_id) ?? 0) + 1)
  }

  for (const workflow of workflows) {
    workflow.used_count = usedCounts.get(workflow.id) ?? 0
  }
}

function seedProjectWorkflowLinks(projectId: number) {
  if (workflows.length === 0 || projectId % 5 === 0) return

  const count = (projectId % 3) + 1
  const start = (projectId - 1000) % workflows.length

  for (let index = 0; index < count; index++) {
    const workflow = workflows[(start + index * 7) % workflows.length]
    projectWorkflowLinks.push({ project_id: projectId, workflow_id: workflow.id })
  }
}

function seedProject(
  name: string,
  description: string,
  visibility: Project['visibility'],
  owner: ProjectMemberUser,
  members: ProjectMemberUser[]
) {
  const now = faker.date.recent({ days: 30 })
  const project: Project = {
    id: nextProjectId++,
    name,
    description,
    logo: projectLogoUrl(name),
    visibility,
    member_count: 0,
    owner_user_id: owner.id,
    current_user_membership: null,
    created_at: now,
    updated_at: now,
  }
  const roles = createPresetRoles(project.id)
  const ownerRole = roles.find((role) => role.name === 'Owner')!
  const editorRole = roles.find((role) => role.name === 'Editor')!
  const viewerRole = roles.find((role) => role.name === 'Viewer')!

  projects.push(project)
  projectRoles.push(...roles)
  projectRolePermissions.push(...createPresetPermissions(roles))
  projectMembers.push(makeMember(project.id, owner, ownerRole))
  seedProjectWorkflowLinks(project.id)

  members.forEach((member, index) => {
    projectMembers.push(
      makeMember(project.id, member, index % 2 === 0 ? editorRole : viewerRole, owner)
    )
  })
  syncProjectState(project.id)

  return {
    project,
    ownerRole,
    editorRole,
    viewerRole,
  }
}

export function createProjectWithPresets(data: ProjectMutation) {
  const owner = toProjectUser(users[0])
  const project: Project = {
    id: nextProjectId++,
    name: data.name,
    description: data.description,
    logo: data.logo || projectLogoUrl(data.name),
    visibility: data.visibility,
    member_count: 0,
    owner_user_id: owner.id,
    current_user_membership: null,
    created_at: new Date(),
    updated_at: new Date(),
  }
  const roles = createPresetRoles(project.id)
  const ownerRole = roles.find((role) => role.name === 'Owner')!

  projects.unshift(project)
  projectRoles.push(...roles)
  projectRolePermissions.push(...createPresetPermissions(roles))
  projectMembers.push(makeMember(project.id, owner, ownerRole))
  syncProjectState(project.id)

  return project
}

export function getProjectRoles(projectId: number) {
  return projectRoles.filter((role) => role.project_id === projectId)
}

export function getProjectMembers(projectId: number) {
  return projectMembers.filter((member) => member.project_id === projectId)
}

export function getProjectWorkflows(projectId: number) {
  return projectWorkflowLinks
    .filter((link) => link.project_id === projectId)
    .map((link) => workflows.find((workflow) => workflow.id === link.workflow_id))
    .filter((workflow): workflow is (typeof workflows)[number] => Boolean(workflow))
}

export function updateProjectWorkflows(projectId: number, workflowIds: number[]) {
  const project = projects.find((item) => item.id === projectId)
  if (!project) return null

  const existingWorkflowIds = new Set(workflows.map((workflow) => workflow.id))
  const uniqueWorkflowIds = Array.from(new Set(workflowIds))

  if (uniqueWorkflowIds.some((workflowId) => !existingWorkflowIds.has(workflowId))) {
    return null
  }

  for (let index = projectWorkflowLinks.length - 1; index >= 0; index--) {
    if (projectWorkflowLinks[index].project_id === projectId) {
      projectWorkflowLinks.splice(index, 1)
    }
  }

  for (const workflowId of uniqueWorkflowIds) {
    projectWorkflowLinks.push({ project_id: projectId, workflow_id: workflowId })
  }

  project.updated_at = new Date()
  syncWorkflowUsedCounts()
  return getProjectWorkflows(projectId)
}

export function getProjectRole(projectId: number, roleId: number) {
  return projectRoles.find((role) => role.project_id === projectId && role.id === roleId)
}

export function getOwnerRole(projectId: number) {
  return projectRoles.find((role) => role.project_id === projectId && role.name === 'Owner')
}

export function countActiveOwners(projectId: number) {
  const ownerRole = getOwnerRole(projectId)
  if (!ownerRole) return 0

  return projectMembers.filter(
    (member) =>
      member.project_id === projectId &&
      member.status === 'active' &&
      member.project_role_id === ownerRole.id
  ).length
}

export function isCurrentUserOwner(projectId: number) {
  const ownerRole = getOwnerRole(projectId)
  if (!ownerRole) return false

  return projectMembers.some(
    (member) =>
      member.project_id === projectId &&
      member.user.id === currentProjectUser.id &&
      member.status === 'active' &&
      member.project_role_id === ownerRole.id
  )
}

export function inviteProjectMember(projectId: number, data: ProjectMemberInvite) {
  const role = getProjectRole(projectId, data.project_role_id)
  if (!role) return null

  const invitedBy = getProjectMembers(projectId).find(
    (member) => member.project_role.name === 'Owner'
  )
  const member = makeMember(
    projectId,
    {
      id: nextInvitedUserId++,
      username: data.username,
      email: data.email.toLowerCase(),
      avatar: faker.image.avatar(),
    },
    role,
    invitedBy?.user ?? null
  )

  projectMembers.push(member)
  syncProjectState(projectId)
  return member
}

export function applyToJoinProject(projectId: number) {
  const project = projects.find((item) => item.id === projectId)
  const viewerRole = projectRoles.find(
    (role) => role.project_id === projectId && role.name === 'Viewer'
  )
  if (!project || !viewerRole || project.visibility !== 'public') return null

  const member = makeMember(projectId, currentProjectUser, viewerRole, null, 'pending')
  projectMembers.push(member)
  syncProjectState(projectId)
  return member
}

export function updateProjectMemberRole(projectId: number, memberId: number, role: ProjectRole) {
  const member = projectMembers.find(
    (item) => item.project_id === projectId && item.id === memberId
  )
  if (!member) return null

  member.project_role_id = role.id
  member.project_role = toMemberRole(role)
  member.updated_at = new Date()
  syncProjectState(projectId)
  return member
}

export function removeProjectMember(projectId: number, memberId: number) {
  const index = projectMembers.findIndex(
    (member) => member.project_id === projectId && member.id === memberId
  )
  if (index === -1) return false

  projectMembers.splice(index, 1)
  syncProjectState(projectId)
  return true
}

export function updateProjectLogo(projectId: number, logo: string) {
  const project = projects.find((item) => item.id === projectId)
  if (!project) return null

  project.logo = logo
  project.updated_at = new Date()
  return project
}

export function hasProjectMember(projectId: number, email: string) {
  return projectMembers.some(
    (member) => member.project_id === projectId && member.user.email === email.toLowerCase()
  )
}

seedProject(
  'Core API',
  'Main API workspace for contracts, mocks, and release checks.',
  'private',
  currentProjectUser,
  users.slice(1, 35).map(toProjectUser)
)
seedProject(
  'Public SDK',
  'Shared examples and integration tests for external SDK users.',
  'public',
  toProjectUser(users[5]),
  users.slice(6, 40).map(toProjectUser)
)
seedProject(
  'Internal Docs',
  'Documentation review space for project-specific API references.',
  'private',
  toProjectUser(users[10]),
  users.slice(11, 38).map(toProjectUser)
)
seedProject(
  'Mock Lab',
  'Public mock server workspace where the current user is an editor.',
  'public',
  toProjectUser(users[14]),
  [currentProjectUser, ...users.slice(15, 42).map(toProjectUser)]
)

const projectSubjects = [
  'Gateway',
  'Console',
  'Billing',
  'Analytics',
  'Workflow',
  'Mobile',
  'Search',
  'Imports',
  'Reports',
  'Integrations',
  'Sandbox',
  'Observability',
] as const

for (let index = 0; index < 72; index++) {
  const subject = projectSubjects[index % projectSubjects.length]
  const visibility: Project['visibility'] = index % 3 === 0 ? 'private' : 'public'
  const owner = index % 8 === 0 ? currentProjectUser : toProjectUser(users[60 + index])
  const memberStart = 140 + index * 4
  const members = users.slice(memberStart, memberStart + 12).map(toProjectUser)

  seedProject(
    `${subject} ${String(index + 1).padStart(2, '0')}`,
    `${subject} project workspace for API contracts, review flows, and release checks.`,
    visibility,
    owner,
    index % 9 === 0 && owner.id !== currentProjectUser.id
      ? [currentProjectUser, ...members]
      : members
  )
}

const pendingProject = seedProject(
  'Community Recipes',
  'Public examples that already have a pending join request from the current user.',
  'public',
  toProjectUser(users[18]),
  users.slice(19, 45).map(toProjectUser)
)
projectMembers.push(
  makeMember(
    pendingProject.project.id,
    currentProjectUser,
    pendingProject.viewerRole,
    null,
    'pending'
  )
)
syncProjectState(pendingProject.project.id)
syncWorkflowUsedCounts()
