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
}

const initialState: TActiveProjectStore = {
  activeProject: null,
}

const STORE_NAME = 'activeProjectStore'

export const useActiveProjectStore = create<TActiveProjectStore>()(
  immer(
    devtools(
      persist(() => initialState, {
        name: STORE_NAME,
      }),
      { name: STORE_NAME }
    )
  )
)

export const setActiveProject = (project: ActiveProject | null) => {
  useActiveProjectStore.setState((state) => {
    state.activeProject = project
  })
}

export const clearActiveProject = () => {
  useActiveProjectStore.setState((state) => {
    state.activeProject = null
  })
}
