import type { TLoginUserStore } from '@/store/login-user'

export interface LoginParams {
  email: string
  password: string
}

export type LoginResponse = NonNullable<TLoginUserStore['loginUser']>
