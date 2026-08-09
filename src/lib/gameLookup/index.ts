import { stubGameLookup } from './stub'
import type { GameLookup } from './types'

export type {
  GameLookup,
  GameLookupDetails,
  GameLookupResult,
} from './types'
export { GameLookupUnavailableError } from './types'

/**
 * Feature flag for Phase B. Keep false until the Edge Function + token exist.
 * When enabling, replace stubGameLookup with an HTTP client to the Edge Function.
 */
export const isBggLookupEnabled =
  import.meta.env.VITE_BGG_LOOKUP_ENABLED === 'true'

export const gameLookup: GameLookup = stubGameLookup
