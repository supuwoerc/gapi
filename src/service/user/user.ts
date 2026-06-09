import type { LoginUser } from '@/schema/auth/auth'

import { get, patch } from '@/lib/http'

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

export interface PatchTourParams {
  completed_tours: string[]
}

export interface PatchTourResponse {
  completed_tours: string[]
}

export function fetchUserProfile() {
  return get<LoginUser>('/user/profile')
}

export function updateProfile(params: UpdateProfileParams) {
  return patch<UpdateProfileResponse>('/user/profile', { json: params })
}

export function patchTour(params: PatchTourParams) {
  return patch<PatchTourResponse>('/user/tour', { json: params })
}
