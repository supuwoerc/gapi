import ky, { type Options } from 'ky'

import { afterResponseHook, beforeRequestHook, parseJson } from './interceptors'

/**
 * 主 HTTP 客户端实例
 * Main HTTP client instance
 *
 * - beforeRequest：自动注入 token 和 locale / Auto-injects token and locale
 * - afterResponse：token 过期时自动刷新并重试 / Auto-refreshes and retries on token expiration
 * - parseJson：解包 { code, data, message } 信封，调用方通过 .json<T>() 直接获取业务数据 / Unwraps the { code, data, message } envelope so callers get business data directly via .json<T>()
 * - retry.limit=1：为 token 刷新后的 ky.retry() 预留一次重试机会 / Reserves one retry for ky.retry() after token refresh
 */
const http = ky.create({
  prefix: import.meta.env.VITE_APP_DEFAULT_SERVER,
  retry: { limit: 1, methods: ['get', 'post', 'put', 'patch', 'delete'] },
  hooks: {
    beforeRequest: [beforeRequestHook],
    afterResponse: [afterResponseHook],
  },
  parseJson,
})

export const get = <T>(url: string, options?: Options) => http.get(url, options).json<T>()

export const post = <T>(url: string, options?: Options) => http.post(url, options).json<T>()

export const put = <T>(url: string, options?: Options) => http.put(url, options).json<T>()

export const patch = <T>(url: string, options?: Options) => http.patch(url, options).json<T>()

export const del = <T>(url: string, options?: Options) => http.delete(url, options).json<T>()

export default http
