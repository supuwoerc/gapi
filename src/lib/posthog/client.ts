import posthog from 'posthog-js'

const posthogKey = import.meta.env.VITE_POSTHOG_KEY ?? ''
const posthogHost = import.meta.env.VITE_POSTHOG_HOST ?? 'https://us.i.posthog.com'

export function initPostHog() {
  if (!posthogKey) return
  posthog.init(posthogKey, {
    api_host: posthogHost,
    capture_pageview: 'history_change',
    capture_exceptions: true,
    session_recording: {
      maskAllInputs: true,
    },
  })
}

export { posthog }
