import { get, post } from '@/lib/http'

import type {
  FetchPermissionsParams,
  FetchPermissionsResponse,
  ForgotPasswordParams,
  LoginParams,
  LoginResponse,
  RefreshTokenResponse,
  SignUpParams,
  VerifyOtpParams,
} from './dto/auth'

export function login(params: LoginParams) {
  return post<LoginResponse>('/auth/login', { json: params })
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

export function fetchUserProfile() {
  return get<LoginResponse>('/auth/profile')
}
