import type { GameLookup } from './types'
import { GameLookupUnavailableError } from './types'

/**
 * Phase A stub — no network calls.
 * Swap for a real client in Phase B when VITE_BGG_LOOKUP_ENABLED=true
 * and the Supabase Edge Function is deployed.
 */
export const stubGameLookup: GameLookup = {
  async searchGames(_query: string) {
    throw new GameLookupUnavailableError()
  },
  async getGameDetails(_bggId: number) {
    throw new GameLookupUnavailableError()
  },
}
