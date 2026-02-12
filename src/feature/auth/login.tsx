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
  const { t } = useTranslation()

  return (
    <>
      <h1 className="text-2xl">{t('common.button.backToHome')}</h1>

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
