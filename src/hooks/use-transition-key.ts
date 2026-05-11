import { useLocation, useMatches } from 'react-router'

export function useTransitionKey() {
  const { pathname } = useLocation()
  const matches = useMatches()

  const parentWithLayout = matches.find((m) => (m.handle as Record<string, unknown>)?.hasLayout)

  return parentWithLayout?.pathname ?? pathname
}
