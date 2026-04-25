import { useEffect } from 'react'

import { z } from 'zod'

import { type SubmitHandler, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'

import { useMutation } from '@tanstack/react-query'

import { verifyOtp } from '@/service/auth/auth'
import { isError } from 'lodash-es'
import { Loader2, ShieldEllipsis } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'

import { i18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp'

interface OTPFormProps {
  className?: string
}

const otpFormSchema = z.object({
  otp: z
    .string()
    .min(6, { error: () => i18n.t('feature:otp.otpForm.opt.tip') })
    .max(6, { error: () => i18n.t('feature:otp.otpForm.opt.tip') }),
})

type otpForm = z.infer<typeof otpFormSchema>

const OTPForm: React.FC<OTPFormProps> = ({ className }) => {
  const navigate = useNavigate()

  const { t, i18n } = useTranslation(['feature', 'global'])

  const form = useForm<otpForm>({
    resolver: zodResolver(otpFormSchema),
    defaultValues: {
      otp: '',
    },
  })

  useEffect(() => {
    if (Object.keys(form.formState.errors).length) {
      form.trigger()
    }
  }, [i18n.language, form])

  const verifyOtpMutation = useMutation({
    mutationFn: verifyOtp,
  })

  const submithandle: SubmitHandler<otpForm> = async (data: otpForm) => {
    await toast
      .promise(verifyOtpMutation.mutateAsync(data), {
        loading: t('global:loading'),
        success: () => {
          navigate('/login')
          return t('otp.verifySuccess')
        },
        error: (err) => {
          if (isError(err)) {
            return err.message
          }
          return t('global:error')
        },
      })
      .unwrap()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submithandle)} className={cn('grid gap-3', className)}>
        <FormField
          control={form.control}
          name="otp"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <InputOTP
                  maxLength={6}
                  {...field}
                  containerClassName='justify-between sm:[&>[data-slot="input-otp-group"]>div]:w-12'
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="mt-2" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : <ShieldEllipsis />}
          {t('otp.verify')}
        </Button>
      </form>
    </Form>
  )
}

export default OTPForm
