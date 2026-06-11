import { z } from 'zod'

import { permissionAssignmentSchema, rolePermissionSchema } from './permission'

const baseRoleSchema = z.object({
  id: z.coerce.number(),
  name: z.string(),
  code: z.string(),
  parent_id: z.coerce.number().nullable(),
  description: z.string(),
  sort_order: z.number(),
  enabled: z.boolean(),
  permissions: z.array(rolePermissionSchema),
  effective_permissions: z.array(rolePermissionSchema).optional(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
})

export type Role = z.infer<typeof baseRoleSchema>
export type RoleTree = Role & { children: RoleTree[] }

export const roleSchema: z.ZodType<Role> = baseRoleSchema

export const roleTreeSchema: z.ZodType<RoleTree> = baseRoleSchema.extend({
  children: z.lazy(() => z.array(roleTreeSchema)),
})

export const roleTreeListSchema = z.array(roleTreeSchema)

export const roleMutationSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  parent_id: z.number().nullable(),
  description: z.string(),
  sort_order: z.number(),
  enabled: z.boolean(),
  permissions: z.array(permissionAssignmentSchema),
})

export type RoleMutation = z.infer<typeof roleMutationSchema>
