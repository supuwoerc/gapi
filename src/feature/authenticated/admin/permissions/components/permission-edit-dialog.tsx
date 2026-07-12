import * as React from 'react'

import { useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type {
  PermissionAction,
  PermissionAssignedRole,
  PermissionEffect,
  PermissionMutation,
  PermissionRoleOption,
  ResourceType,
} from '@/schema/admin/permission'
import { permissionMutationSchema } from '@/schema/admin/permission'
import {
  createPermission,
  getPermissionDetail,
  getRoleOptions,
  updatePermission,
} from '@/service/admin/permissions'
import { useTranslation } from 'react-i18next'
import { useDebounce } from 'react-use'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'

import { Badge } from '@/components/ui/badge'
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
import { Spinner } from '@/components/ui/spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

const PERMISSION_ACTIONS: PermissionAction[] = ['create', 'read', 'update', 'delete']
const RESOURCE_TYPES: ResourceType[] = [1, 2, 3, 4, 5]
const EmptyAssignedRoles: PermissionAssignedRole[] = []

const DefaultPermissionValues: PermissionMutation = {
  code: '',
  name: '',
  resource_type: 3,
  module: '',
  resource_path: '',
  action: 'read',
  description: '',
  roles: [],
}

function getDefaultPermissionValues(): PermissionMutation {
  return { ...DefaultPermissionValues, roles: [] }
}

interface PermissionEditDialogProps {
  permissionId: number | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function toPermissionMutation(
  permission: Awaited<ReturnType<typeof getPermissionDetail>> | null | undefined
): PermissionMutation {
  if (!permission) return getDefaultPermissionValues()

  return {
    code: permission.code,
    name: permission.name,
    resource_type: permission.resource_type,
    module: permission.module,
    resource_path: permission.resource_path,
    action: permission.action,
    description: permission.description,
    roles: permission.roles.map((role) => ({
      role_id: role.id,
      effect: role.effect,
    })),
  }
}

function setRoleEffect(
  assignments: PermissionMutation['roles'],
  roleId: number,
  effect: PermissionEffect | undefined
) {
  if (!effect) return assignments.filter((assignment) => assignment.role_id !== roleId)

  if (assignments.some((assignment) => assignment.role_id === roleId)) {
    return assignments.map((assignment) =>
      assignment.role_id === roleId ? { ...assignment, effect } : assignment
    )
  }

  return [...assignments, { role_id: roleId, effect }]
}

interface PermissionRolePickerProps {
  assignments: PermissionMutation['roles']
  initialRoles: PermissionAssignedRole[]
  onChange: (roles: PermissionMutation['roles']) => void
}

function PermissionRolePicker({ assignments, initialRoles, onChange }: PermissionRolePickerProps) {
  const { t } = useTranslation('permissions')
  const [roleKeyword, setRoleKeyword] = React.useState('')
  const [debouncedKeyword, setDebouncedKeyword] = React.useState('')
  const [cachedRoles, setCachedRoles] = React.useState<Map<number, PermissionRoleOption>>(
    () => new Map()
  )

  useDebounce(() => setDebouncedKeyword(roleKeyword.trim()), 300, [roleKeyword])

  const initialRoleOptions = React.useMemo(
    () =>
      initialRoles.map((role) => ({
        id: role.id,
        code: role.code ?? `#${role.id}`,
        name: role.name ?? t('editDialog.roleUnknown', { id: role.id }),
      })),
    [initialRoles, t]
  )

  const { data: roleOptions = [], isFetching } = useQuery({
    queryKey: ['roles', 'permission-options', debouncedKeyword],
    queryFn: () => getRoleOptions(debouncedKeyword || undefined),
  })

  const assignmentEffectByRoleId = React.useMemo(
    () => new Map(assignments.map((assignment) => [assignment.role_id, assignment.effect])),
    [assignments]
  )

  const displayedRoles = React.useMemo(() => {
    const result = new Map<number, PermissionRoleOption>()
    const roleById = new Map<number, PermissionRoleOption>()

    initialRoleOptions.forEach((role) => roleById.set(role.id, role))
    roleOptions.forEach((role) => roleById.set(role.id, role))
    cachedRoles.forEach((role) => roleById.set(role.id, role))

    assignments.forEach((assignment) => {
      const cached = roleById.get(assignment.role_id)
      result.set(
        assignment.role_id,
        cached ?? {
          id: assignment.role_id,
          code: `#${assignment.role_id}`,
          name: t('editDialog.roleUnknown', { id: assignment.role_id }),
        }
      )
    })

    roleOptions.forEach((role) => {
      if (!result.has(role.id)) result.set(role.id, role)
    })

    return Array.from(result.values())
  }, [assignments, cachedRoles, initialRoleOptions, roleOptions, t])

  const handleEffectChange = React.useCallback(
    (role: PermissionRoleOption, value: string) => {
      const nextEffect = value === 'allow' || value === 'deny' ? value : undefined
      if (nextEffect) {
        setCachedRoles((current) => {
          const cached = current.get(role.id)
          if (cached && cached.code === role.code && cached.name === role.name) return current

          const next = new Map(current)
          next.set(role.id, role)
          return next
        })
      }
      onChange(setRoleEffect(assignments, role.id, nextEffect))
    },
    [assignments, onChange]
  )

  return (
    <div className="flex min-h-0 flex-col gap-3 px-1">
      <Input
        value={roleKeyword}
        onChange={(event) => setRoleKeyword(event.target.value)}
        placeholder={t('editDialog.roleSearchPlaceholder')}
      />

      <div className="text-xs text-muted-foreground">
        {isFetching
          ? t('editDialog.rolesRefreshing')
          : t('editDialog.roleResultCount', { count: displayedRoles.length })}
      </div>

      <div className="h-[420px] max-h-[calc(100dvh-22rem)] min-h-64 overflow-hidden rounded-md border">
        {isFetching && displayedRoles.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <Spinner />
          </div>
        ) : displayedRoles.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            {t('editDialog.rolesEmpty')}
          </div>
        ) : (
          <div className="h-full overflow-y-auto">
            {displayedRoles.map((role, index) => (
              <PermissionRoleRow
                key={role.id}
                effect={assignmentEffectByRoleId.get(role.id)}
                isLast={index === displayedRoles.length - 1}
                role={role}
                onEffectChange={handleEffectChange}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

interface PermissionRoleRowProps {
  effect: PermissionEffect | undefined
  isLast: boolean
  role: PermissionRoleOption
  onEffectChange: (role: PermissionRoleOption, value: string) => void
}

function PermissionRoleRow({ effect, isLast, role, onEffectChange }: PermissionRoleRowProps) {
  const { t } = useTranslation('permissions')

  return (
    <div
      className={cn(
        'flex flex-col gap-2 px-3 py-2.5 text-sm sm:flex-row sm:items-start sm:gap-3',
        !isLast && 'border-b',
        effect === 'allow' && 'bg-primary/5',
        effect === 'deny' && 'bg-destructive/10'
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          <span className="truncate font-medium">{role.name}</span>
          {effect ? (
            <Badge
              variant={effect === 'deny' ? 'outline' : 'secondary'}
              className={cn(
                'text-xs',
                effect === 'deny'
                  ? 'border-destructive/40 text-destructive'
                  : 'border-primary/40 text-primary'
              )}
            >
              {t(`roleEffect.${effect}`)}
            </Badge>
          ) : null}
        </div>
        <span className="text-xs break-all text-muted-foreground">{role.code}</span>
      </div>

      <ToggleGroup
        type="single"
        value={effect ?? 'unset'}
        onValueChange={(value) => onEffectChange(role, value)}
        variant="outline"
        size="sm"
        className="shrink-0 flex-wrap justify-end self-end sm:self-start"
      >
        <ToggleGroupItem value="unset">{t('roleEffect.unset')}</ToggleGroupItem>
        <ToggleGroupItem value="allow">{t('roleEffect.allow')}</ToggleGroupItem>
        <ToggleGroupItem value="deny">{t('roleEffect.deny')}</ToggleGroupItem>
      </ToggleGroup>
    </div>
  )
}

export function PermissionEditDialog({
  permissionId,
  open,
  onOpenChange,
}: PermissionEditDialogProps) {
  const { t, i18n } = useTranslation('permissions')
  const queryClient = useQueryClient()
  const isEditing = permissionId !== null

  const form = useForm<PermissionMutation>({
    resolver: zodResolver(permissionMutationSchema),
    defaultValues: DefaultPermissionValues,
  })

  React.useEffect(() => {
    if (Object.keys(form.formState.errors).length) {
      void form.trigger()
    }
  }, [i18n.language, form])

  React.useEffect(() => {
    if (!open) return
    form.reset(toPermissionMutation(null))
  }, [form, open, permissionId])

  const { data: permissionDetail } = useQuery({
    queryKey: ['permission', permissionId],
    queryFn: () => getPermissionDetail(permissionId!),
    enabled: open && isEditing,
  })

  React.useEffect(() => {
    if (!open || !permissionDetail) return
    form.reset(toPermissionMutation(permissionDetail))
  }, [form, open, permissionDetail])

  const mutation = useMutation({
    mutationFn: (values: PermissionMutation) =>
      permissionId === null ? createPermission(values) : updatePermission(permissionId, values),
    onSuccess: () => {
      toast.success(isEditing ? t('editDialog.updateSuccess') : t('editDialog.createSuccess'))
      onOpenChange(false)
      void queryClient.invalidateQueries({ queryKey: ['permissions'] })
      if (permissionId !== null) {
        void queryClient.invalidateQueries({ queryKey: ['permission', permissionId] })
      }
    },
  })

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen)
  }

  const onSubmit = (values: PermissionMutation) => {
    mutation.mutate(values)
  }

  const isPermissionDetailLoading = isEditing && !permissionDetail

  return (
    <Dialog open={open} onOpenChange={handleOpenChange} modal={false}>
      <DialogContent
        className="flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden sm:max-w-4xl"
        onInteractOutside={(event) => event.preventDefault()}
      >
        <DialogHeader className="shrink-0 pr-8">
          <DialogTitle>
            {isEditing ? t('editDialog.editTitle') : t('editDialog.createTitle')}
          </DialogTitle>
          <DialogDescription className="sr-only">{t('description')}</DialogDescription>
        </DialogHeader>

        {isPermissionDetailLoading ? (
          <div className="flex min-h-64 items-center justify-center">
            <Spinner />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col">
              <Tabs defaultValue="basic" className="min-h-0 flex-1">
                <TabsList className="grid w-full shrink-0 grid-cols-2">
                  <TabsTrigger value="basic">{t('editDialog.tabs.basic')}</TabsTrigger>
                  <TabsTrigger value="roles">{t('editDialog.tabs.roles')}</TabsTrigger>
                </TabsList>

                <TabsContent
                  value="basic"
                  className="min-h-0 overflow-y-auto px-1 data-[state=inactive]:hidden"
                >
                  <div className="flex flex-col gap-4 pr-1">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('editDialog.name')}</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder={t('editDialog.namePlaceholder')} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="code"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('editDialog.code')}</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder={t('editDialog.codePlaceholder')} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="resource_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('editDialog.resourceType')}</FormLabel>
                            <Select
                              key={field.value}
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
                                  {RESOURCE_TYPES.map((resourceType) => (
                                    <SelectItem key={resourceType} value={String(resourceType)}>
                                      {t(`resourceType.${resourceType}`)}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="action"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('editDialog.action')}</FormLabel>
                            <Select
                              key={field.value}
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger className="w-full">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectGroup>
                                  {PERMISSION_ACTIONS.map((action) => (
                                    <SelectItem key={action} value={action}>
                                      {t(`action.${action}`)}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="module"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('editDialog.module')}</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder={t('editDialog.modulePlaceholder')} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="resource_path"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('editDialog.resourcePath')}</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder={t('editDialog.resourcePathPlaceholder')}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('editDialog.description')}</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder={t('editDialog.descriptionPlaceholder')}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                <TabsContent
                  value="roles"
                  className="min-h-0 overflow-hidden data-[state=inactive]:hidden"
                >
                  <FormField
                    control={form.control}
                    name="roles"
                    render={({ field }) => (
                      <FormItem className="min-h-0">
                        <FormLabel>{t('editDialog.roles')}</FormLabel>
                        <PermissionRolePicker
                          assignments={field.value}
                          initialRoles={permissionDetail?.roles ?? EmptyAssignedRoles}
                          onChange={field.onChange}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </Tabs>

              <DialogFooter className="shrink-0 pt-4">
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? t('editDialog.saving') : t('editDialog.save')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
