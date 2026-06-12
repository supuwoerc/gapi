import * as React from 'react'

import { useForm, useWatch } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { Permission } from '@/schema/admin/permission'
import type { PermissionAction, ResourceType } from '@/schema/admin/permission'
import type { PermissionEffect } from '@/schema/admin/permission'
import type { RolePermission } from '@/schema/admin/permission'
import type { Role, RoleMutation, RoleTree } from '@/schema/admin/role'
import { roleMutationSchema } from '@/schema/admin/role'
import {
  createRole,
  getPermissionModules,
  getPermissions,
  getRoleDetail,
  updateRole,
} from '@/service/admin/roles'
import { useVirtualizer } from '@tanstack/react-virtual'
import { ChevronLeft, ChevronRight } from 'lucide-react'
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
const ALL_ACTIONS_VALUE = '__all__'
const ALL_RESOURCE_TYPES_VALUE = '__all__'
const PERMISSION_PAGE_SIZE_OPTIONS = [10, 20, 50]
const PERMISSION_ACTIONS: PermissionAction[] = ['create', 'read', 'update', 'delete']
const RESOURCE_TYPES: ResourceType[] = [1, 2, 3, 4, 5]

const EmptyPermissionPage = { data: [], total: 0 }

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

function toRoleMutation(role: Role | RoleTree | null | undefined): RoleMutation {
  return {
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
  }
}

