export interface AuthProvider {
  getToken(): string | null
  getRefreshToken(): string | null
  getLanguage(): string
  onTokenRefreshed(token: string, refreshToken: string): void
  onAuthFailed(): void
}

let provider: AuthProvider | null = null

export function setAuthProvider(p: AuthProvider) {
  provider = p
}

export function getAuthProvider(): AuthProvider {
  if (!provider) throw new Error('AuthProvider not initialized')
  return provider
}
