/**
 * 请求头中 token 的键名
 * Header key for the authentication token
 */
export const tokenKey = 'X-Token'

/**
 * token 值的前缀
 * Prefix prepended to the token value
 */
export const tokenPrefix = 'Bearer '

/**
 * 请求头中语言标识的键名
 * Header key for the locale identifier
 */
export const localeKey = 'X-Locale'

/**
 * 请求头中 refreshToken 的键名
 * Header key for the refresh token
 */
export const refreshTokenKey = 'X-Refresh-Token'

/**
 * 刷新 token 的接口路径
 * API endpoint path for token refresh
 */
export const refreshTokenUrl = 'auth/refresh'

/**
 * 后端业务状态码
 * Backend business status codes
 */
export const BizCode = {
  /**
   * 请求成功
   * Request succeeded
   */
  SUCCESS: 100000,
  /**
   * token 已过期，需刷新
   * Token expired, refresh required
   */
  TOKEN_EXPIRED: 100001,
} as const
