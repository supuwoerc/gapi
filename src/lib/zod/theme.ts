import z from 'zod'

export const theme = z.enum(['dark', 'light', 'system'])

export type Theme = z.infer<typeof theme>
