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
