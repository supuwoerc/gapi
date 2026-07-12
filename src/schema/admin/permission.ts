import { z } from 'zod'

import { i18n } from '@/lib/i18n'

export const resourceTypeSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
])

export const permissionActionSchema = z.enum(['create', 'read', 'update', 'delete'])
export const permissionEffectSchema = z.enum(['allow', 'deny'])

const permissionResponseResourceTypeSchema = z.preprocess(
  (value) => (typeof value === 'string' ? Number(value) : value),
  resourceTypeSchema
)

const permissionResponseActionSchema = z.preprocess(
  (value) => (typeof value === 'string' ? value.toLowerCase() : value),
  permissionActionSchema
)

export const permissionSchema = z.object({
  id: z.coerce.number(),
  code: z.string(),
  name: z.string(),
  resource_type: permissionResponseResourceTypeSchema,
  module: z.string(),
  resource_path: z.string(),
  action: permissionResponseActionSchema,
  description: z.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
})

export const permissionRoleOptionSchema = z.object({
  id: z.coerce.number(),
  code: z.string(),
  name: z.string(),
})

export const permissionAssignedRoleSchema = z.object({
  id: z.coerce.number(),
  code: z.string().optional(),
  name: z.string().optional(),
  effect: permissionEffectSchema,
})

export const permissionRoleAssignmentSchema = z.object({
  role_id: z.number(),
  effect: permissionEffectSchema,
})

export const permissionDetailSchema = permissionSchema.extend({
  roles: z.array(permissionAssignedRoleSchema).default([]),
})

export const permissionMutationSchema = z.object({
  code: z.string().min(1, {
    error: () => i18n.t('permissions:editDialog.validation.codeRequired'),
  }),
  name: z.string().min(1, {
    error: () => i18n.t('permissions:editDialog.validation.nameRequired'),
  }),
  resource_type: resourceTypeSchema,
  module: z.string().min(1, {
    error: () => i18n.t('permissions:editDialog.validation.moduleRequired'),
  }),
  resource_path: z.string().min(1, {
    error: () => i18n.t('permissions:editDialog.validation.resourcePathRequired'),
  }),
  action: permissionActionSchema,
  description: z.string(),
  roles: z.array(permissionRoleAssignmentSchema),
})

export const permissionListSchema = z.array(permissionSchema)
export const permissionRoleOptionListSchema = z.array(permissionRoleOptionSchema)

export const rolePermissionSchema = permissionSchema.extend({
  effect: permissionEffectSchema,
})

export const permissionAssignmentSchema = z.object({
  permission_id: z.number(),
  effect: permissionEffectSchema,
})

export type ResourceType = z.infer<typeof resourceTypeSchema>
export type PermissionAction = z.infer<typeof permissionActionSchema>
export type PermissionEffect = z.infer<typeof permissionEffectSchema>
export type Permission = z.infer<typeof permissionSchema>
export type PermissionRoleOption = z.infer<typeof permissionRoleOptionSchema>
export type PermissionAssignedRole = z.infer<typeof permissionAssignedRoleSchema>
export type PermissionRoleAssignment = z.infer<typeof permissionRoleAssignmentSchema>
export type PermissionDetail = z.infer<typeof permissionDetailSchema>
export type PermissionMutation = z.infer<typeof permissionMutationSchema>
export type RolePermission = z.infer<typeof rolePermissionSchema>
export type PermissionAssignment = z.infer<typeof permissionAssignmentSchema>
