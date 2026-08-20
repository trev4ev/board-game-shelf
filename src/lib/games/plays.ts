import { supabase } from '../supabase'
import type { Game } from '../../types/game'
import type { Play, PlayInput, PlayPlayer } from '../../types/play'
import { patchGame } from './api'

function requireClient() {
  if (!supabase) {
    throw new Error('Supabase is not configured')
  }
  return supabase
}

type PlayRow = {
  id: string
  game_id: string
  played_on: string
  players: unknown
  created_at: string
}

function asPlayers(value: unknown): PlayPlayer[] {
  if (!Array.isArray(value)) return []
  const players: PlayPlayer[] = []
  for (const item of value) {
    if (!item || typeof item !== 'object') continue
    const row = item as {
      name?: unknown
      place?: unknown
      score?: unknown
      userId?: unknown
      user_id?: unknown
    }
    if (typeof row.name !== 'string' || !row.name.trim()) continue
    const place = typeof row.place === 'number' && Number.isFinite(row.place) ? row.place : players.length + 1
    const score =
      typeof row.score === 'number' && Number.isFinite(row.score) ? row.score : null
    const tagged =
      typeof row.userId === 'string'
        ? row.userId
        : typeof row.user_id === 'string'
          ? row.user_id
          : null
    players.push({ name: row.name.trim(), place, score, userId: tagged })
  }
  return players
}

function rowToPlay(row: PlayRow): Play {
  return {
    id: row.id,
    gameId: row.game_id,
    playedOn: row.played_on,
    players: asPlayers(row.players),
    createdAt: row.created_at,
  }
}

export async function listPlays(gameId: string): Promise<Play[]> {
  const client = requireClient()
  const { data, error } = await client
    .from('plays')
    .select('*')
    .eq('game_id', gameId)
    .order('played_on', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) throw error
  return ((data ?? []) as PlayRow[]).map(rowToPlay)
}

export async function createPlay(input: PlayInput, game: Game): Promise<Game> {
  const client = requireClient()
  const { error } = await client.from('plays').insert({
    game_id: input.gameId,
    played_on: input.playedOn,
    players: input.players,
  })
  if (error) throw error

  const lastPlayed =
    !game.lastPlayed || input.playedOn >= game.lastPlayed
      ? input.playedOn
      : game.lastPlayed

  return patchGame(game.id, {
    playCount: game.playCount + 1,
    lastPlayed,
  })
}
