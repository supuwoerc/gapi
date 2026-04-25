import type { LoginParams, LoginResponse } from '@/service/auth/dto/auth'
import { faker } from '@faker-js/faker'

export async function login(params: LoginParams): Promise<LoginResponse> {
  await new Promise((r) => setTimeout(r, 1000))
  return {
    user: {
      name: faker.person.fullName(),
      email: params.email,
      avatar: faker.image.avatar(),
    },
    token: faker.string.alphanumeric(64),
    refreshToken: faker.string.alphanumeric(64),
  }
}
