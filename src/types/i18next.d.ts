import type { Resources } from './i18n-resources'

declare module 'i18next' {
  interface CustomTypeOptions {
    resources: Resources
    nsSeparator: '.'
    keySeparator: '.'
  }
}
