import { pickMostPopular, pickNameFinalists } from './match'
import type { GameLookup, GameLookupDetails } from './types'

export type BulkMatchStatus =
  | 'matched'
  | 'unmatched'
  | 'already_in_collection'
  | 'error'

export type BulkMatchRow = {
  query: string
  status: BulkMatchStatus
  details?: GameLookupDetails
  score?: number
  error?: string
  selected: boolean
}

export async function matchGameName(
  query: string,
  lookup: GameLookup,
  existingBggIds: ReadonlySet<number> = new Set(),
): Promise<BulkMatchRow> {
  const trimmed = query.trim()
  try {
    const hits = await lookup.searchGames(trimmed)
    const finalists = pickNameFinalists(trimmed, hits)
    const best = finalists[0]
    if (!best) {
      return { query: trimmed, status: 'unmatched', selected: false }
    }

    const detailsList: GameLookupDetails[] = []
    for (const finalist of finalists) {
      detailsList.push(await lookup.getGameDetails(finalist.hit.bggId))
    }
    const scores = new Map(
      finalists.map((finalist) => [finalist.hit.bggId, finalist.score]),
    )
    const details = pickMostPopular(detailsList, scores)
    const score = scores.get(details.bggId) ?? best.score
    const already = existingBggIds.has(details.bggId)
    return {
      query: trimmed,
      status: already ? 'already_in_collection' : 'matched',
      details,
      score,
      selected: !already,
    }
  } catch (err) {
    return {
      query: trimmed,
      status: 'error',
      error: err instanceof Error ? err.message : 'Lookup failed',
      selected: false,
    }
  }
}
