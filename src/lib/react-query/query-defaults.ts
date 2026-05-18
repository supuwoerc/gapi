import type { OmitKeyof, QueryKey, QueryObserverOptions } from '@tanstack/react-query'

import { reactQueryClient } from './client'

type QueryDefaults = Partial<OmitKeyof<QueryObserverOptions, 'queryKey'>>

const queryDefaults: Array<[QueryKey, QueryDefaults]> = [
  [['userProfile'], { staleTime: Infinity, gcTime: Infinity }],
]

queryDefaults.forEach(([key, options]) => {
  reactQueryClient.setQueryDefaults(key, options)
})
