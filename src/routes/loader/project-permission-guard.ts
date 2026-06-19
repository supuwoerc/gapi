import { fetchPermissions } from '@/service/auth/auth'

import {
  getProjectModulePermissions,
  setProjectModulePermissions,
  useActiveProjectStore,
} from '@/store/active-project'

import { reactQueryClient } from '@/lib/react-query'

import { requireAuth } from './auth-guard'

export function withProjectPermissions(module: string) {
  return async (args: { request: Request }) => {
    await requireAuth(args)

    const { activeProject } = useActiveProjectStore.getState()
    if (!activeProject) return null

    const cached = getProjectModulePermissions(module)
    if (!cached) {
      const res = await reactQueryClient.ensureQueryData({
        queryKey: ['project-permissions', activeProject.id, module],
        queryFn: () => fetchPermissions({ module, projectId: activeProject.id }),
      })
      setProjectModulePermissions(module, res.permissions)
    }

    return null
  }
}
