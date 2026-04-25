import { fetchPermissions } from '@/service/auth/auth'

import { getModulePermissions, setModulePermissions } from '@/store/login-user'

import { reactQueryClient } from '@/lib/react-query'

import { requireAuth } from './auth-guard'

export function withPermissions(module: string, auth = true) {
  return async (args: { request: Request }) => {
    if (auth) {
      await requireAuth(args)
    }

    const cached = getModulePermissions(module)
    if (!cached) {
      const res = await reactQueryClient.ensureQueryData({
        queryKey: ['permissions', module],
        queryFn: () => fetchPermissions({ module }),
      })
      setModulePermissions(module, res.permissions)
    }

    return null
  }
}
