import z from 'zod'

export const authSchema = z.enum(['anonymous', 'loginRequired', 'permissionRequired'])

export type Auth = z.infer<typeof authSchema>
