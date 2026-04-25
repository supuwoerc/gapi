import type { TLoginUserStore } from '@/store/login-user'

export interface LoginParams {
  email: string
  password: string
}

export type LoginResponse = NonNullable<TLoginUserStore['loginUser']>

export interface ForgotPasswordParams {
  email: string
}

export interface SignUpParams {
  username: string
  email: string
  password: string
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
