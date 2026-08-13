import { supabase } from '../supabase'
import type { Game, GameInput } from '../../types/game'
import { gameInputToRow, rowToGame, type GameRow } from './map'
import type { GameLookupDetails } from '../gameLookup'

function requireClient() {
  if (!supabase) {
    throw new Error('Supabase is not configured')
  }
  return supabase
}

export async function listGames(): Promise<Game[]> {
  const client = requireClient()
  const { data, error } = await client
    .from('games')
    .select('*')
    .order('name', { ascending: true })

  if (error) throw error
  return ((data ?? []) as GameRow[]).map(rowToGame)
}

export async function getGame(id: string): Promise<Game | null> {
  const client = requireClient()
  const { data, error } = await client
    .from('games')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return data ? rowToGame(data as GameRow) : null
}

export async function createGame(input: GameInput): Promise<Game> {
  const client = requireClient()
  const { data, error } = await client
    .from('games')
    .insert(gameInputToRow(input))
    .select('*')
    .single()

  if (error) throw error
  return rowToGame(data as GameRow)
}

export async function replaceGame(id: string, input: GameInput): Promise<Game> {
  const client = requireClient()
  const { data, error } = await client
    .from('games')
    .update(gameInputToRow(input))
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw error
  return rowToGame(data as GameRow)
}

export async function deleteGame(id: string): Promise<void> {
  const client = requireClient()
  const { error } = await client.from('games').delete().eq('id', id)
  if (error) throw error
}

export function detailsToGameInput(
  details: GameLookupDetails,
  extras: Partial<
    Pick<GameInput, 'notes' | 'isFavorite' | 'playCount' | 'lastPlayed'>
  > = {},
): GameInput {
  return {
    bggId: details.bggId,
    name: details.name,
    yearPublished: details.yearPublished,
    description: details.description,
    minPlayers: details.minPlayers,
    maxPlayers: details.maxPlayers,
    minPlayTime: details.minPlayTime,
    maxPlayTime: details.maxPlayTime,
    playTime: details.playTime,
    minAge: details.minAge,
    categories: details.categories,
    mechanics: details.mechanics,
    bggRating: details.bggRating,
    weight: details.weight,
    thumbnailUrl: details.thumbnailUrl,
    imageUrl: details.imageUrl,
    lastPlayed: extras.lastPlayed ?? null,
    playCount: extras.playCount ?? 0,
    isFavorite: extras.isFavorite ?? false,
    notes: extras.notes ?? null,
  }
}
