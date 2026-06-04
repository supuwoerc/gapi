import { patch } from '@/lib/http'

import type { UpdateProfileParams, UpdateProfileResponse } from './dto/profile'

export function updateProfile(params: UpdateProfileParams) {
  return patch<UpdateProfileResponse>('/profile', { json: params })
}
