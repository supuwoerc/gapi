import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import SignUpForm from './components/sign-up-form'

const SignUp: React.FC = () => {
  const { t } = useTranslation(['feature', 'global'])

  return (
    <div className="relative flex h-svh w-full items-center justify-center lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg tracking-tight">{t('signUp.name')}</CardTitle>
          <CardDescription>{t('signUp.tips')}</CardDescription>
        </CardHeader>
        <CardContent className="sm:w-110">
          <SignUpForm className="space-y-2" />
        </CardContent>
        <CardFooter>
          <p className="w-full text-center text-sm text-muted-foreground">
            {t('signUp.alreadyHaveAccount')}{' '}
            <Link className="underline underline-offset-4 hover:text-primary" to={'/login'}>
              {t('login.button.login')}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
export default SignUp
