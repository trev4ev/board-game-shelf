import { createHttpGameLookup } from './client'
import { stubGameLookup } from './stub'
import type { GameLookup } from './types'

export type {
  GameLookup,
  GameLookupDetails,
  GameLookupResult,
} from './types'
export { GameLookupUnavailableError } from './types'
export {
  MIN_MATCH_SCORE,
  TIE_SCORE_DELTA,
  normalizeGameName,
  pickMostPopular,
  pickNameFinalists,
  rankNameMatches,
  scoreNameMatch,
} from './match'
export { parseGameNameList } from './parseNames'
export { matchGameName } from './bulk'
export type { BulkMatchRow, BulkMatchStatus } from './bulk'

/**
 * Local/dev: Vite `/api/bgg` proxy (token stays on the Vite server).
 * Production: Supabase Edge Function `/functions/v1/bgg`.
 */
export const isBggLookupEnabled =
  import.meta.env.VITE_BGG_LOOKUP_ENABLED === 'true'

export function bggLookupBaseUrl(): string {
  if (import.meta.env.DEV) return '/api/bgg'
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  if (!supabaseUrl) return '/api/bgg'
  return `${supabaseUrl.replace(/\/$/, '')}/functions/v1/bgg`
}

export const gameLookup: GameLookup = isBggLookupEnabled
  ? createHttpGameLookup(bggLookupBaseUrl())
  : stubGameLookup