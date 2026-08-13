import { createHttpGameLookup } from './client'
import { stubGameLookup } from './stub'
import type { GameLookup } from './types'

export type {
  GameLookup,
  GameLookupDetails,
  GameLookupResult,
} from './types'
export { GameLookupUnavailableError } from './types'

/**
 * Local/dev: set true to use the Vite `/api/bgg` proxy (token stays server-side).
 * Production: keep false until the Supabase Edge Function is deployed.
 */
export const isBggLookupEnabled =
  import.meta.env.VITE_BGG_LOOKUP_ENABLED === 'true'

export const gameLookup: GameLookup = isBggLookupEnabled
  ? createHttpGameLookup()
  : stubGameLookup
