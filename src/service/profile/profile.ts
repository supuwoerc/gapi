import { patch } from '@/lib/http'

export interface UpdateProfileParams {
  name: string
  bio: string
  avatar?: string
}

export interface UpdateProfileResponse {
  name: string
  email: string
  avatar: string
  bio: string
}

export function updateProfile(params: UpdateProfileParams) {
  return patch<UpdateProfileResponse>('/profile', { json: params })
}
