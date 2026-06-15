import { posthog } from './client'

export function identifyUser(user: { name: string; email: string }) {
  posthog.identify(user.email, {
    name: user.name,
    email: user.email,
  })
}

export function resetUser() {
  posthog.reset()
}
