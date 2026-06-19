import { z } from 'zod'

export const documentVisibilitySchema = z.enum(['public', 'private', 'project'])

export const documentOwnerSchema = z.object({
  id: z.coerce.number(),
  username: z.string(),
  avatar: z.string(),
})

export const documentProjectSchema = z.object({
  id: z.coerce.number(),
  name: z.string(),
  logo: z.string(),
})

export const documentSchema = z.object({
  id: z.coerce.number(),
  title: z.string(),
  description: z.string(),
  visibility: documentVisibilitySchema,
  project: documentProjectSchema,
  owner: documentOwnerSchema,
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
})

export const documentListSchema = z.array(documentSchema)

export const documentDetailSchema = documentSchema.extend({
  content: z.string(),
})

export type DocumentVisibility = z.infer<typeof documentVisibilitySchema>
export type DocumentOwner = z.infer<typeof documentOwnerSchema>
export type DocumentProject = z.infer<typeof documentProjectSchema>
export type Document = z.infer<typeof documentSchema>
export type DocumentDetail = z.infer<typeof documentDetailSchema>