function getPermissionCache(role: Role | RoleTree | null | undefined): Map<number, Permission> {
  return new Map<number, Permission>(
    role?.permissions.map((permission) => [permission.id, permission] as const) ?? []
  )
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

function mergePermissionCache(current: Map<number, Permission>, permissions: Permission[]) {
  if (permissions.length === 0) return current

  const next = new Map(current)
  permissions.forEach((permission) => next.set(permission.id, permission))
  return next
}

interface RolePermissionPickerProps {
  assignments: RoleMutation['permissions']
  inheritedPermissions: RolePermission[]
  onCachePermissions: (permissions: Permission[]) => void
  onChange: (permissions: RoleMutation['permissions']) => void
}

function RolePermissionPicker({
  assignments,
  inheritedPermissions,
  onCachePermissions,
  onChange,
}: RolePermissionPickerProps) {
  const { t } = useTranslation('feature')
  const scrollParentRef = React.useRef<HTMLDivElement>(null)
  const [page, setPage] = React.useState(1)
  const [perPage, setPerPage] = React.useState(20)
  const [searchValue, setSearchValue] = React.useState('')
  const [keyword, setKeyword] = React.useState('')
  const [moduleFilter, setModuleFilter] = React.useState(ALL_MODULES_VALUE)
  const [actionFilter, setActionFilter] = React.useState(ALL_ACTIONS_VALUE)
  const [resourceTypeFilter, setResourceTypeFilter] = React.useState(ALL_RESOURCE_TYPES_VALUE)

  useDebounce(
    () => {
      setKeyword(searchValue.trim())
      setPage(1)
    },
    300,
    [searchValue]
  )

  const { data: modules = [] } = useQuery({
    queryKey: ['permissions', 'modules'],
    queryFn: getPermissionModules,
  })

  const selectedAction =
    actionFilter === ALL_ACTIONS_VALUE ? undefined : (actionFilter as PermissionAction)
  const selectedResourceType =
    resourceTypeFilter === ALL_RESOURCE_TYPES_VALUE
      ? undefined
      : (Number(resourceTypeFilter) as ResourceType)

  const { data: permissionsPage = EmptyPermissionPage, isFetching: isPermissionsFetching } =
    useQuery({
      queryKey: [
        'permissions',
        { page, perPage, keyword, moduleFilter, actionFilter, resourceTypeFilter },
      ],
      queryFn: () =>
        getPermissions({
          page,
          perPage,
          keyword: keyword || undefined,
          module: moduleFilter === ALL_MODULES_VALUE ? undefined : moduleFilter,
          action: selectedAction,
          resource_type: selectedResourceType,
        }),
      placeholderData: keepPreviousData,
    })

  React.useEffect(() => {
    onCachePermissions(permissionsPage.data)
  }, [onCachePermissions, permissionsPage.data])

  const totalPages = Math.max(1, Math.ceil(permissionsPage.total / perPage))

  React.useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

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

  React.useEffect(() => {
    if (scrollParentRef.current) {
      scrollParentRef.current.scrollTop = 0
    }
  }, [page, perPage, keyword, moduleFilter, actionFilter, resourceTypeFilter])

  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: permissionsPage.data.length,
    getScrollElement: () => scrollParentRef.current,
    estimateSize: () => 92,
    overscan: 8,
    measureElement: (element) => element.getBoundingClientRect().height,
  })

  const virtualItems = virtualizer.getVirtualItems()

  const handleEffectChange = React.useCallback(
    (permission: Permission, effect: PermissionEffect | undefined) => {
      if (effect) {
        onCachePermissions([permission])
      }
      onChange(setPermissionEffect(assignments, permission.id, effect))
    },
    [assignments, onCachePermissions, onChange]
  )

  const handleModuleChange = React.useCallback((value: string) => {
    setModuleFilter(value)
    setPage(1)
  }, [])

  const handleActionChange = React.useCallback((value: string) => {
    setActionFilter(value)
    setPage(1)
  }, [])

  const handleResourceTypeChange = React.useCallback((value: string) => {
    setResourceTypeFilter(value)
    setPage(1)
  }, [])

  const handlePerPageChange = React.useCallback((value: string) => {
    setPerPage(Number(value))
    setPage(1)
  }, [])

  const canPreviousPage = page > 1
  const canNextPage = page < totalPages

  const isInitialPermissionsLoading = isPermissionsFetching && permissionsPage.data.length === 0

  const paginationLabel = t('roles.editDialog.permissionPageOf', {
    current: page,
    total: totalPages,
  })

  const resultCountLabel = t('roles.editDialog.permissionResultCount', {
    count: permissionsPage.data.length,
    total: permissionsPage.total,
  })

  return (
    <div className="flex min-h-0 flex-col gap-3">
      <div className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_160px_150px_150px]">
        <Input
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          placeholder={t('roles.editDialog.permissionSearchPlaceholder')}
        />
        <Select value={moduleFilter} onValueChange={handleModuleChange}>
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
        <Select value={actionFilter} onValueChange={handleActionChange}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value={ALL_ACTIONS_VALUE}>
                {t('roles.editDialog.permissionActionAll')}
              </SelectItem>
              {PERMISSION_ACTIONS.map((action) => (
                <SelectItem key={action} value={action}>
                  {t(`roles.permissionAction.${action}`)}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select value={resourceTypeFilter} onValueChange={handleResourceTypeChange}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value={ALL_RESOURCE_TYPES_VALUE}>
                {t('roles.editDialog.permissionResourceTypeAll')}
              </SelectItem>
              {RESOURCE_TYPES.map((resourceType) => (
                <SelectItem key={resourceType} value={String(resourceType)}>
                  {t(`roles.resourceType.${resourceType}`)}
                </SelectItem>
              ))}
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
        {isPermissionsFetching && permissionsPage.data.length > 0
          ? t('roles.editDialog.permissionRefreshing')
          : resultCountLabel}
      </div>

      <div className="h-[420px] max-h-[calc(100dvh-22rem)] min-h-64 overflow-hidden rounded-md border">
        {isInitialPermissionsLoading ? (
          <div className="flex h-full items-center justify-center">
            <Spinner />
          </div>
        ) : permissionsPage.data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            {t('roles.editDialog.permissionEmpty')}
          </div>
        ) : (
          <div ref={scrollParentRef} className="h-full overflow-y-auto">
            <div className="relative w-full" style={{ height: `${virtualizer.getTotalSize()}px` }}>
              {virtualItems.map((virtualItem) => {
                const permission = permissionsPage.data[virtualItem.index]
                if (!permission) return null

                return (
                  <PermissionRow
                    key={virtualItem.key}
                    ref={virtualizer.measureElement}
                    permission={permission}
                    directEffect={assignmentEffectById.get(permission.id)}
                    inheritedEffect={inheritedEffectById.get(permission.id)}
                    isLast={virtualItem.index === permissionsPage.data.length - 1}
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

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {t('roles.editDialog.permissionRowsPerPage')}
          </span>
          <Select value={String(perPage)} onValueChange={handlePerPageChange}>
            <SelectTrigger className="h-8 w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {PERMISSION_PAGE_SIZE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-end gap-2">
          <span className="text-sm text-muted-foreground">{paginationLabel}</span>
          <Button
            type="button"
            aria-label={t('roles.editDialog.permissionPreviousPage')}
            variant="outline"
            size="icon-sm"
            disabled={!canPreviousPage}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            <ChevronLeft />
          </Button>
          <Button
            type="button"
            aria-label={t('roles.editDialog.permissionNextPage')}
            variant="outline"
            size="icon-sm"
            disabled={!canNextPage}
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
    </div>
  )
}

interface PermissionRowProps {
  permission: Permission
  directEffect: PermissionEffect | undefined
  inheritedEffect: PermissionEffect | undefined
  isLast: boolean
  onEffectChange: (permission: Permission, effect: PermissionEffect | undefined) => void
  style: React.CSSProperties
  virtualIndex: number
}

interface PermissionReviewDialogProps {
  assignments: RoleMutation['permissions']
  inheritedPermissions: RolePermission[]
  isPending: boolean
  open: boolean
  permissionById: Map<number, Permission>
  onConfirm: () => void
  onOpenChange: (open: boolean) => void
}

function PermissionReviewDialog({
  assignments,
  inheritedPermissions,
  isPending,
  open,
  permissionById,
  onConfirm,
  onOpenChange,
}: PermissionReviewDialogProps) {
  const { t } = useTranslation('feature')

  const inheritedEffectById = React.useMemo(
    () =>
      new Map(
        inheritedPermissions.map((permission) => [permission.id, permission.effect] as const)
      ),
    [inheritedPermissions]
  )
  const directSummary = React.useMemo(() => countPermissionEffects(assignments), [assignments])
  const selectedPermissions = React.useMemo(
    () =>
      assignments.map((assignment) => ({
        assignment,
        permission: permissionById.get(assignment.permission_id),
      })),
    [assignments, permissionById]
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden sm:max-w-2xl">
        <DialogHeader className="shrink-0 pr-8">
          <DialogTitle>{t('roles.editDialog.permissionReviewTitle')}</DialogTitle>
          <DialogDescription>{t('roles.editDialog.permissionReviewDescription')}</DialogDescription>
        </DialogHeader>

        <div className="flex shrink-0 flex-wrap gap-2">
          <Badge variant="secondary">
            {t('roles.editDialog.selectedPermissionCount', { count: assignments.length })}
          </Badge>
          <Badge variant="outline">
            {t('roles.editDialog.directPermissionSummary', directSummary)}
          </Badge>
        </div>

        <div className="min-h-0 overflow-hidden rounded-md border">
          {selectedPermissions.length === 0 ? (
            <div className="px-3 py-6 text-sm text-muted-foreground">
              {t('roles.editDialog.selectedPermissionEmpty')}
            </div>
          ) : (
            <div className="max-h-[420px] overflow-y-auto">
              {selectedPermissions.map(({ assignment, permission }, index) => (
                <PermissionReviewRow
                  key={assignment.permission_id}
                  assignment={assignment}
                  inheritedEffect={inheritedEffectById.get(assignment.permission_id)}
                  isLast={index === selectedPermissions.length - 1}
                  permission={permission}
                />
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="shrink-0">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => onOpenChange(false)}
          >
            {t('roles.editDialog.permissionReviewBack')}
          </Button>
          <Button type="button" disabled={isPending} onClick={onConfirm}>
            {isPending
              ? t('roles.editDialog.saving')
              : t('roles.editDialog.permissionReviewConfirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface PermissionReviewRowProps {
  assignment: RoleMutation['permissions'][number]
  inheritedEffect: PermissionEffect | undefined
  isLast: boolean
  permission: Permission | undefined
}

function PermissionReviewRow({
  assignment,
  inheritedEffect,
  isLast,
  permission,
}: PermissionReviewRowProps) {
  const { t } = useTranslation('feature')

  return (
    <div
      className={cn(
        'flex flex-col gap-2 px-3 py-2.5 text-sm sm:flex-row sm:items-start sm:gap-3',
        !isLast && 'border-b',
        assignment.effect === 'allow' && 'bg-primary/5',
        assignment.effect === 'deny' && 'bg-destructive/10'
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          <span className="truncate font-medium">
            {permission?.name ??
              t('roles.editDialog.permissionUnknown', { id: assignment.permission_id })}
          </span>
          <Badge
            variant={assignment.effect === 'deny' ? 'outline' : 'secondary'}
            className={cn(
              'text-xs',
              assignment.effect === 'deny' && 'border-destructive/40 text-destructive'
            )}
          >
            {t('roles.editDialog.directPermission')} ·{' '}
            {t(`roles.permissionEffect.${assignment.effect}`)}
          </Badge>
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
        <span className="text-xs break-all text-muted-foreground">
          {permission?.code ?? `#${assignment.permission_id}`}
        </span>
        {permission ? (
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
        ) : null}
      </div>
    </div>
  )
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
            onEffectChange(permission, nextEffect)
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
  const [cachedPermissionById, setCachedPermissionById] = React.useState<Map<number, Permission>>(
    () => new Map()
  )
  const [reviewOpen, setReviewOpen] = React.useState(false)
  const [pendingValues, setPendingValues] = React.useState<RoleMutation | null>(null)

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

    form.reset(toRoleMutation(role))
  }, [form, open, role])

  const { data: roleDetail } = useQuery({
    queryKey: ['role', role?.id],
    queryFn: () => getRoleDetail(role!.id),
    enabled: open && Boolean(role),
  })

  React.useEffect(() => {
    if (!open || !roleDetail) return

    form.reset(toRoleMutation(roleDetail))
  }, [form, open, roleDetail])

  const handleCachePermissions = React.useCallback((permissions: Permission[]) => {
    setCachedPermissionById((current) => mergePermissionCache(current, permissions))
  }, [])

  const basePermissionById = React.useMemo(
    () => getPermissionCache(roleDetail ?? role),
    [role, roleDetail]
  )

  const permissionById = React.useMemo(() => {
    const next = new Map(basePermissionById)
    cachedPermissionById.forEach((permission, permissionId) => {
      next.set(permissionId, permission)
    })
    return next
  }, [basePermissionById, cachedPermissionById])

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
      setReviewOpen(false)
      setPendingValues(null)
      onOpenChange(false)
      void queryClient.invalidateQueries({ queryKey: ['roles'] })
      if (role) void queryClient.invalidateQueries({ queryKey: ['role', role.id] })
    },
  })

  const onSubmit = (values: RoleMutation) => {
    setPendingValues(values)
    setReviewOpen(true)
  }

  const handleReviewConfirm = () => {
    if (!pendingValues) return
    mutation.mutate(pendingValues)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setReviewOpen(false)
      setPendingValues(null)
    }
    onOpenChange(nextOpen)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange} modal={false}>
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
                              <Input
                                {...field}
                                placeholder={t('roles.editDialog.namePlaceholder')}
                              />
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
                              <Input
                                {...field}
                                placeholder={t('roles.editDialog.codePlaceholder')}
                              />
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
                          assignments={field.value}
                          inheritedPermissions={inheritedPermissions}
                          onCachePermissions={handleCachePermissions}
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
      <PermissionReviewDialog
        assignments={pendingValues?.permissions ?? []}
        inheritedPermissions={inheritedPermissions}
        isPending={mutation.isPending}
        open={reviewOpen}
        permissionById={permissionById}
        onConfirm={handleReviewConfirm}
        onOpenChange={setReviewOpen}
      />
    </>
  )
}
