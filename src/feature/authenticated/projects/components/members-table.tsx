import type { ProjectMember, ProjectRole } from '@/schema/project/project'
import { Trash2, UserPlus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { formatDate } from './utils'

interface MembersTableProps {
  members: ProjectMember[]
  roles: ProjectRole[]
  isUpdatingRole: boolean
  isRemoving: boolean
  onRoleChange: (memberId: number, roleId: number) => void
  onRemove: (member: ProjectMember) => void
}

export function MembersTable({
  members,
  roles,
  isUpdatingRole,
  isRemoving,
  onRoleChange,
  onRemove,
}: MembersTableProps) {
  const { t } = useTranslation('feature')

  if (members.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <UserPlus />
          </EmptyMedia>
          <EmptyTitle>{t('projects.emptyMembers.title')}</EmptyTitle>
          <EmptyDescription>{t('projects.emptyMembers.description')}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('projects.columns.member')}</TableHead>
          <TableHead>{t('projects.columns.status')}</TableHead>
          <TableHead>{t('projects.columns.role')}</TableHead>
          <TableHead>{t('projects.columns.joinedAt')}</TableHead>
          <TableHead className="w-20 text-end">{t('projects.columns.actions')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((member) => (
          <TableRow key={member.id}>
            <TableCell>
              <div className="flex min-w-60 items-center gap-3">
                <img
                  src={member.user.avatar}
                  alt={member.user.username}
                  className="size-8 rounded-full"
                />
                <div className="flex min-w-0 flex-col">
                  <span className="truncate font-medium">{member.user.username}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {member.user.email}
                  </span>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={member.status === 'active' ? 'secondary' : 'outline'}>
                {t(`projects.status.${member.status}`)}
              </Badge>
            </TableCell>
            <TableCell>
              <Select
                value={String(member.project_role_id)}
                disabled={isUpdatingRole}
                onValueChange={(value) => onRoleChange(member.id, Number(value))}
              >
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
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
            </TableCell>
            <TableCell>{member.joined_at ? formatDate(member.joined_at) : '-'}</TableCell>
            <TableCell className="text-end">
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={isRemoving}
                onClick={() => onRemove(member)}
              >
                <Trash2 />
                <span className="sr-only">{t('projects.removeMember')}</span>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
