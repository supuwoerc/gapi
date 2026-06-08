import ky from 'ky'
import type { AfterResponseHook, BeforeRequestHook } from 'ky'

import { getAuthProvider } from './auth-provider'
import {
  BizCode,
  localeKey,
  refreshTokenKey,
  refreshTokenUrl,
  tokenKey,
  tokenPrefix,
} from './constants'
import { BizRequestError } from './error'

interface ApiResponse<T = unknown> {
  code: number
  data: T
  message: string
}

const refreshClient = ky.create({
  prefix: import.meta.env.VITE_APP_DEFAULT_SERVER,
  retry: 0,
})

let refreshPromise: Promise<{ token: string; refresh_token: string }> | null = null

async function doRefreshToken(): Promise<{ token: string; refresh_token: string }> {
  const auth = getAuthProvider()
  const refreshToken = auth.getRefreshToken()
  if (!refreshToken) {
    throw new Error('No refresh token available')
  }

  const token = auth.getToken()
  const language = auth.getLanguage()

  const result = await refreshClient
    .post(refreshTokenUrl, {
      headers: {
        [tokenKey]: `${tokenPrefix}${token}`,
        [localeKey]: language,
        [refreshTokenKey]: refreshToken,
      },
    })
    .json<ApiResponse<{ token: string; refresh_token: string }>>()

  if (result.code !== BizCode.SUCCESS) {
    throw new BizRequestError(result.code, result.message)
  }

  return result.data
}

function refreshToken(): Promise<{ token: string; refresh_token: string }> {
  if (!refreshPromise) {
    refreshPromise = doRefreshToken().finally(() => {
      refreshPromise = null
    })
  }
  return refreshPromise
}

function handleRefreshFailure() {
  const auth = getAuthProvider()
  auth.onAuthFailed()
  const currentUrl = location.pathname + location.search + location.hash
  window.location.href = `/login?redirect=${encodeURIComponent(currentUrl)}`
}

export const beforeRequestHook: BeforeRequestHook = ({ request }) => {
  const auth = getAuthProvider()
  const token = auth.getToken()
  const language = auth.getLanguage()

  if (token) {
    request.headers.set(tokenKey, `${tokenPrefix}${token}`)
  }
  request.headers.set(localeKey, language)
}

export const afterResponseHook: AfterResponseHook = async ({ request, response, retryCount }) => {
  if (response.status >= 500) {
    window.location.href = '/500'
    return
  }

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
      const auth = getAuthProvider()
      auth.onTokenRefreshed(tokens.token, tokens.refresh_token)

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

export const parseJson = (text: string): unknown => {
  const parsed: ApiResponse = JSON.parse(text)

  if (parsed.code === BizCode.SUCCESS) {
    return parsed.data
  }

  throw new BizRequestError(parsed.code, parsed.message || 'Request failed')
}
