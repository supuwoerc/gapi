import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

export interface ActiveProject {
  id: number
  name: string
  logo: string
  description: string
}

export type TActiveProjectStore = {
  activeProject: ActiveProject | null
  projectPermissions: Record<string, string[]>
}

const initialState: TActiveProjectStore = {
  activeProject: null,
  projectPermissions: {},
}

const STORE_NAME = 'activeProjectStore'

export const useActiveProjectStore = create<TActiveProjectStore>()(
  immer(
    devtools(
      persist(() => initialState, {
        name: STORE_NAME,
        partialize: (state) => ({ activeProject: state.activeProject }),
      }),
      { name: STORE_NAME }
    )
  )
)

export const setActiveProject = (project: ActiveProject | null) => {
  useActiveProjectStore.setState((state) => {
    const prevId = state.activeProject?.id
    state.activeProject = project
    if (project?.id !== prevId) {
      state.projectPermissions = {}
    }
  })
}

export const setProjectModulePermissions = (module: string, permissions: string[]) => {
  useActiveProjectStore.setState((state) => {
    state.projectPermissions[module] = permissions
  })
}

export const getProjectModulePermissions = (module: string): string[] | undefined => {
  return useActiveProjectStore.getState().projectPermissions[module]
}

export const clearActiveProject = () => {
  useActiveProjectStore.setState((state) => {
    state.activeProject = null
    state.projectPermissions = {}
  })
}
