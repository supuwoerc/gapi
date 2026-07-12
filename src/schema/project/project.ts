import { z } from 'zod'

import { i18n } from '@/lib/i18n'

export const projectVisibilitySchema = z.enum(['public', 'private'])
export const projectMemberStatusSchema = z.enum(['active', 'pending'])
export const projectPermissionEffectSchema = z.enum(['allow', 'deny'])

const timestampSchema = z.coerce.date()

export const projectRoleSchema = z.object({
  id: z.coerce.number(),
  project_id: z.coerce.number(),
  name: z.string(),
  description: z.string(),
  is_preset: z.boolean(),
  parent_id: z.coerce.number().nullable(),
  created_at: timestampSchema,
  updated_at: timestampSchema,
})

export const projectRolePermissionSchema = z.object({
  id: z.coerce.number(),
  project_role_id: z.coerce.number(),
  module: z.string(),
  action: z.string(),
  effect: projectPermissionEffectSchema,
  created_at: timestampSchema,
  updated_at: timestampSchema,
})

export const projectMemberUserSchema = z.object({
  id: z.coerce.number(),
  username: z.string(),
  email: z.string(),
  avatar: z.string(),
})

export const projectMemberRoleSchema = projectRoleSchema.pick({
  id: true,
  name: true,
  is_preset: true,
})

const currentUserProjectMembershipSchema = z.object({
  status: projectMemberStatusSchema,
  project_role: projectMemberRoleSchema,
})

export const projectSchema = z.object({
  id: z.coerce.number(),
  name: z.string(),
  description: z.string(),
  logo: z.string(),
  visibility: projectVisibilitySchema,
  member_count: z.number(),
  owner_user_id: z.coerce.number(),
  current_user_membership: currentUserProjectMembershipSchema.nullable(),
  created_at: timestampSchema,
  updated_at: timestampSchema,
})

export const projectMemberSchema = z.object({
  id: z.coerce.number(),
  project_id: z.coerce.number(),
  user: projectMemberUserSchema,
  project_role_id: z.coerce.number(),
  project_role: projectMemberRoleSchema,
  status: projectMemberStatusSchema,
  joined_at: timestampSchema.nullable(),
  invited_by: projectMemberUserSchema.pick({ id: true, username: true, email: true }).nullable(),
  created_at: timestampSchema,
  updated_at: timestampSchema,
})

export const projectMutationSchema = z.object({
  name: z.string().min(1, {
    error: () => i18n.t('projects:createDialog.validation.nameRequired'),
  }),
  description: z.string(),
  logo: z.string(),
  visibility: projectVisibilitySchema,
})

export const projectMemberInviteSchema = z.object({
  username: z.string().min(1, {
    error: () => i18n.t('projects:inviteDialog.validation.usernameRequired'),
  }),
  email: z.string().email({
    error: () => i18n.t('projects:inviteDialog.validation.emailInvalid'),
  }),
  project_role_id: z.number(),
})

export const projectMemberRoleMutationSchema = z.object({
  project_role_id: z.number(),
})

export const projectVisibilityMutationSchema = z.object({
  visibility: projectVisibilitySchema,
})

export const projectLogoMutationSchema = z.object({
  logo: z.string(),
})

export const projectListSchema = z.array(projectSchema)
export const projectRoleListSchema = z.array(projectRoleSchema)
export const projectMemberListSchema = z.array(projectMemberSchema)
export const projectRolePermissionListSchema = z.array(projectRolePermissionSchema)

export type Project = z.infer<typeof projectSchema>
export type ProjectVisibility = z.infer<typeof projectVisibilitySchema>
export type ProjectMemberStatus = z.infer<typeof projectMemberStatusSchema>
export type ProjectRole = z.infer<typeof projectRoleSchema>
export type ProjectRolePermission = z.infer<typeof projectRolePermissionSchema>
export type ProjectMember = z.infer<typeof projectMemberSchema>
export type ProjectMemberUser = z.infer<typeof projectMemberUserSchema>
export type ProjectMutation = z.infer<typeof projectMutationSchema>
export type ProjectMemberInvite = z.infer<typeof projectMemberInviteSchema>
export type ProjectMemberRoleMutation = z.infer<typeof projectMemberRoleMutationSchema>
export type ProjectVisibilityMutation = z.infer<typeof projectVisibilityMutationSchema>
export type ProjectLogoMutation = z.infer<typeof projectLogoMutationSchema>
