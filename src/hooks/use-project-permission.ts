import { useActiveProjectStore } from '@/store/active-project'
import { useLoginUserStore } from '@/store/login-user'

const ALL_ACTIONS = ['create', 'read', 'update', 'delete']

export function useProjectPermission(permission: string): boolean {
  const role = useLoginUserStore((s) => s.loginUser?.role)
  const activeProject = useActiveProjectStore((s) => s.activeProject)
  const projectPermissions = useActiveProjectStore((s) => s.projectPermissions)

  if (role?.includes('admin')) return true
  if (!activeProject) return false

  const [module] = permission.split(':')
  const modulePerms = projectPermissions[module]
  if (!modulePerms) return false

  return modulePerms.includes(permission)
}

export function useProjectPermissions(module: string): string[] {
  const role = useLoginUserStore((s) => s.loginUser?.role)
  const activeProject = useActiveProjectStore((s) => s.activeProject)
  const projectPermissions = useActiveProjectStore((s) => s.projectPermissions)

  if (role?.includes('admin')) {
    return ALL_ACTIONS.map((a) => `${module}:${a}`)
  }
  if (!activeProject) return []

  return projectPermissions[module] ?? []
}
