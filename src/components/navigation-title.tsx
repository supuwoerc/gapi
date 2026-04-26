import { useEffect } from 'react'

import type { CustomRouteObject } from '@/types/route'
import { useTranslation } from 'react-i18next'
import { useMatches, useNavigation } from 'react-router'

import { appEnv } from '@/lib/env'

const NavigationTitle = () => {
  const navigation = useNavigation()
  const { t } = useTranslation('route')
  const matches = useMatches()
  const currentMatch = matches[matches.length - 1] as CustomRouteObject

  useEffect(() => {
    if (navigation.state === 'idle') {
      if (currentMatch.handle?.title) {
        document.title = t(currentMatch.handle?.title as never)
      } else {
        document.title = appEnv.VITE_APP_NAME
      }
    }
  }, [navigation.state, t, currentMatch])

  return null
}

export { NavigationTitle }
