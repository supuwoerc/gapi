import * as React from 'react'

import { z } from 'zod'

import { useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { User } from '@/schema/user/user'
import { getRoles, updateUser } from '@/service/admin/users'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  useComboboxAnchor,
} from '@/components/ui/combobox'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'

const formSchema = z.object({
  enabled: z.boolean(),
  roles: z.array(z.string()).min(1),
})

type FormValues = z.infer<typeof formSchema>

interface UserEditDialogProps {
  user: User | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UserEditDialog({ user, open, onOpenChange }: UserEditDialogProps) {
  const { t } = useTranslation('feature')
  const queryClient = useQueryClient()
  const anchorRef = useComboboxAnchor()
  const [roleKeyword, setRoleKeyword] = React.useState('')

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      enabled: true,
      roles: [],
    },
  })

  React.useEffect(() => {
    if (user && open) {
      form.reset({
        enabled: user.enabled,
        roles: user.roles.map((r) => r.code),
      })
    }
  }, [user, open, form])

  const { data: rolesData } = useQuery({
    queryKey: ['roles', roleKeyword],
    queryFn: () => getRoles(roleKeyword || undefined),
    enabled: open,
  })

  const roleOptions = React.useMemo(
    () => (rolesData ?? []).map((r) => ({ label: r.name, value: r.code })),
    [rolesData]
  )

  const mutation = useMutation({
    mutationFn: (values: FormValues) => updateUser(user!.id, values),
    onSuccess: () => {
      toast.success(t('users.editDialog.success'))
      onOpenChange(false)
      void queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })

  const onSubmit = (values: FormValues) => {
    mutation.mutate(values)
  }

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('users.editDialog.title')}</DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-3 py-2">
          <Avatar className="size-12">
            <AvatarImage src={user.avatar} alt={user.username} />
            <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-0.5">
            <span className="font-medium">{user.username}</span>
            <span className="text-sm text-muted-foreground">{user.email}</span>
          </div>
        </div>
        <Separator />
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="enabled"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <FormLabel>{t('users.editDialog.enabled')}</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="roles"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('users.editDialog.roles')}</FormLabel>
                  <FormControl>
                    <Combobox
                      multiple
                      value={field.value}
                      onValueChange={(val) => field.onChange(val ?? [])}
                      onInputValueChange={(inputValue) => setRoleKeyword(inputValue)}
                    >
                      <div ref={anchorRef}>
                        <ComboboxInput placeholder={t('users.editDialog.rolesPlaceholder')} />
                      </div>
                      <ComboboxContent anchor={anchorRef}>
                        <ComboboxList>
                          <ComboboxEmpty>{t('users.editDialog.rolesEmpty')}</ComboboxEmpty>
                          {roleOptions.map((role) => (
                            <ComboboxItem key={role.value} value={role.value}>
                              {role.label}
                            </ComboboxItem>
                          ))}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? t('users.editDialog.saving') : t('users.editDialog.save')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
