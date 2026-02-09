import { z } from 'zod'

export const themeModeSchema = z.enum(['dark', 'light', 'system'])

export type ThemeMode = z.infer<typeof themeModeSchema>

export const themeSchema = z.enum([
  'default',
  'cyberpunk',
  'green',
  'kupikod',
  'orange',
  'red',
  'rose',
  'violet',
  'yellow',
  'blue',
])

export type Theme = z.infer<typeof themeSchema>
