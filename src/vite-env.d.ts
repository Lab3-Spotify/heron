/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface ImportMetaEnv {
  readonly WALRUS_API_BASE_URL: string
  readonly ENV: 'local' | 'staging'
  readonly APP_TITLE: string
  readonly DEBUG: 'true'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
