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

  return (
    <>
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
