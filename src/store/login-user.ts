import type { LoginUser } from '@/schema/user'
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

export type TLoginUserStore = {
  loginUser: {
    user: LoginUser
    token: string
    refreshToken: string
  } | null
}

const initialAuth: TLoginUserStore = {
  loginUser: null,
}

const LOGIN_USER_STORE_NAME = 'loginUserStore'

export const loginUserStore = create<TLoginUserStore>()(
  immer(
    devtools(
      persist(() => initialAuth, {
        name: LOGIN_USER_STORE_NAME,
        partialize: (state) => ({
          loginUser: state.loginUser,
        }),
      }),
      {
        name: LOGIN_USER_STORE_NAME,
      }
    )
  )
)

export const setLoginUser = (loginUser: TLoginUserStore['loginUser']) => {
  loginUserStore.setState((state) => {
    state.loginUser = loginUser
  })
}
