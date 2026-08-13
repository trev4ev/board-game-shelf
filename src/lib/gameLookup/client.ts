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

/**
 * Calls the local Vite BGG proxy in dev (and later the Edge Function URL).
 * Token never enters this module.
 */
export function createHttpGameLookup(baseUrl = '/api/bgg'): GameLookup {
  return {
    async searchGames(query: string): Promise<GameLookupResult[]> {
      const params = new URLSearchParams({ q: query })
      const response = await fetch(`${baseUrl}/search?${params}`)
      return readJson<GameLookupResult[]>(response)
    },

    async getGameDetails(bggId: number): Promise<GameLookupDetails> {
      const params = new URLSearchParams({ id: String(bggId) })
      const response = await fetch(`${baseUrl}/thing?${params}`)
      return readJson<GameLookupDetails>(response)
    },
  }
}
