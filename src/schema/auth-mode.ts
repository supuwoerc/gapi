import { z } from 'zod'

export const authModeSchema = z.enum(['anonymous', 'loginRequired', 'permissionRequired'])

export type AuthMode = z.infer<typeof authModeSchema>
