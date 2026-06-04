export interface AdvancedFilter {
  id: string
  value: string | string[]
  variant?: string
  operator: string
  filterId?: string
}

export function applyAdvancedFilter<T extends Record<string, unknown>>(
  data: T[],
  filter: AdvancedFilter
): T[] {
  const { id, value, operator } = filter
  const key = id as keyof T

  if (operator === 'isEmpty') {
    return data.filter((item) => !item[key])
  }
  if (operator === 'isNotEmpty') {
    return data.filter((item) => !!item[key])
  }

  if (Array.isArray(value)) {
    if (operator === 'inArray') {
      return data.filter((item) => value.includes(String(item[key])))
    }
    if (operator === 'notInArray') {
      return data.filter((item) => !value.includes(String(item[key])))
    }
    if (operator === 'isBetween' && value.length === 2) {
      return data.filter((item) => {
        const v = item[key] instanceof Date ? (item[key] as Date).getTime() : Number(item[key])
        return v >= Number(value[0]) && v <= Number(value[1])
      })
    }
    return data
  }

  const strValue = String(value).toLowerCase()
  return data.filter((item) => {
    const fieldVal = item[key]
    const fieldStr = String(fieldVal).toLowerCase()
    const fieldNum = fieldVal instanceof Date ? (fieldVal as Date).getTime() : Number(fieldVal)

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

export function applyAdvancedFilters<T extends Record<string, unknown>>(
  data: T[],
  filtersJson?: string
): T[] {
  if (!filtersJson) return data
  try {
    const parsed = JSON.parse(filtersJson) as AdvancedFilter[]
    let result = data
    for (const filter of parsed) {
      result = applyAdvancedFilter(result, filter)
    }
    return result
  } catch {
    return data
  }
}

export function applySorting<T extends Record<string, unknown>>(
  data: T[],
  sort: { id: string; desc: boolean }[]
): T[] {
  if (sort.length === 0) return data
  return [...data].sort((a, b) => {
    for (const { id, desc } of sort) {
      const aVal = a[id as keyof T] ?? ''
      const bVal = b[id as keyof T] ?? ''
      if (aVal < bVal) return desc ? 1 : -1
      if (aVal > bVal) return desc ? -1 : 1
    }
    return 0
  })
}

export function paginate<T>(
  data: T[],
  page: number,
  perPage: number
): { data: T[]; total: number } {
  const total = data.length
  const start = (page - 1) * perPage
  return { data: data.slice(start, start + perPage), total }
}
