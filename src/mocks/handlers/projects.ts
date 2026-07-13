import type {
  ProjectLogoMutation,
  ProjectMemberInvite,
  ProjectMemberRoleMutation,
  ProjectMutation,
  ProjectVisibilityMutation,
  ProjectWorkflowIdsMutation,
} from '@/schema/project/project'
import { projectWorkflowIdsMutationSchema } from '@/schema/project/project'
import { delay, http } from 'msw'

import {
  applyToJoinProject,
  countActiveOwners,
  createProjectWithPresets,
  getOwnerRole,
  getProjectMembers,
  getProjectRole,
  getProjectRoles,
  getProjectWorkflows,
  hasProjectMember,
  inviteProjectMember,
  isCurrentUserOwner,
  projects,
  removeProjectMember,
  updateProjectLogo,
  updateProjectMemberRole,
  updateProjectWorkflows,
} from '../data/projects'
import { paginate } from '../utils/filter'
import { errorEnvelope, jsonEnvelope } from '../utils/response'

const BASE = import.meta.env.VITE_APP_DEFAULT_SERVER

function getProjectId(value: string | readonly string[] | undefined) {
  return Number(Array.isArray(value) ? value[0] : value)
}

export const projectHandlers = [
  http.get(`${BASE}/projects`, async ({ request }) => {
    await delay(200)
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 1)
    const perPage = Number(url.searchParams.get('perPage') ?? 20)
    const keyword = url.searchParams.get('keyword')?.toLowerCase().trim() ?? ''
    const result = keyword
      ? projects.filter(
          (project) =>
            project.name.toLowerCase().includes(keyword) ||
            project.description.toLowerCase().includes(keyword)
        )
      : projects

    return jsonEnvelope(paginate(result, page, perPage))
  }),

  http.post(`${BASE}/projects`, async ({ request }) => {
    await delay(300)
    const body = (await request.json()) as ProjectMutation
    const project = createProjectWithPresets(body)
    return jsonEnvelope(project)
  }),

  http.get(`${BASE}/projects/:projectId/roles`, async ({ params }) => {
    await delay(200)
    const projectId = getProjectId(params.projectId)
    return jsonEnvelope(getProjectRoles(projectId))
  }),

  http.get(`${BASE}/projects/:projectId/workflows`, async ({ params }) => {
    await delay(200)
    const projectId = getProjectId(params.projectId)
    const project = projects.find((item) => item.id === projectId)

    if (!project) {
      return errorEnvelope(400404, 'Project not found')
    }

    return jsonEnvelope(getProjectWorkflows(projectId))
  }),

  http.patch(`${BASE}/projects/:projectId/workflows`, async ({ params, request }) => {
    await delay(300)
    const projectId = getProjectId(params.projectId)
    const body = projectWorkflowIdsMutationSchema.parse(
      (await request.json()) as ProjectWorkflowIdsMutation
    )
    const project = projects.find((item) => item.id === projectId)

    if (!project) {
      return errorEnvelope(400404, 'Project not found')
    }

    if (!isCurrentUserOwner(projectId)) {
      return errorEnvelope(400403, 'Only project owners can update project workflows')
    }

    const updatedWorkflows = updateProjectWorkflows(projectId, body.workflow_ids)
    if (!updatedWorkflows) {
      return errorEnvelope(400404, 'Workflow not found')
    }

    return jsonEnvelope(updatedWorkflows)
  }),

  http.get(`${BASE}/projects/:projectId/members`, async ({ params, request }) => {
    await delay(200)
    const projectId = getProjectId(params.projectId)
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 1)
    const perPage = Number(url.searchParams.get('perPage') ?? 10)

    return jsonEnvelope(paginate(getProjectMembers(projectId), page, perPage))
  }),

  http.post(`${BASE}/projects/:projectId/members`, async ({ params, request }) => {
    await delay(300)
    const projectId = getProjectId(params.projectId)
    const body = (await request.json()) as ProjectMemberInvite

    if (!isCurrentUserOwner(projectId)) {
      return errorEnvelope(400403, 'Only project owners can invite members')
    }

    if (hasProjectMember(projectId, body.email)) {
      return errorEnvelope(400409, 'This user is already a project member')
    }

    const member = inviteProjectMember(projectId, body)
    if (!member) {
      return errorEnvelope(400404, 'Project role not found')
    }

    return jsonEnvelope(member)
  }),

  http.post(`${BASE}/projects/:projectId/join-requests`, async ({ params }) => {
    await delay(300)
    const projectId = getProjectId(params.projectId)
    const project = projects.find((item) => item.id === projectId)

    if (!project) {
      return errorEnvelope(400404, 'Project not found')
    }

    if (project.visibility !== 'public') {
      return errorEnvelope(400403, 'Only public projects accept join requests')
    }

    if (project.current_user_membership) {
      return errorEnvelope(400409, 'You already have a project membership or pending request')
    }

    const member = applyToJoinProject(projectId)
    if (!member) {
      return errorEnvelope(400404, 'Project role not found')
    }

    return jsonEnvelope(member)
  }),

  http.patch(`${BASE}/projects/:projectId/members/:memberId`, async ({ params, request }) => {
    await delay(300)
    const projectId = getProjectId(params.projectId)
    const memberId = Number(params.memberId)
    const body = (await request.json()) as ProjectMemberRoleMutation

    if (!isCurrentUserOwner(projectId)) {
      return errorEnvelope(400403, 'Only project owners can update member roles')
    }

    const role = getProjectRole(projectId, body.project_role_id)
    if (!role) {
      return errorEnvelope(400404, 'Project role not found')
    }

    const current = getProjectMembers(projectId).find((member) => member.id === memberId)
    const ownerRole = getOwnerRole(projectId)
    if (
      current &&
      ownerRole &&
      current.project_role_id === ownerRole.id &&
      role.id !== ownerRole.id &&
      countActiveOwners(projectId) <= 1
    ) {
      return errorEnvelope(400422, 'A project must keep at least one owner')
    }

    const member = updateProjectMemberRole(projectId, memberId, role)
    if (!member) {
      return errorEnvelope(400404, 'Project member not found')
    }

    return jsonEnvelope(member)
  }),

  http.delete(`${BASE}/projects/:projectId/members/:memberId`, async ({ params }) => {
    await delay(300)
    const projectId = getProjectId(params.projectId)
    const memberId = Number(params.memberId)

    if (!isCurrentUserOwner(projectId)) {
      return errorEnvelope(400403, 'Only project owners can remove members')
    }

    const member = getProjectMembers(projectId).find((item) => item.id === memberId)
    const ownerRole = getOwnerRole(projectId)

    if (
      member &&
      ownerRole &&
      member.project_role_id === ownerRole.id &&
      countActiveOwners(projectId) <= 1
    ) {
      return errorEnvelope(400422, 'A project must keep at least one owner')
    }

    removeProjectMember(projectId, memberId)
    return jsonEnvelope(null)
  }),

  http.patch(`${BASE}/projects/:projectId/visibility`, async ({ params, request }) => {
    await delay(300)
    const projectId = getProjectId(params.projectId)
    const body = (await request.json()) as ProjectVisibilityMutation
    const project = projects.find((item) => item.id === projectId)
    if (!project) {
      return errorEnvelope(400404, 'Project not found')
    }

    if (!isCurrentUserOwner(projectId)) {
      return errorEnvelope(400403, 'Only project owners can update visibility')
    }

    project.visibility = body.visibility
    project.updated_at = new Date()
    return jsonEnvelope(project)
  }),

  http.patch(`${BASE}/projects/:projectId/logo`, async ({ params, request }) => {
    await delay(300)
    const projectId = getProjectId(params.projectId)
    const body = (await request.json()) as ProjectLogoMutation
    const project = projects.find((item) => item.id === projectId)
    if (!project) {
      return errorEnvelope(400404, 'Project not found')
    }

    if (!isCurrentUserOwner(projectId)) {
      return errorEnvelope(400403, 'Only project owners can update project logo')
    }

    const updatedProject = updateProjectLogo(projectId, body.logo)
    return jsonEnvelope(updatedProject)
  }),
]
