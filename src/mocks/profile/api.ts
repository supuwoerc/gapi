import type { UpdateProfileParams, UpdateProfileResponse } from '@/service/profile/dto/profile'

export async function updateProfile(params: UpdateProfileParams): Promise<UpdateProfileResponse> {
  await new Promise((r) => setTimeout(r, 800))
  return {
    name: params.name,
    email: 'mock@example.com',
    avatar: params.avatar ?? 'https://github.com/shadcn.png',
    bio: params.bio,
  }
}
