import { useEffect } from 'react'

import nprogress from 'nprogress'
import 'nprogress/nprogress.css'
import { useNavigation } from 'react-router'

nprogress.configure({
  showSpinner: false,
  easing: 'ease',
  speed: 500,
})

const NavigationProgress = () => {
  const navigation = useNavigation()

  // TODO:custom css
  useEffect(() => {
    if (navigation.state !== 'idle') {
      nprogress.start()
    } else {
      nprogress.done()
    }
  }, [navigation.state])

  return null
}

export { NavigationProgress }
