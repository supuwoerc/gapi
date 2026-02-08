import { getAppEnv } from '@/utils/env'

export const appEnv = getAppEnv()

export const isDevEnv = appEnv.VITE_APP_ENV === 'dev'
