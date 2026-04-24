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

import ForgotPasswordForm from './components/forgot-password-form'

const ForgotPassword: React.FC = () => {
  const { t } = useTranslation(['feature', 'global'])

  return (
    <div className="relative flex h-svh w-full items-center justify-center lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg tracking-tight">{t('forgotPassword.name')}</CardTitle>
          <CardDescription>{t('forgotPassword.tips')}</CardDescription>
        </CardHeader>
        <CardContent className="sm:w-110">
          <ForgotPasswordForm className="space-y-2" />
        </CardContent>
        <CardFooter>
          <p className="w-full text-center text-sm text-muted-foreground">
            {t('forgotPassword.dontHaveAccount')}{' '}
            <Link className="underline underline-offset-4 hover:text-primary" to={'/sign-up'}>
              {t('global:menu.signUp')}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
export default ForgotPassword
