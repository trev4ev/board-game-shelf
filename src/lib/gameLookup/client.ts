import type { GameLookup, GameLookupDetails, GameLookupResult } from './types'

async function readJson<T>(response: Response): Promise<T> {
  const data: unknown = await response.json()
  if (!response.ok) {
    const message =
      typeof data === 'object' &&
      data !== null &&
      'error' in data &&
      typeof (data as { error: unknown }).error === 'string'
        ? (data as { error: string }).error
        : `Lookup failed (${response.status})`
    throw new Error(message)
  }
  return data as T
}

function lookupHeaders(): HeadersInit {
  const key =
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    import.meta.env.VITE_SUPABASE_ANON_KEY
  if (!key) return {}
  return {
    Authorization: `Bearer ${key}`,
    apikey: key,
  }
}

/**
 * Local Vite proxy (`/api/bgg`) or the production Edge Function.
 * Token never enters this module.
 */
export function createHttpGameLookup(baseUrl: string): GameLookup {
  return {
    async searchGames(query: string): Promise<GameLookupResult[]> {
      const params = new URLSearchParams({ q: query })
      const response = await fetch(`${baseUrl}/search?${params}`, {
        headers: lookupHeaders(),
      })
      return readJson<GameLookupResult[]>(response)
    },

    async getGameDetails(bggId: number): Promise<GameLookupDetails> {
      const params = new URLSearchParams({ id: String(bggId) })
      const response = await fetch(`${baseUrl}/thing?${params}`, {
        headers: lookupHeaders(),
      })
      return readJson<GameLookupDetails>(response)
    },
  }
}