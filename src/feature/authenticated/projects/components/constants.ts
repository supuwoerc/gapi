import type { Project, ProjectMember, ProjectRole } from '@/schema/project/project'
import type { PaginatedResponse } from '@/types/shared'

export const EmptyProjects: Project[] = []
export const EmptyRoles: ProjectRole[] = []
export const EmptyMembers: ProjectMember[] = []
export const EmptyMembersPage: PaginatedResponse<ProjectMember> = { data: EmptyMembers, total: 0 }
