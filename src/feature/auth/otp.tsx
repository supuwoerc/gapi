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

import OTPForm from './components/otp-form'

const OneTimePassword: React.FC = () => {
  const { t } = useTranslation()
  return (
    <div className="relative flex h-svh w-full items-center justify-center lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg tracking-tight">{t('auth.tfa')}</CardTitle>
          <CardDescription>{t('auth.optTips')}</CardDescription>
        </CardHeader>
        <CardContent className="sm:w-110">
          <OTPForm className="space-y-2" />
        </CardContent>
        <CardFooter>
          <p className="w-full text-center text-sm text-muted-foreground">
            {t('auth.dontHaveRecived')}{' '}
            <Link
              className="underline underline-offset-4 hover:text-primary"
              to={'/forgot-password'}
            >
              {t('auth.resend')}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
export default OneTimePassword
