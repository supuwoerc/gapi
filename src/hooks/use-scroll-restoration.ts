import { useEffect } from 'react'

import { useLocation } from 'react-router'

const STORAGE_PREFIX = 'scroll_'

export function useScrollRestoration(options?: { includeSearch?: boolean }) {
  const { pathname, search } = useLocation()
  const key = STORAGE_PREFIX + pathname + (options?.includeSearch ? search : '')

  useEffect(() => {
    history.scrollRestoration = 'manual'

    const saved = sessionStorage.getItem(key)
    if (saved) {
      const scrollTop = Number(saved)
      requestAnimationFrame(() => {
        document.documentElement.scrollTop = scrollTop
        document.body.scrollTop = scrollTop
      })
    }

    const onScroll = () => {
      const top = document.body.scrollTop || document.documentElement.scrollTop
      sessionStorage.setItem(key, String(top))
    }

    document.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      document.removeEventListener('scroll', onScroll)
      history.scrollRestoration = 'auto'
    }
  }, [key])
}
