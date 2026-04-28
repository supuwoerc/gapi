import type { User } from '@/schema/admin/users'
import type { AdvancedFilter, GetUsersParams, GetUsersResponse } from '@/service/users/dto/users'
import { faker } from '@faker-js/faker'

// Set a fixed seed for consistent data generation
faker.seed(67890)

const users = Array.from({ length: 500 }, () => {
  const firstName = faker.person.firstName()
  const lastName = faker.person.lastName()
  return {
    id: faker.string.uuid(),
    firstName,
    lastName,
    username: faker.internet.username({ firstName, lastName }).toLocaleLowerCase(),
    email: faker.internet.email({ firstName }).toLocaleLowerCase(),
    phoneNumber: faker.phone.number({ style: 'international' }),
    status: faker.helpers.arrayElement(['active', 'inactive', 'invited', 'suspended']),
    role: faker.helpers.arrayElement(['superadmin', 'admin', 'cashier', 'manager']),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  }
})

function applyAdvancedFilter(data: User[], filter: AdvancedFilter): User[] {
  const { id, value, operator } = filter
  const key = id as keyof User

  if (operator === 'isEmpty') {
    return data.filter((u) => !u[key])
  }
  if (operator === 'isNotEmpty') {
    return data.filter((u) => !!u[key])
  }

  if (Array.isArray(value)) {
    if (operator === 'inArray') {
      return data.filter((u) => value.includes(String(u[key])))
    }
    if (operator === 'notInArray') {
      return data.filter((u) => !value.includes(String(u[key])))
    }
    if (operator === 'isBetween' && value.length === 2) {
      return data.filter((u) => {
        const v = u[key] instanceof Date ? u[key].getTime() : Number(u[key])
        return v >= Number(value[0]) && v <= Number(value[1])
      })
    }
    return data
  }

  const strValue = String(value).toLowerCase()
  return data.filter((u) => {
    const fieldVal = u[key]
    const fieldStr = String(fieldVal).toLowerCase()
    const fieldNum = fieldVal instanceof Date ? fieldVal.getTime() : Number(fieldVal)

    switch (operator) {
      case 'iLike':
        return fieldStr.includes(strValue)
      case 'notILike':
        return !fieldStr.includes(strValue)
      case 'eq':
        return fieldStr === strValue
      case 'ne':
        return fieldStr !== strValue
      case 'lt':
        return fieldNum < Number(value)
      case 'lte':
        return fieldNum <= Number(value)
      case 'gt':
        return fieldNum > Number(value)
      case 'gte':
        return fieldNum >= Number(value)
      default:
        return true
    }
  })
}

export async function getUsers(params: GetUsersParams): Promise<GetUsersResponse> {
  await new Promise((r) => setTimeout(r, 200))

  let result = users as User[]

  if (params.username) {
    const keyword = params.username.toLowerCase()
    result = result.filter(
      (u) =>
        u.username.toLowerCase().includes(keyword) ||
        u.email.toLowerCase().includes(keyword) ||
        u.firstName.toLowerCase().includes(keyword) ||
        u.lastName.toLowerCase().includes(keyword)
    )
  }

  if (params.status?.length) {
    result = result.filter((u) => params.status!.includes(u.status))
  }

  if (params.role?.length) {
    result = result.filter((u) => params.role!.includes(u.role))
  }

  if (params.filters) {
    try {
      const parsed = JSON.parse(params.filters) as AdvancedFilter[]
      for (const filter of parsed) {
        result = applyAdvancedFilter(result, filter)
      }
    } catch {
      // ignore malformed filters
    }
  }

  if (params.sort.length > 0) {
    result = [...result].sort((a, b) => {
      for (const { id, desc } of params.sort) {
        const aVal = a[id as keyof User]
        const bVal = b[id as keyof User]
        if (aVal < bVal) return desc ? 1 : -1
        if (aVal > bVal) return desc ? -1 : 1
      }
      return 0
    })
  }

  const total = result.length
  const start = (params.page - 1) * params.perPage
  const data = result.slice(start, start + params.perPage)

  return { data, total }
}
