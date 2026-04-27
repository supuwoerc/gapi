import type { LoginUser } from '@/schema/login-user'
import { omit } from 'lodash-es'
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

export type TLoginUserStore = {
  loginUser: LoginUser | null
  permissions: Record<string, string[]>
}

const initialAuth: TLoginUserStore = {
  loginUser: null,
  permissions: {},
}

const LOGIN_USER_STORE_NAME = 'loginUserStore'

export const useLoginUserStore = create<TLoginUserStore>()(
  immer(
    devtools(
      persist(() => initialAuth, {
        name: LOGIN_USER_STORE_NAME,
        partialize: (state) => ({
          loginUser: state.loginUser
            ? omit(state.loginUser, ['menuPermissions', 'routePermissions', 'role'])
            : null,
        }),
      }),
      {
        name: LOGIN_USER_STORE_NAME,
      }
    )
  )
)

export const setLoginUser = (loginUser: TLoginUserStore['loginUser']) => {
  useLoginUserStore.setState((state) => {
    state.loginUser = loginUser
  })
}

export const setModulePermissions = (module: string, permissions: string[]) => {
  useLoginUserStore.setState((state) => {
    state.permissions[module] = permissions
  })
}

export const getModulePermissions = (module: string): string[] | undefined => {
  return useLoginUserStore.getState().permissions[module]
}

export const clearLoginUserState = () => {
  useLoginUserStore.setState((state) => {
    state.loginUser = null
    state.permissions = {}
  })
}
