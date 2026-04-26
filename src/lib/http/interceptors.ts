import ky from 'ky'
import type { AfterResponseHook, BeforeRequestHook } from 'ky'

import { clearLoginUserState, setLoginUser, useLoginUserStore } from '@/store/login-user'
import { useSystemConfigStore } from '@/store/system-config'

import {
  BizCode,
  localeKey,
  refreshTokenKey,
  refreshTokenUrl,
  tokenKey,
  tokenPrefix,
} from './constants'
import { BizRequestError } from './error'

/** 后端统一响应结构 */
interface ApiResponse<T = unknown> {
  code: number
  data: T
  message: string
}

/** 独立的 ky 实例，专用于 refresh 请求，不挂载自定义 hooks 以避免循环触发 */
const refreshClient = ky.create({
  prefix: import.meta.env.VITE_APP_DEFAULT_SERVER,
  retry: 0,
})

/** 并发刷新锁：多个请求同时遇到 token 过期时，共享同一个 refresh Promise */
let refreshPromise: Promise<{ token: string; refreshToken: string }> | null = null

/** 执行 token 刷新请求 */
async function doRefreshToken(): Promise<{ token: string; refreshToken: string }> {
  const { loginUser } = useLoginUserStore.getState()
  if (!loginUser?.refreshToken) {
    throw new Error('No refresh token available')
  }

  const { language } = useSystemConfigStore.getState()

  const result = await refreshClient
    .post(refreshTokenUrl, {
      headers: {
        [tokenKey]: `${tokenPrefix}${loginUser.token}`,
        [localeKey]: language,
        [refreshTokenKey]: loginUser.refreshToken,
      },
    })
    .json<ApiResponse<{ token: string; refreshToken: string }>>()

  if (result.code !== BizCode.SUCCESS) {
    throw new BizRequestError(result.code, result.message)
  }

  return result.data
}

/** 获取或复用正在进行的 refresh Promise，确保并发场景下只发起一次刷新 */
function refreshToken(): Promise<{ token: string; refreshToken: string }> {
  if (!refreshPromise) {
    refreshPromise = doRefreshToken().finally(() => {
      refreshPromise = null
    })
  }
  return refreshPromise
}

/** 刷新失败时清除登录态并跳转登录页 */
function handleRefreshFailure() {
  clearLoginUserState()
  const currentUrl = location.pathname + location.search + location.hash
  window.location.href = `/login?redirect=${encodeURIComponent(currentUrl)}`
}

/** 请求拦截：从 store 读取 token 和 locale 注入请求头 */
export const beforeRequestHook: BeforeRequestHook = ({ request }) => {
  const { loginUser } = useLoginUserStore.getState()
  const { language } = useSystemConfigStore.getState()

  if (loginUser?.token) {
    request.headers.set(tokenKey, `${tokenPrefix}${loginUser.token}`)
  }
  request.headers.set(localeKey, language)
}

/**
 * 响应拦截：检测 token 过期（code=100001）时自动刷新并通过 ky.retry() 重试原请求。
 * 仅在首次请求（retryCount===0）时触发刷新，避免无限循环。
 */
export const afterResponseHook: AfterResponseHook = async ({ request, response, retryCount }) => {
  if (retryCount > 0) return

  let body: ApiResponse
  try {
    const text = await response.text()
    body = JSON.parse(text)
  } catch {
    return
  }

  if (body.code === BizCode.TOKEN_EXPIRED) {
    try {
      const tokens = await refreshToken()
      const { loginUser } = useLoginUserStore.getState()
      if (loginUser) {
        setLoginUser({ ...loginUser, token: tokens.token, refreshToken: tokens.refreshToken })
      }

      const headers = new Headers(request.headers)
      headers.set(tokenKey, `${tokenPrefix}${tokens.token}`)

      return ky.retry({
        request: new Request(request, { headers }),
      })
    } catch {
      handleRefreshFailure()
      throw new BizRequestError(BizCode.TOKEN_EXPIRED, body.message)
    }
  }
}

/**
 * 自定义 JSON 解析：解包后端 { code, data, message } 信封。
 * code=100000 时返回 data，其他情况抛出 BizRequestError。
 */
export const parseJson = (text: string): unknown => {
  const parsed: ApiResponse = JSON.parse(text)

  if (parsed.code === BizCode.SUCCESS) {
    return parsed.data
  }

  throw new BizRequestError(parsed.code, parsed.message || 'Request failed')
}
