import * as React from 'react'

import { useForm, useWatch } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { Permission } from '@/schema/admin/permission'
import type { PermissionEffect } from '@/schema/admin/permission'
import type { RoleMutation, RoleTree } from '@/schema/admin/role'
import { roleMutationSchema } from '@/schema/admin/role'
import { createRole, getPermissions, updateRole } from '@/service/admin/roles'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

const NO_PARENT_VALUE = '__none__'

interface RoleOption {
  id: number
  label: string
}

interface RoleEditDialogProps {
  role: RoleTree | null
  roles: RoleTree[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

function flattenRoleOptions(
  roles: RoleTree[],
  excludeIds = new Set<number>(),
  depth = 0
): RoleOption[] {
  return roles.flatMap((role) => {
    const children = flattenRoleOptions(role.children, excludeIds, depth + 1)
    if (excludeIds.has(role.id)) return children

    return [
      {
        id: role.id,
        label: `${'  '.repeat(depth)}${role.name}`,
      },
      ...children,
    ]
  })
}

function collectRoleIds(role: RoleTree): number[] {
  return [role.id, ...role.children.flatMap(collectRoleIds)]
}

function groupPermissions(permissions: Permission[]) {
  return permissions.reduce<Record<string, Permission[]>>((groups, permission) => {
    groups[permission.module] ??= []
    groups[permission.module].push(permission)
    return groups
  }, {})
}

function findRole(roles: RoleTree[], id: number | null): RoleTree | undefined {
  if (id === null) return undefined

  for (const role of roles) {
    if (role.id === id) return role
    const child = findRole(role.children, id)
    if (child) return child
  }
}

function getPermissionEffect(
  assignments: RoleMutation['permissions'],
  permissionId: number
): PermissionEffect | undefined {
  return assignments.find((assignment) => assignment.permission_id === permissionId)?.effect
}

function setPermissionEffect(
  assignments: RoleMutation['permissions'],
  permissionId: number,
  effect: PermissionEffect | undefined
): RoleMutation['permissions'] {
  if (!effect) return assignments.filter((assignment) => assignment.permission_id !== permissionId)

  if (assignments.some((assignment) => assignment.permission_id === permissionId)) {
    return assignments.map((assignment) =>
      assignment.permission_id === permissionId ? { ...assignment, effect } : assignment
    )
  }

  return [...assignments, { permission_id: permissionId, effect }]
}

export function RoleEditDialog({ role, roles, open, onOpenChange }: RoleEditDialogProps) {
  const { t } = useTranslation('feature')
  const queryClient = useQueryClient()

  const form = useForm<RoleMutation>({
    resolver: zodResolver(roleMutationSchema),
    defaultValues: {
      name: '',
      code: '',
      parent_id: null,
      description: '',
      sort_order: 0,
      enabled: true,
      permissions: [],
    },
  })

  React.useEffect(() => {
    if (!open) return

    form.reset({
      name: role?.name ?? '',
      code: role?.code ?? '',
      parent_id: role?.parent_id ?? null,
      description: role?.description ?? '',
      sort_order: role?.sort_order ?? 0,
      enabled: role?.enabled ?? true,
      permissions:
        role?.permissions.map((permission) => ({
          permission_id: permission.id,
          effect: permission.effect,
        })) ?? [],
    })
  }, [form, open, role])

  const { data: permissions = [], isFetching: isPermissionsFetching } = useQuery({
    queryKey: ['permissions'],
    queryFn: getPermissions,
    enabled: open,
  })

  const permissionGroups = React.useMemo(() => groupPermissions(permissions), [permissions])
  const parentId = useWatch({ control: form.control, name: 'parent_id' })
  const inheritedPermissions = React.useMemo(
    () => findRole(roles, parentId)?.effective_permissions ?? [],
    [parentId, roles]
  )
  const parentOptions = React.useMemo(() => {
    const excludeIds = role ? new Set(collectRoleIds(role)) : new Set<number>()
    return flattenRoleOptions(roles, excludeIds)
  }, [role, roles])

  const mutation = useMutation({
    mutationFn: (values: RoleMutation) => (role ? updateRole(role.id, values) : createRole(values)),
    onSuccess: () => {
      toast.success(
        role ? t('roles.editDialog.updateSuccess') : t('roles.editDialog.createSuccess')
      )
      onOpenChange(false)
      void queryClient.invalidateQueries({ queryKey: ['roles'] })
    },
  })

  const onSubmit = (values: RoleMutation) => mutation.mutate(values)

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
      <DialogContent className="sm:max-w-2xl" onInteractOutside={(event) => event.preventDefault()}>
        <DialogHeader>
          <DialogTitle>
            {role ? t('roles.editDialog.editTitle') : t('roles.editDialog.createTitle')}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('roles.editDialog.name')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('roles.editDialog.namePlaceholder')} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('roles.editDialog.code')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('roles.editDialog.codePlaceholder')} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="parent_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('roles.editDialog.parent')}</FormLabel>
                    <Select
                      value={field.value === null ? NO_PARENT_VALUE : String(field.value)}
                      onValueChange={(value) =>
                        field.onChange(value === NO_PARENT_VALUE ? null : Number(value))
                      }
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={t('roles.editDialog.parentPlaceholder')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value={NO_PARENT_VALUE}>
                            {t('roles.editDialog.noParent')}
                          </SelectItem>
                          {parentOptions.map((option) => (
                            <SelectItem key={option.id} value={String(option.id)}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sort_order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('roles.editDialog.sortOrder')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        inputMode="numeric"
                        value={field.value}
                        onChange={(event) => field.onChange(Number(event.target.value))}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('roles.editDialog.description')}</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder={t('roles.editDialog.descriptionPlaceholder')}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="enabled"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-md border px-3 py-2">
                  <FormLabel>{t('roles.editDialog.enabled')}</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="permissions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('roles.editDialog.permissions')}</FormLabel>
                  {inheritedPermissions.length > 0 ? (
                    <div className="rounded-md border bg-muted/30 p-3">
                      <div className="mb-2 text-sm font-medium">
                        {t('roles.editDialog.inheritedPermissions')}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {inheritedPermissions.map((permission) => (
                          <Badge
                            key={permission.id}
                            variant={permission.effect === 'deny' ? 'outline' : 'secondary'}
                            className={cn(
                              'text-xs',
                              permission.effect === 'deny' &&
                                'border-destructive/40 text-destructive'
                            )}
                          >
                            {permission.name} · {t(`roles.permissionEffect.${permission.effect}`)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  <ScrollArea className="h-72 rounded-md border">
                    <div className="flex flex-col gap-4 p-3">
                      {isPermissionsFetching ? (
                        <div className="flex justify-center py-8">
                          <Spinner />
                        </div>
                      ) : (
                        Object.entries(permissionGroups).map(([module, modulePermissions]) => (
                          <div key={module} className="flex flex-col gap-2">
                            <div className="text-sm font-medium">{module}</div>
                            <div className="grid gap-2 sm:grid-cols-2">
                              {modulePermissions.map((permission) => {
                                const effect = getPermissionEffect(field.value, permission.id)
                                return (
                                  <div
                                    key={permission.id}
                                    className={cn(
                                      'flex items-start gap-2 rounded-md border p-3 text-sm',
                                      effect === 'allow' && 'border-teal-300 bg-teal-100/30',
                                      effect === 'deny' && 'border-destructive/40 bg-destructive/10'
                                    )}
                                  >
                                    <span className="flex min-w-0 flex-col gap-1">
                                      <span className="font-medium">{permission.name}</span>
                                      <span className="text-xs break-all text-muted-foreground">
                                        {permission.code}
                                      </span>
                                      <span className="flex flex-wrap gap-1">
                                        <Badge variant="secondary" className="text-xs">
                                          {t(`roles.permissionAction.${permission.action}`)}
                                        </Badge>
                                        <Badge variant="outline" className="text-xs">
                                          {t(`roles.resourceType.${permission.resource_type}`)}
                                        </Badge>
                                      </span>
                                      <ToggleGroup
                                        type="single"
                                        value={effect ?? ''}
                                        onValueChange={(value) => {
                                          const nextEffect =
                                            value === 'allow' || value === 'deny'
                                              ? value
                                              : undefined
                                          field.onChange(
                                            setPermissionEffect(
                                              field.value,
                                              permission.id,
                                              nextEffect
                                            )
                                          )
                                        }}
                                        variant="outline"
                                        size="sm"
                                        className="mt-1"
                                      >
                                        <ToggleGroupItem value="allow">
                                          {t('roles.permissionEffect.allow')}
                                        </ToggleGroupItem>
                                        <ToggleGroupItem value="deny">
                                          {t('roles.permissionEffect.deny')}
                                        </ToggleGroupItem>
                                      </ToggleGroup>
                                    </span>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? t('roles.editDialog.saving') : t('roles.editDialog.save')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
