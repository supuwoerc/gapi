import { useEffect, useRef } from 'react'

import { useNavigation } from 'react-router'
import LoadingBar, { type LoadingBarRef } from 'react-top-loading-bar'

const NavigationProgress = () => {
  const navigation = useNavigation()
  const ref = useRef<LoadingBarRef>(null)

  useEffect(() => {
    if (navigation.state !== 'idle') {
      ref.current?.continuousStart()
    } else {
      ref.current?.complete()
    }
  }, [navigation.state])

  return <LoadingBar color="var(--color-primary)" ref={ref} shadow={true} height={2} />
}

export { NavigationProgress }
