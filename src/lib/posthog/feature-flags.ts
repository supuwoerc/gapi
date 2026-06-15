import { posthog } from './client'

export function isFeatureEnabled(key: string): boolean {
  return posthog.isFeatureEnabled(key) ?? false
}

export function getFeatureFlag(key: string) {
  return posthog.getFeatureFlag(key)
}

export function onFeatureFlags(callback: () => void) {
  posthog.onFeatureFlags(callback)
}
