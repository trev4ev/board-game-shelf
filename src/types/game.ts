/**
 * Game record stored in Supabase.
 * Catalog fields align with BGG thing+stats so Phase B can prefill the same shape.
 */
export type Game = {
  id: string
  bggId: number | null
  name: string
  yearPublished: number | null
  description: string | null
  minPlayers: number | null
  maxPlayers: number | null
  minPlayTime: number | null
  maxPlayTime: number | null
  playTime: number | null
  minAge: number | null
  categories: string[]
  mechanics: string[]
  /** BGG average rating (~1–10) */
  bggRating: number | null
  /** BGG averageweight (~1.00–5.00) */
  weight: number | null
  thumbnailUrl: string | null
  imageUrl: string | null
  lastPlayed: string | null
  playCount: number
  isFavorite: boolean
  notes: string | null
  createdAt: string
  updatedAt: string
}

/** Fields the owner fills or edits on add/edit forms */
export type GameInput = Omit<Game, 'id' | 'createdAt' | 'updatedAt'>

export type GameFilters = {
  nameQuery?: string
  playerCount?: number
  maxPlayTime?: number
  categories?: string[]
  /** Inclusive weight range matching BGG scale */
  minWeight?: number
  maxWeight?: number
  favoritesOnly?: boolean
}
