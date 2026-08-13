import { supabase } from '../supabase'
import type { Game, GameInput } from '../../types/game'
import { gameInputToRow, rowToGame, type GameRow } from './map'
import type { GameLookupDetails } from '../gameLookup'
import { roundDecimal, roundInt } from './round'

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

export async function patchGame(
  id: string,
  patch: Partial<Pick<GameInput, 'notes' | 'isFavorite'>>,
): Promise<Game> {
  const client = requireClient()
  const row: Record<string, unknown> = {}
  if ('notes' in patch) row.notes = patch.notes
  if ('isFavorite' in patch) row.is_favorite = patch.isFavorite

  const { data, error } = await client
    .from('games')
    .update(row)
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw error
  return rowToGame(data as GameRow)
}

export function detailsToGameInput(
  details: GameLookupDetails,
  extras: Partial<
    Pick<GameInput, 'notes' | 'isFavorite' | 'playCount' | 'lastPlayed'>
  > = {},
): GameInput {
  return {
    bggId: roundInt(details.bggId) ?? details.bggId,
    name: details.name,
    yearPublished: roundInt(details.yearPublished),
    description: details.description,
    minPlayers: roundInt(details.minPlayers),
    maxPlayers: roundInt(details.maxPlayers),
    minPlayTime: roundInt(details.minPlayTime),
    maxPlayTime: roundInt(details.maxPlayTime),
    playTime: roundInt(details.playTime),
    minAge: roundInt(details.minAge),
    categories: details.categories,
    mechanics: details.mechanics,
    bggRating: roundDecimal(details.bggRating, 2),
    weight: roundDecimal(details.weight, 2),
    thumbnailUrl: details.thumbnailUrl,
    imageUrl: details.imageUrl,
    lastPlayed: extras.lastPlayed ?? null,
    playCount: extras.playCount ?? 0,
    isFavorite: extras.isFavorite ?? false,
    notes: extras.notes ?? null,
  }
}
