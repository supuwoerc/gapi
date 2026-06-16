import {
  projectListSchema,
  projectMemberInviteSchema,
  projectMemberListSchema,
  projectMemberRoleMutationSchema,
  projectMemberSchema,
  projectMutationSchema,
  projectRoleListSchema,
  projectSchema,
  projectVisibilityMutationSchema,
} from '@/schema/project/project'
import type {
  ProjectMemberInvite,
  ProjectMemberRoleMutation,
  ProjectMutation,
  ProjectVisibilityMutation,
} from '@/schema/project/project'

import { del, get, patch, post } from '@/lib/http'

export async function getProjects() {
  const res = await get<unknown>('/projects')
  return projectListSchema.parse(res)
}

export async function createProject(data: ProjectMutation) {
  const payload = projectMutationSchema.parse(data)
  const res = await post<unknown>('/projects', { json: payload })
  return projectSchema.parse(res)
}

export async function getProjectRoles(projectId: number) {
  const res = await get<unknown>(`/projects/${projectId}/roles`)
  return projectRoleListSchema.parse(res)
}

export async function getProjectMembers(projectId: number) {
  const res = await get<unknown>(`/projects/${projectId}/members`)
  return projectMemberListSchema.parse(res)
}

export async function inviteProjectMember(projectId: number, data: ProjectMemberInvite) {
  const payload = projectMemberInviteSchema.parse(data)
  const res = await post<unknown>(`/projects/${projectId}/members`, { json: payload })
  return projectMemberSchema.parse(res)
}

export async function applyToJoinProject(projectId: number) {
  const res = await post<unknown>(`/projects/${projectId}/join-requests`)
  return projectMemberSchema.parse(res)
}

export async function updateProjectMemberRole(
  projectId: number,
  memberId: number,
  data: ProjectMemberRoleMutation
) {
  const payload = projectMemberRoleMutationSchema.parse(data)
  const res = await patch<unknown>(`/projects/${projectId}/members/${memberId}`, { json: payload })
  return projectMemberSchema.parse(res)
}

export async function removeProjectMember(projectId: number, memberId: number) {
  return del<null>(`/projects/${projectId}/members/${memberId}`)
}

export async function updateProjectVisibility(projectId: number, data: ProjectVisibilityMutation) {
  const payload = projectVisibilityMutationSchema.parse(data)
  const res = await patch<unknown>(`/projects/${projectId}/visibility`, { json: payload })
  return projectSchema.parse(res)
}
