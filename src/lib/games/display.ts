import type { Game } from '../../types/game'

export function formatPlayerRange(game: Game): string {
  return `${game.minPlayers ?? '?'}–${game.maxPlayers ?? '?'} players`
}

export function formatPlayTime(game: Game): string | null {
  const minutes = game.playTime ?? game.maxPlayTime ?? game.minPlayTime
  if (minutes == null) return null
  return `${minutes} min`
}

export function groupGamesByLetter(games: Game[]): [string, Game[]][] {
  const groups = new Map<string, Game[]>()
  for (const game of games) {
    const first = game.name.trim().charAt(0).toUpperCase()
    const key = /[A-Z]/.test(first) ? first : '#'
    const list = groups.get(key)
    if (list) list.push(game)
    else groups.set(key, [game])
  }
  return [...groups.entries()]
}
