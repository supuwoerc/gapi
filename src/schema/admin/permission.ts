import { z } from 'zod'

export const resourceTypeSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
])

export const permissionActionSchema = z.enum(['create', 'read', 'update', 'delete'])
export const permissionEffectSchema = z.enum(['allow', 'deny'])

export const permissionSchema = z.object({
  id: z.coerce.number(),
  code: z.string(),
  name: z.string(),
  resource_type: resourceTypeSchema,
  module: z.string(),
  resource_path: z.string(),
  action: permissionActionSchema,
  description: z.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
})

export const permissionListSchema = z.array(permissionSchema)

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
export type RolePermission = z.infer<typeof rolePermissionSchema>
export type PermissionAssignment = z.infer<typeof permissionAssignmentSchema>
