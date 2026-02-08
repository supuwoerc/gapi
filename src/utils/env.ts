/**
 * 获取应用环境变量
 * Get application environment variables
 *
 * @returns {ImportMetaEnv} Vite/Rollup提供的环境变量对象
 * @returns {ImportMetaEnv} Environment variables object provided by Vite/Rollup
 *
 */
export function getAppEnv() {
  return import.meta.env
}
