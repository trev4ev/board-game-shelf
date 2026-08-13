/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  /** Publishable key (sb_publishable_...). Prefer this over legacy anon. */
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string
  /** @deprecated Use VITE_SUPABASE_PUBLISHABLE_KEY */
  readonly VITE_SUPABASE_ANON_KEY?: string
  /** Set to "true" for BGG search (Vite proxy locally, Edge Function in production) */
  readonly VITE_BGG_LOOKUP_ENABLED: string
  readonly VITE_BGG_LOOKUP_ENABLED: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
