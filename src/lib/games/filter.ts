import { COMPLEXITY_MAX, COMPLEXITY_MIN } from '../complexity'
import type { Game, GameFilters } from '../../types/game'

export const PLAYER_SLIDER_MIN = 1
export const PLAYER_SLIDER_MAX = 10
export const TIME_SLIDER_MIN = 0
export const TIME_SLIDER_MAX = 180
export const TIME_SLIDER_STEP = 15
export const COMPLEXITY_SLIDER_STEP = 0.1

export function emptyFilters(): GameFilters {
  return {
    nameQuery: '',
    playerMin: PLAYER_SLIDER_MIN,
    playerMax: PLAYER_SLIDER_MAX,
    timeMin: TIME_SLIDER_MIN,
    timeMax: TIME_SLIDER_MAX,
    complexityMin: COMPLEXITY_MIN,
    complexityMax: COMPLEXITY_MAX,
    categories: [],
    favoritesOnly: false,
  }
}

export function filtersAreActive(filters: GameFilters): boolean {
  const defaults = emptyFilters()
  return (
    filters.nameQuery.trim() !== '' ||
    filters.playerMin !== defaults.playerMin ||
    filters.playerMax !== defaults.playerMax ||
    filters.timeMin !== defaults.timeMin ||
    filters.timeMax !== defaults.timeMax ||
    filters.complexityMin !== defaults.complexityMin ||
    filters.complexityMax !== defaults.complexityMax ||
    filters.categories.length > 0 ||
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

export function applicableCategories(
  games: Game[],
  filters: GameFilters,
): string[] {
  const matching = filterGames(games, { ...filters, categories: [] })
  const set = new Set(uniqueCategories(matching))
  for (const category of filters.categories) {
    if (category) set.add(category)
  }
  return [...set].sort((a, b) => a.localeCompare(b))
}

function playMinutes(game: Game): number | null {
  return game.playTime ?? game.maxPlayTime ?? game.minPlayTime
}

function playerRangeOverlaps(game: Game, filterMin: number, filterMax: number) {
  if (game.minPlayers == null && game.maxPlayers == null) return false
  const gameMin = game.minPlayers ?? PLAYER_SLIDER_MIN
  const gameMax =
    game.maxPlayers ??
    (filterMax >= PLAYER_SLIDER_MAX ? Number.POSITIVE_INFINITY : PLAYER_SLIDER_MAX)
  const maxBound =
    filterMax >= PLAYER_SLIDER_MAX ? Number.POSITIVE_INFINITY : filterMax
  return gameMin <= maxBound && gameMax >= filterMin
}

function timeInRange(game: Game, filterMin: number, filterMax: number) {
  const minutes = playMinutes(game)
  if (minutes == null) return false
  const maxBound =
    filterMax >= TIME_SLIDER_MAX ? Number.POSITIVE_INFINITY : filterMax
  return minutes >= filterMin && minutes <= maxBound
}

export function filterGames(games: Game[], filters: GameFilters): Game[] {
  const query = filters.nameQuery.trim().toLowerCase()
  const defaults = emptyFilters()
  const playersActive =
    filters.playerMin !== defaults.playerMin ||
    filters.playerMax !== defaults.playerMax
  const timeActive =
    filters.timeMin !== defaults.timeMin || filters.timeMax !== defaults.timeMax
  const complexityActive =
    filters.complexityMin !== defaults.complexityMin ||
    filters.complexityMax !== defaults.complexityMax

  return games.filter((game) => {
    if (query && !game.name.toLowerCase().includes(query)) return false
    if (filters.favoritesOnly && !game.isFavorite) return false

    if (
      playersActive &&
      !playerRangeOverlaps(game, filters.playerMin, filters.playerMax)
    ) {
      return false
    }

    if (timeActive && !timeInRange(game, filters.timeMin, filters.timeMax)) {
      return false
    }

    if (filters.categories.length > 0) {
      const ok = filters.categories.some((category) =>
        game.categories.includes(category),
      )
      if (!ok) return false
    }

    if (complexityActive) {
      if (game.weight == null) return false
      if (
        game.weight < filters.complexityMin ||
        game.weight > filters.complexityMax
      ) {
        return false
      }
    }

    return true
  })
}

export function pickRandomGame(games: Game[]): Game | null {
  if (games.length === 0) return null
  const index = Math.floor(Math.random() * games.length)
  return games[index] ?? null
}

export function formatPlayerFilter(value: number): string {
  return value >= PLAYER_SLIDER_MAX ? `${PLAYER_SLIDER_MAX}+` : String(value)
}

export function formatTimeFilter(value: number): string {
  if (value >= TIME_SLIDER_MAX) return `${TIME_SLIDER_MAX}+ min`
  return `${value} min`
}
