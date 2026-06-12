import * as React from 'react'

import { useForm, useWatch } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { Permission } from '@/schema/admin/permission'
import type { PermissionEffect } from '@/schema/admin/permission'
import type { RolePermission } from '@/schema/admin/permission'
import type { RoleMutation, RoleTree } from '@/schema/admin/role'
import { roleMutationSchema } from '@/schema/admin/role'
import { createRole, getPermissions, updateRole } from '@/service/admin/roles'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useTranslation } from 'react-i18next'
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
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
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
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

const NO_PARENT_VALUE = '__none__'
const ALL_MODULES_VALUE = '__all__'
const ALL_PERMISSION_STATES = 'all'

type PermissionStateFilter = 'all' | 'selected' | 'inherited' | 'overridden' | 'unset'

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

function findRole(roles: RoleTree[], id: number | null): RoleTree | undefined {
  if (id === null) return undefined

  for (const role of roles) {
    if (role.id === id) return role
    const child = findRole(role.children, id)
    if (child) return child
  }
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

function countPermissionEffects(permissions: { effect: PermissionEffect }[]) {
  return permissions.reduce(
    (counts, permission) => {
      counts[permission.effect] += 1
      return counts
    },
    { allow: 0, deny: 0 }
  )
}

interface RolePermissionPickerProps {
  permissions: Permission[]
  assignments: RoleMutation['permissions']
  inheritedPermissions: RolePermission[]
  isFetching: boolean
  onChange: (permissions: RoleMutation['permissions']) => void
}

function RolePermissionPicker({
  permissions,
  assignments,
  inheritedPermissions,
  isFetching,
  onChange,
}: RolePermissionPickerProps) {
  const { t } = useTranslation('feature')
  const scrollParentRef = React.useRef<HTMLDivElement>(null)
  const [search, setSearch] = React.useState('')
  const deferredSearch = React.useDeferredValue(search)
  const [moduleFilter, setModuleFilter] = React.useState(ALL_MODULES_VALUE)
  const [stateFilter, setStateFilter] = React.useState<PermissionStateFilter>(ALL_PERMISSION_STATES)

  const modules = React.useMemo(
    () => Array.from(new Set(permissions.map((permission) => permission.module))).sort(),
    [permissions]
  )

  const assignmentEffectById = React.useMemo(
    () =>
      new Map(
        assignments.map((assignment) => [assignment.permission_id, assignment.effect] as const)
      ),
    [assignments]
  )
  const inheritedEffectById = React.useMemo(
    () =>
      new Map(
        inheritedPermissions.map((permission) => [permission.id, permission.effect] as const)
      ),
    [inheritedPermissions]
  )

  const directSummary = React.useMemo(() => countPermissionEffects(assignments), [assignments])
  const inheritedSummary = React.useMemo(
    () => countPermissionEffects(inheritedPermissions),
    [inheritedPermissions]
  )
  const overrideCount = React.useMemo(
    () =>
      assignments.filter((assignment) => {
        const inheritedEffect = inheritedEffectById.get(assignment.permission_id)
        return inheritedEffect !== undefined && inheritedEffect !== assignment.effect
      }).length,
    [assignments, inheritedEffectById]
  )

  const filteredPermissions = React.useMemo(() => {
    const keyword = deferredSearch.trim().toLowerCase()

    return permissions.filter((permission) => {
      if (moduleFilter !== ALL_MODULES_VALUE && permission.module !== moduleFilter) return false

      const directEffect = assignmentEffectById.get(permission.id)
      const inheritedEffect = inheritedEffectById.get(permission.id)

      if (stateFilter === 'selected' && !directEffect) return false
      if (stateFilter === 'inherited' && !inheritedEffect) return false
      if (stateFilter === 'overridden' && (!directEffect || directEffect === inheritedEffect)) {
        return false
      }
      if (stateFilter === 'unset' && directEffect) return false

      if (!keyword) return true

      return [
        permission.name,
        permission.code,
        permission.module,
        permission.resource_path,
        permission.action,
      ]
        .join(' ')
        .toLowerCase()
        .includes(keyword)
    })
  }, [
    assignmentEffectById,
    deferredSearch,
    inheritedEffectById,
    moduleFilter,
    permissions,
    stateFilter,
  ])

  React.useEffect(() => {
    if (scrollParentRef.current) {
      scrollParentRef.current.scrollTop = 0
    }
  }, [deferredSearch, moduleFilter, stateFilter])

  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: filteredPermissions.length,
    getScrollElement: () => scrollParentRef.current,
    estimateSize: () => 92,
    overscan: 8,
    measureElement: (element) => element.getBoundingClientRect().height,
  })

  const virtualItems = virtualizer.getVirtualItems()

  const handleEffectChange = React.useCallback(
    (permissionId: number, effect: PermissionEffect | undefined) => {
      onChange(setPermissionEffect(assignments, permissionId, effect))
    },
    [assignments, onChange]
  )

  return (
    <div className="flex min-h-0 flex-col gap-3">
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_180px_180px]">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t('roles.editDialog.permissionSearchPlaceholder')}
        />
        <Select value={moduleFilter} onValueChange={setModuleFilter}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value={ALL_MODULES_VALUE}>
                {t('roles.editDialog.permissionModuleAll')}
              </SelectItem>
              {modules.map((module) => (
                <SelectItem key={module} value={module}>
                  {module}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select
          value={stateFilter}
          onValueChange={(value) => setStateFilter(value as PermissionStateFilter)}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">{t('roles.editDialog.permissionStateAll')}</SelectItem>
              <SelectItem value="selected">
                {t('roles.editDialog.permissionStateSelected')}
              </SelectItem>
              <SelectItem value="inherited">
                {t('roles.editDialog.permissionStateInherited')}
              </SelectItem>
              <SelectItem value="overridden">
                {t('roles.editDialog.permissionStateOverridden')}
              </SelectItem>
              <SelectItem value="unset">{t('roles.editDialog.permissionStateUnset')}</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">
          {t('roles.editDialog.directPermissionSummary', directSummary)}
        </Badge>
        <Badge variant="outline">
          {t('roles.editDialog.inheritedPermissionSummary', inheritedSummary)}
        </Badge>
        <Badge variant={overrideCount > 0 ? 'secondary' : 'outline'}>
          {t('roles.editDialog.overridePermissionSummary', { count: overrideCount })}
        </Badge>
      </div>

      <div className="text-xs text-muted-foreground">
        {t('roles.editDialog.permissionResultCount', {
          count: filteredPermissions.length,
          total: permissions.length,
        })}
      </div>

      <div className="h-[420px] max-h-[calc(100dvh-22rem)] min-h-64 overflow-hidden rounded-md border">
        {isFetching ? (
          <div className="flex h-full items-center justify-center">
            <Spinner />
          </div>
        ) : filteredPermissions.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            {t('roles.editDialog.permissionEmpty')}
          </div>
        ) : (
          <div ref={scrollParentRef} className="h-full overflow-y-auto">
            <div className="relative w-full" style={{ height: `${virtualizer.getTotalSize()}px` }}>
              {virtualItems.map((virtualItem) => {
                const permission = filteredPermissions[virtualItem.index]
                if (!permission) return null

                return (
                  <PermissionRow
                    key={virtualItem.key}
                    ref={virtualizer.measureElement}
                    permission={permission}
                    directEffect={assignmentEffectById.get(permission.id)}
                    inheritedEffect={inheritedEffectById.get(permission.id)}
                    isLast={virtualItem.index === filteredPermissions.length - 1}
                    onEffectChange={handleEffectChange}
                    style={{ transform: `translateY(${virtualItem.start}px)` }}
                    virtualIndex={virtualItem.index}
                  />
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

interface PermissionRowProps {
  permission: Permission
  directEffect: PermissionEffect | undefined
  inheritedEffect: PermissionEffect | undefined
  isLast: boolean
  onEffectChange: (permissionId: number, effect: PermissionEffect | undefined) => void
  style: React.CSSProperties
  virtualIndex: number
}

const PermissionRow = React.memo(
  React.forwardRef<HTMLDivElement, PermissionRowProps>(function PermissionRow(
    { permission, directEffect, inheritedEffect, isLast, onEffectChange, style, virtualIndex },
    ref
  ) {
    const { t } = useTranslation('feature')

    return (
      <div
        ref={ref}
        data-index={virtualIndex}
        className={cn(
          'absolute top-0 left-0 flex w-full flex-col gap-2 px-3 py-2.5 text-sm sm:flex-row sm:items-start sm:gap-3',
          !isLast && 'border-b',
          directEffect === 'allow' && 'bg-primary/5',
          directEffect === 'deny' && 'bg-destructive/10'
        )}
        style={style}
      >
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            <span className="truncate font-medium">{permission.name}</span>
            {directEffect ? (
              <Badge
                variant={directEffect === 'deny' ? 'outline' : 'secondary'}
                className={cn(
                  'text-xs',
                  directEffect === 'deny' && 'border-destructive/40 text-destructive'
                )}
              >
                {t('roles.editDialog.directPermission')} ·{' '}
                {t(`roles.permissionEffect.${directEffect}`)}
              </Badge>
            ) : null}
            {inheritedEffect ? (
              <Badge
                variant="outline"
                className={cn(
                  'text-xs',
                  inheritedEffect === 'deny' && 'border-destructive/40 text-destructive'
                )}
              >
                {t('roles.editDialog.inheritedPermission')} ·{' '}
                {t(`roles.permissionEffect.${inheritedEffect}`)}
              </Badge>
            ) : null}
          </div>
          <span className="text-xs break-all text-muted-foreground">{permission.code}</span>
          <div className="flex flex-wrap gap-1">
            <Badge variant="secondary" className="text-xs">
              {permission.module}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {t(`roles.permissionAction.${permission.action}`)}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {t(`roles.resourceType.${permission.resource_type}`)}
            </Badge>
          </div>
        </div>

        <ToggleGroup
          type="single"
          value={directEffect ?? 'unset'}
          onValueChange={(value) => {
            const nextEffect = value === 'allow' || value === 'deny' ? value : undefined
            onEffectChange(permission.id, nextEffect)
          }}
          variant="outline"
          size="sm"
          className="shrink-0 flex-wrap justify-end self-end sm:self-start"
        >
          <ToggleGroupItem value="unset">{t('roles.permissionEffect.unset')}</ToggleGroupItem>
          <ToggleGroupItem value="allow">{t('roles.permissionEffect.allow')}</ToggleGroupItem>
          <ToggleGroupItem value="deny">{t('roles.permissionEffect.deny')}</ToggleGroupItem>
        </ToggleGroup>
      </div>
    )
  })
)

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
      <DialogContent
        className="flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden sm:max-w-4xl"
        onInteractOutside={(event) => event.preventDefault()}
      >
        <DialogHeader className="shrink-0 pr-8">
          <DialogTitle>
            {role ? t('roles.editDialog.editTitle') : t('roles.editDialog.createTitle')}
          </DialogTitle>
          <DialogDescription className="sr-only">{t('roles.description')}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col">
            <Tabs defaultValue="basic" className="min-h-0 flex-1">
              <TabsList className="grid w-full shrink-0 grid-cols-2">
                <TabsTrigger value="basic">{t('roles.editDialog.tabs.basic')}</TabsTrigger>
                <TabsTrigger value="permissions">
                  {t('roles.editDialog.tabs.permissions')}
                </TabsTrigger>
              </TabsList>

              <TabsContent
                value="basic"
                className="min-h-0 overflow-y-auto data-[state=inactive]:hidden"
              >
                <div className="flex flex-col gap-4 pr-1">
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
                                <SelectValue
                                  placeholder={t('roles.editDialog.parentPlaceholder')}
                                />
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
                </div>
              </TabsContent>

              <TabsContent
                value="permissions"
                className="min-h-0 overflow-hidden data-[state=inactive]:hidden"
              >
                <FormField
                  control={form.control}
                  name="permissions"
                  render={({ field }) => (
                    <FormItem className="min-h-0">
                      <FormLabel>{t('roles.editDialog.permissions')}</FormLabel>
                      <RolePermissionPicker
                        permissions={permissions}
                        assignments={field.value}
                        inheritedPermissions={inheritedPermissions}
                        isFetching={isPermissionsFetching}
                        onChange={field.onChange}
                      />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>

            <DialogFooter className="shrink-0 pt-4">
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
