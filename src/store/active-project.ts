import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface ActiveProjectState {
  activeProjectId: number | null
  setActiveProjectId: (id: number | null) => void
}

const STORE_NAME = 'activeProjectStore'

export const useActiveProjectStore = create<ActiveProjectState>()(
  devtools(
    persist(
      (set) => ({
        activeProjectId: null,
        setActiveProjectId: (id) => set({ activeProjectId: id }),
      }),
      { name: STORE_NAME }
    ),
    { name: STORE_NAME }
  )
)
