import { faker } from '@faker-js/faker'
import { CircleCheck, CircleX, Eye, Mail, Pen, ShieldCheck } from 'lucide-react'

import type { User } from './schema'

export const roles = [
  { label: 'Admin', value: 'admin', icon: ShieldCheck },
  { label: 'Editor', value: 'editor', icon: Pen },
  { label: 'Viewer', value: 'viewer', icon: Eye },
]

export const statuses = [
  { label: 'Active', value: 'active', icon: CircleCheck },
  { label: 'Inactive', value: 'inactive', icon: CircleX },
  { label: 'Invited', value: 'invited', icon: Mail },
]

export const departments = [
  'Engineering',
  'Design',
  'Marketing',
  'Sales',
  'Support',
  'HR',
  'Finance',
  'Product',
]

export function generateUsers(count: number): User[] {
  return Array.from({ length: count }, () => ({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    avatar: faker.image.avatarGitHub(),
    role: faker.helpers.arrayElement(roles).value as User['role'],
    status: faker.helpers.arrayElement(statuses).value as User['status'],
    department: faker.helpers.arrayElement(departments),
    lastLogin: faker.date.recent({ days: 30 }),
    createdAt: faker.date.past({ years: 2 }),
  }))
}

export const users: User[] = generateUsers(50)
