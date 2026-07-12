import * as React from 'react'

import { useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'

import type { ProjectMemberInvite, ProjectRole } from '@/schema/project/project'
import { projectMemberInviteSchema } from '@/schema/project/project'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface InviteMemberDialogProps {
  open: boolean
  roles: ProjectRole[]
  isPending: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: ProjectMemberInvite) => void
}

export function InviteMemberDialog({
  open,
  roles,
  isPending,
  onOpenChange,
  onSubmit,
}: InviteMemberDialogProps) {
  const { t, i18n } = useTranslation('projects')
  const defaultRoleId = roles.find((role) => role.name === 'Editor')?.id ?? roles[0]?.id ?? 0
  const form = useForm<ProjectMemberInvite>({
    resolver: zodResolver(projectMemberInviteSchema),
    defaultValues: {
      username: '',
      email: '',
      project_role_id: defaultRoleId,
    },
  })

  React.useEffect(() => {
    if (open) {
      form.reset({ username: '', email: '', project_role_id: defaultRoleId })
    }
  }, [defaultRoleId, form, open])

  React.useEffect(() => {
    if (Object.keys(form.formState.errors).length) {
      void form.trigger()
    }
  }, [i18n.language, form])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('inviteDialog.title')}</DialogTitle>
          <DialogDescription>{t('inviteDialog.description')}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('inviteDialog.username')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('inviteDialog.usernamePlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('inviteDialog.email')}</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder={t('inviteDialog.emailPlaceholder')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="project_role_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('inviteDialog.role')}</FormLabel>
                  <Select
                    value={String(field.value)}
                    onValueChange={(value) => field.onChange(Number(value))}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={String(role.id)}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isPending || roles.length === 0}>
                {isPending ? t('inviteDialog.saving') : t('inviteDialog.save')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
