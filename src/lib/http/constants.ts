/** 请求头中 token 的键名 */
export const tokenKey = 'X-Token'
/** token 值的前缀 */
export const tokenPrefix = 'Bearer '
/** 请求头中语言标识的键名 */
export const localeKey = 'X-Locale'
/** 请求头中 refreshToken 的键名 */
export const refreshTokenKey = 'X-Refresh-Token'

/** 刷新 token 的接口路径 */
export const refreshTokenUrl = 'auth/refresh'

/** 后端业务状态码 */
export const BizCode = {
  /** 请求成功 */
  SUCCESS: 100000,
  /** token 已过期，需刷新 */
  TOKEN_EXPIRED: 100001,
} as const
