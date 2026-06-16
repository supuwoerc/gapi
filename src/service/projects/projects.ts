import {
  projectListSchema,
  projectLogoMutationSchema,
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
  ProjectLogoMutation,
  ProjectMemberInvite,
  ProjectMemberRoleMutation,
  ProjectMutation,
  ProjectVisibilityMutation,
} from '@/schema/project/project'
import type { PaginatedResponse } from '@/types/shared'

import { del, get, patch, post } from '@/lib/http'

export interface GetProjectsParams {
  page: number
  perPage: number
  keyword?: string
}

export async function getProjects(params: GetProjectsParams) {
  const searchParams: Record<string, string> = {
    page: String(params.page),
    perPage: String(params.perPage),
  }

  if (params.keyword) searchParams.keyword = params.keyword

  const res = await get<PaginatedResponse<unknown>>('/projects', { searchParams })
  return { data: projectListSchema.parse(res.data), total: res.total }
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

export interface GetProjectMembersParams {
  page: number
  perPage: number
}

export async function getProjectMembers(projectId: number, params: GetProjectMembersParams) {
  const res = await get<PaginatedResponse<unknown>>(`/projects/${projectId}/members`, {
    searchParams: {
      page: String(params.page),
      perPage: String(params.perPage),
    },
  })
  return { data: projectMemberListSchema.parse(res.data), total: res.total }
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

export async function updateProjectLogo(projectId: number, data: ProjectLogoMutation) {
  const payload = projectLogoMutationSchema.parse(data)
  const res = await patch<unknown>(`/projects/${projectId}/logo`, { json: payload })
  return projectSchema.parse(res)
}
