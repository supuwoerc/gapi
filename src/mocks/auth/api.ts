import type {
  ForgotPasswordParams,
  LoginParams,
  LoginResponse,
  SignUpParams,
  VerifyOtpParams,
} from '@/service/auth/dto/auth'
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

export async function forgotPassword(_params: ForgotPasswordParams): Promise<void> {
  await new Promise((r) => setTimeout(r, 1000))
}

export async function verifyOtp(_params: VerifyOtpParams): Promise<void> {
  await new Promise((r) => setTimeout(r, 1000))
}

export async function signUp(_params: SignUpParams): Promise<void> {
  await new Promise((r) => setTimeout(r, 1000))
}
