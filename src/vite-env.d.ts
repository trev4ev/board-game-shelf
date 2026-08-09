/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  /** Set to "true" when BGG Edge Function + token are ready (Phase B) */
  readonly VITE_BGG_LOOKUP_ENABLED: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
