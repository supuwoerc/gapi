import z from 'zod'

export const languageSchema = z.enum(['zh', 'en'])

export type Language = z.infer<typeof languageSchema>
