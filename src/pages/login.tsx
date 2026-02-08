import { Button } from '@/components/ui/button'
import { useTheme } from '@/hooks/use-theme'

export type LoginProps = {
  d?: number
}

const Login: React.FC<LoginProps> = () => {
  const { theme, setTheme } = useTheme()
  return <Button onClick={() => setTheme(theme == 'dark' ? 'light' : 'dark')}>login</Button>
}
export default Login
