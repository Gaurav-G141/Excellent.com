/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string
  readonly VITE_FIREBASE_AUTH_DOMAIN: string
  readonly VITE_FIREBASE_PROJECT_ID: string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string
  readonly VITE_FIREBASE_APP_ID: string
  // OpenAI (Applications tab AI rewrites + mad-lib themes). Optional: when unset,
  // the app falls back to base phrasing and built-in static themes.
  readonly VITE_OPENAI_API_KEY?: string
  readonly VITE_OPENAI_MODEL?: string
  readonly VITE_OPENAI_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
