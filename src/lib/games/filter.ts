import { COMPLEXITY_MAX, COMPLEXITY_MIN } from '../complexity'
import type { Game, GameFilters, TimeBucketId, WeightBucketId } from '../../types/game'

export const PLAYER_FILTER_OPTIONS = [
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
  { value: 5, label: '5+' },
] as const

export const TIME_FILTER_OPTIONS: { id: TimeBucketId; label: string }[] = [
  { id: '30', label: '≤ 30 min' },
  { id: '45', label: '≤ 45 min' },
  { id: '60', label: '≤ 60 min' },
  { id: '90', label: '≤ 90 min' },
  { id: 'long', label: '90+ min' },
]

export const WEIGHT_FILTER_OPTIONS: {
  id: WeightBucketId
  label: string
  min: number
  max: number
}[] = [
  { id: '1-2', label: `${COMPLEXITY_MIN}–2 light`, min: COMPLEXITY_MIN, max: 2 },
  { id: '2-3', label: '2–3 medium', min: 2, max: 3 },
  { id: '3-5', label: `3–${COMPLEXITY_MAX} heavy`, min: 3, max: COMPLEXITY_MAX },
]

export function emptyFilters(): GameFilters {
  return {
    nameQuery: '',
    playerCounts: [],
    timeBuckets: [],
    categories: [],
    weightBuckets: [],
    favoritesOnly: false,
  }
}

export function filtersAreActive(filters: GameFilters): boolean {
  return (
    filters.nameQuery.trim() !== '' ||
    filters.playerCounts.length > 0 ||
    filters.timeBuckets.length > 0 ||
    filters.categories.length > 0 ||
    filters.weightBuckets.length > 0 ||
    filters.favoritesOnly
  )
}

export function uniqueCategories(games: Game[]): string[] {
  const set = new Set<string>()
  for (const game of games) {
    for (const category of game.categories) {
      if (category) set.add(category)
    }
  }
  return [...set].sort((a, b) => a.localeCompare(b))
}

function supportsPlayerCount(game: Game, count: number): boolean {
  const min = game.minPlayers
  const max = game.maxPlayers
  if (count >= 5) {
    if (max == null) return min == null || min <= 5
    return max >= 5
  }
  if (min == null && max == null) return false
  const lo = min ?? 1
  const hi = max ?? 99
  return count >= lo && count <= hi
}

function playMinutes(game: Game): number | null {
  return game.playTime ?? game.maxPlayTime ?? game.minPlayTime
}

function matchesTimeBucket(minutes: number, bucket: TimeBucketId): boolean {
  switch (bucket) {
    case '30':
      return minutes <= 30
    case '45':
      return minutes <= 45
    case '60':
      return minutes <= 60
    case '90':
      return minutes <= 90
    case 'long':
      return minutes >= 90
  }
}

function matchesWeight(weight: number, bucket: WeightBucketId): boolean {
  const option = WEIGHT_FILTER_OPTIONS.find((item) => item.id === bucket)
  if (!option) return false
  return weight >= option.min && weight <= option.max
}

export function filterGames(games: Game[], filters: GameFilters): Game[] {
  const query = filters.nameQuery.trim().toLowerCase()

  return games.filter((game) => {
    if (query && !game.name.toLowerCase().includes(query)) return false
    if (filters.favoritesOnly && !game.isFavorite) return false

    if (filters.playerCounts.length > 0) {
      const ok = filters.playerCounts.some((count) =>
        supportsPlayerCount(game, count),
      )
      if (!ok) return false
    }

    if (filters.timeBuckets.length > 0) {
      const minutes = playMinutes(game)
      if (minutes == null) return false
      const ok = filters.timeBuckets.some((bucket) =>
        matchesTimeBucket(minutes, bucket),
      )
      if (!ok) return false
    }

    if (filters.categories.length > 0) {
      const ok = filters.categories.some((category) =>
        game.categories.includes(category),
      )
      if (!ok) return false
    }

    if (filters.weightBuckets.length > 0) {
      if (game.weight == null) return false
      const ok = filters.weightBuckets.some((bucket) =>
        matchesWeight(game.weight!, bucket),
      )
      if (!ok) return false
    }

    return true
  })
}

export function pickRandomGame(games: Game[]): Game | null {
  if (games.length === 0) return null
  const index = Math.floor(Math.random() * games.length)
  return games[index] ?? null
}