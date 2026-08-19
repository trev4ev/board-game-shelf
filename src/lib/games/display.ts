import type { Game } from '../../types/game'

export function formatPlayerRange(game: Game): string {
  return `${game.minPlayers ?? '?'}–${game.maxPlayers ?? '?'} players`
}

export function formatPlayTime(game: Game): string | null {
  const minutes = game.playTime ?? game.maxPlayTime ?? game.minPlayTime
  if (minutes == null) return null
  return `${minutes} min`
}

export function todayIsoDate(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function formatLastPlayed(iso: string | null): string {
  if (!iso) return '—'
  const [year, month, day] = iso.split('-').map(Number)
  if (!year || !month || !day) return iso
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatPlace(place: number): string {
  const teens = place % 100
  if (teens >= 11 && teens <= 13) return `${place}th`
  switch (place % 10) {
    case 1:
      return `${place}st`
    case 2:
      return `${place}nd`
    case 3:
      return `${place}rd`
    default:
      return `${place}th`
  }
}
