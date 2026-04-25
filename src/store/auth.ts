import type { LoginUser } from '@/schema/user'
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

export type TAuthStore = {
  loginUser: {
    user: LoginUser
    token: string
    refreshToken: string
  } | null
}

const initialAuth: TAuthStore = {
  loginUser: null,
}

const AUTH_STORE_NAME = 'authStore'

export const useAuthStore = create<TAuthStore>()(
  immer(
    devtools(
      persist(() => initialAuth, {
        name: AUTH_STORE_NAME,
        partialize: (state) => ({
          loginUser: state.loginUser,
        }),
      }),
      {
        name: AUTH_STORE_NAME,
      }
    )
  )
)

export const setLoginUser = (loginUser: TAuthStore['loginUser']) => {
  useAuthStore.setState((state) => {
    state.loginUser = loginUser
  })
}
