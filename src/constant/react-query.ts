import { type DefaultOptions, MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'

import { isError } from 'lodash-es'
import { toast } from 'sonner'

// https://tkdodo.eu/blog/breaking-react-querys-api-on-purpose#a-bad-api
export const generateQueryConfig = (): DefaultOptions => {
  return {
    queries: {
      throwOnError: false,
      refetchOnWindowFocus: false,
      retry: false,
      networkMode: 'offlineFirst',
    },
    mutations: {
      throwOnError: false,
      retry: false,
      networkMode: 'offlineFirst',
    },
  }
}

export const generateQueryClient = (
  onQueryError: QueryCache['config']['onError'],
  onMutationError: MutationCache['config']['onError']
) => {
  return new QueryClient({
    defaultOptions: generateQueryConfig(),
    queryCache: new QueryCache({
      onError: onQueryError,
    }),
    mutationCache: new MutationCache({
      onError: onMutationError,
    }),
  })
}

const toastErrorMessage = (err: unknown) => {
  if (isError(err)) {
    toast.error(`${err.message}`)
  } else if (err) {
    toast.error(`${err}`)
  }
}

export const reactQueryClient = generateQueryClient(toastErrorMessage, toastErrorMessage)
