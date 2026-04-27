/**
 * 获取应用环境变量
 * Get application environment variables
 *
 * @returns Vite/Rollup 提供的环境变量对象 / Environment variables object provided by Vite/Rollup
 */
export function getAppEnv() {
  return import.meta.env
}

export const appEnv = getAppEnv()

export const isDevEnv = appEnv.VITE_APP_ENV === 'dev'
