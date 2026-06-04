import { get } from '@/lib/http'

export type FetchMenuBadgesResponse = Record<string, number>

export function fetchMenuBadges() {
  return get<FetchMenuBadgesResponse>('/menu/badges')
}
