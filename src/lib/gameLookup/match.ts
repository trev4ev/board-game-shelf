import type { GameLookupDetails, GameLookupResult } from './types'

/** Minimum Dice/token score to accept a BGG hit as a match. */
export const MIN_MATCH_SCORE = 0.5

/** Hits this close to the best name score are treated as ties. */
export const TIE_SCORE_DELTA = 0.04

const MAX_FINALISTS = 5

export function normalizeGameName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function bigrams(value: string): string[] {
  const grams: string[] = []
  for (let i = 0; i < value.length - 1; i++) {
    grams.push(value.slice(i, i + 2))
  }
  return grams
}

function diceCoefficient(a: string, b: string): number {
  if (a === b) return 1
  if (a.length < 2 || b.length < 2) return 0
  const left = bigrams(a)
  const rightCounts = new Map<string, number>()
  for (const gram of bigrams(b)) {
    rightCounts.set(gram, (rightCounts.get(gram) ?? 0) + 1)
  }
  let overlap = 0
  for (const gram of left) {
    const count = rightCounts.get(gram) ?? 0
    if (count > 0) {
      overlap += 1
      rightCounts.set(gram, count - 1)
    }
  }
  return (2 * overlap) / (left.length + bigrams(b).length)
}

/**
 * 0–1 score for how closely a BGG primary name matches the user-provided name.
 * Exact normalized names win; extra subtitle words (typical of expansions) are
 * penalized so "Catan" prefers "Catan" over "Catan: Cities & Knights".
 */
export function scoreNameMatch(query: string, candidateName: string): number {
  const q = normalizeGameName(query)
  const n = normalizeGameName(candidateName)
  if (!q || !n) return 0
  if (q === n) return 1

  const qTokens = q.split(' ')
  const nTokens = n.split(' ')
  const nSet = new Set(nTokens)
  const covered = qTokens.filter((token) => nSet.has(token)).length / qTokens.length
  const extraRatio = Math.max(0, nTokens.length - qTokens.length) / nTokens.length
  const dice = diceCoefficient(q, n)
  const isPrefix = n.startsWith(`${q} `)

  let score = 0.5 * dice + 0.5 * covered
  if (isPrefix) score = Math.max(score, 0.82)
  score *= 1 - 0.25 * extraRatio
  return Math.min(1, score)
}

export type RankedLookupHit = {
  hit: GameLookupResult
  score: number
}

export function rankNameMatches(
  query: string,
  hits: GameLookupResult[],
): RankedLookupHit[] {
  return hits
    .map((hit) => ({ hit, score: scoreNameMatch(query, hit.name) }))
    .filter((row) => row.score >= MIN_MATCH_SCORE)
    .sort((a, b) => {
      const byScore = b.score - a.score
      if (byScore !== 0) return byScore
      const byLength = a.hit.name.length - b.hit.name.length
      if (byLength !== 0) return byLength
      return (b.hit.yearPublished ?? 0) - (a.hit.yearPublished ?? 0)
    })
}

/** Best name match, plus near-ties that popularity can break. */
export function pickNameFinalists(
  query: string,
  hits: GameLookupResult[],
): RankedLookupHit[] {
  const ranked = rankNameMatches(query, hits)
  const best = ranked[0]
  if (!best) return []
  return ranked
    .filter((row) => best.score - row.score <= TIE_SCORE_DELTA)
    .slice(0, MAX_FINALISTS)
}

/**
 * Among equally close names, prefer the game more people have rated
 * (`usersRated` from thing+stats). Falls back to newer year, then shorter name.
 */
export function pickMostPopular(
  details: GameLookupDetails[],
  scores: ReadonlyMap<number, number>,
): GameLookupDetails {
  if (details.length === 0) {
    throw new Error('pickMostPopular requires at least one game')
  }
  return [...details].sort((a, b) => {
    const byScore = (scores.get(b.bggId) ?? 0) - (scores.get(a.bggId) ?? 0)
    if (byScore !== 0) return byScore
    const byPopularity = (b.usersRated ?? -1) - (a.usersRated ?? -1)
    if (byPopularity !== 0) return byPopularity
    const byYear = (b.yearPublished ?? 0) - (a.yearPublished ?? 0)
    if (byYear !== 0) return byYear
    return a.name.length - b.name.length
  })[0]!
}
