/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME: string
  readonly VITE_APP_ENV: 'dev' | 'test' | 'prod'
  readonly VITE_APP_BASE: string
  readonly VITE_APP_DEFAULT_SERVER: string
  readonly VITE_APP_ENABLE_MSW?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
