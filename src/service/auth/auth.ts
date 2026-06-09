import type { LoginUser } from '@/schema/auth/auth'

import { get, post } from '@/lib/http'

export interface LoginParams {
  email: string
  password: string
}

export interface ForgotPasswordParams {
  email: string
}

export interface SignUpParams {
  username: string
  email: string
  password: string
  captcha_token: string
}

export interface VerifyOtpParams {
  otp: string
}

export interface FetchPermissionsParams {
  module: string
}

export interface FetchPermissionsResponse {
  permissions: string[]
}

export interface RefreshTokenResponse {
  token: string
  refresh_token: string
}

export function login(params: LoginParams) {
  return post<LoginUser>('/auth/login', { json: params })
}

export function forgotPassword(params: ForgotPasswordParams) {
  return post<void>('/auth/forgot-password', { json: params })
}

export function verifyOtp(params: VerifyOtpParams) {
  return post<void>('/auth/verify-otp', { json: params })
}

export function signUp(params: SignUpParams) {
  return post<void>('/auth/sign-up', { json: params })
}

export function refreshToken() {
  return post<RefreshTokenResponse>('/auth/refresh')
}

export function fetchPermissions(params: FetchPermissionsParams) {
  return get<FetchPermissionsResponse>('/auth/permissions', {
    searchParams: { module: params.module },
  })
}
