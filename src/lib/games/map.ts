import type { Game, GameInput } from '../../types/game'

/** Row shape returned by PostgREST (snake_case) */
export type GameRow = {
  id: string
  collection_id: string
  bgg_id: number | null
  name: string
  year_published: number | null
  description: string | null
  min_players: number | null
  max_players: number | null
  min_play_time: number | null
  max_play_time: number | null
  play_time: number | null
  min_age: number | null
  categories: string[] | null
  mechanics: string[] | null
  bgg_rating: number | null
  weight: number | null
  thumbnail_url: string | null
  image_url: string | null
  last_played: string | null
  play_count: number
  is_favorite: boolean
  notes: string | null
  created_at: string
  updated_at: string
}

export function rowToGame(row: GameRow): Game {
  return {
    id: row.id,
    collectionId: row.collection_id,
    bggId: row.bgg_id,
    name: row.name,
    yearPublished: row.year_published,
    description: row.description,
    minPlayers: row.min_players,
    maxPlayers: row.max_players,
    minPlayTime: row.min_play_time,
    maxPlayTime: row.max_play_time,
    playTime: row.play_time,
    minAge: row.min_age,
    categories: row.categories ?? [],
    mechanics: row.mechanics ?? [],
    bggRating: row.bgg_rating,
    weight: row.weight,
    thumbnailUrl: row.thumbnail_url,
    imageUrl: row.image_url,
    lastPlayed: row.last_played,
    playCount: row.play_count,
    isFavorite: row.is_favorite,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function gameInputToRow(
  input: GameInput,
): Omit<GameRow, 'id' | 'collection_id' | 'created_at' | 'updated_at'> {
  return {
    bgg_id: input.bggId,
    name: input.name.trim(),
    year_published: input.yearPublished,
    description: input.description,
    min_players: input.minPlayers,
    max_players: input.maxPlayers,
    min_play_time: input.minPlayTime,
    max_play_time: input.maxPlayTime,
    play_time: input.playTime,
    min_age: input.minAge,
    categories: input.categories,
    mechanics: input.mechanics,
    bgg_rating: input.bggRating,
    weight: input.weight,
    thumbnail_url: input.thumbnailUrl,
    image_url: input.imageUrl,
    last_played: input.lastPlayed,
    play_count: input.playCount,
    is_favorite: input.isFavorite,
    notes: input.notes,
  }
}
