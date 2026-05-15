import { z } from 'zod'

import { type SubmitHandler, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'

import { useMutation } from '@tanstack/react-query'

import { updateNotifications } from '@/service/notifications/notifications'
import { isError } from 'lodash-es'
import { Loader2, Save } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField } from '@/components/ui/form'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from '@/components/ui/item'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'

const notificationKeys = ['taskEmail', 'messageEmail', 'versionUpdate', 'security'] as const

const notificationsFormSchema = z.object({
  taskEmail: z.boolean(),
  messageEmail: z.boolean(),
  versionUpdate: z.boolean(),
  security: z.boolean(),
})

type NotificationsFormValues = z.infer<typeof notificationsFormSchema>

const NotificationsPage = () => {
  const { t } = useTranslation(['feature', 'global'])

  const form = useForm<NotificationsFormValues>({
    resolver: zodResolver(notificationsFormSchema),
    defaultValues: {
      taskEmail: false,
      messageEmail: false,
      versionUpdate: false,
      security: true,
    },
  })

  const mutation = useMutation({ mutationFn: updateNotifications })

  const onSubmit: SubmitHandler<NotificationsFormValues> = async (data) => {
    await toast
      .promise(mutation.mutateAsync(data), {
        loading: t('settings.notifications.form.saving'),
        success: () => t('settings.notifications.form.saveSuccess'),
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
    <div className="w-full space-y-6">
      <div>
        <h3 className="text-lg font-medium">{t('settings.notifications.title')}</h3>
        <p className="text-sm text-muted-foreground">{t('settings.notifications.description')}</p>
      </div>
      <Separator />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-md space-y-6">
          <ItemGroup>
            <div className="flex w-full flex-col space-y-2">
              {notificationKeys.map((key) => (
                <div key={key}>
                  <FormField
                    control={form.control}
                    name={key}
                    render={({ field }) => (
                      <Item variant="outline">
                        <ItemContent>
                          <ItemTitle>{t(`settings.notifications.${key}.title`)}</ItemTitle>
                          <ItemDescription>
                            {t(`settings.notifications.${key}.description`)}
                          </ItemDescription>
                        </ItemContent>
                        <ItemActions>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </ItemActions>
                      </Item>
                    )}
                  />
                </div>
              ))}
            </div>
          </ItemGroup>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : <Save />}
            {t('settings.notifications.form.submit')}
          </Button>
        </form>
      </Form>
    </div>
  )
}

export default NotificationsPage
