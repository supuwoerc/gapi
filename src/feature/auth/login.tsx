import { useTranslation } from 'react-i18next'

import { useTheme } from '@/hooks/use-theme'

import { Button } from '@/components/ui/button'

export type LoginProps = {
  d?: number
}

const theme = [
  'default',
  'cyberpunk',
  'green',
  'kupikod',
  'orange',
  'red',
  'rose',
  'violet',
  'yellow',
  'blue',
] as const

const Login: React.FC<LoginProps> = () => {
  const { themeMode, setTheme, setThemeMode } = useTheme()
  const { t, i18n } = useTranslation()
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
  }

  return (
    <>
      <h1>{t('common.welcome')}</h1>
      <button onClick={() => changeLanguage('en')}>en</button>
      <button onClick={() => changeLanguage('zh')}>zh</button>

      <Button onClick={() => setThemeMode(themeMode == 'dark' ? 'light' : 'dark')}>mode</Button>

      {theme.map((item) => {
        return (
          <Button key={item} onClick={() => setTheme(item)}>
            {item}
          </Button>
        )
      })}
    </>
  )
}
export default Login
