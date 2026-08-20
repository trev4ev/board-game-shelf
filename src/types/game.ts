/**
 * Game record stored in Supabase.
 * Catalog fields align with BGG thing+stats so Phase B can prefill the same shape.
 */
export type Game = {
  id: string
  collectionId: string
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
  /** BGG averageweight (~1.00–5.00); shown as complexity */
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

/** Fields filled on add/edit forms (collection comes from the current shelf) */
export type GameInput = Omit<Game, 'id' | 'collectionId' | 'createdAt' | 'updatedAt'>

export type GameFilters = {
  nameQuery: string
  playerMin: number
  playerMax: number
  timeMin: number
  timeMax: number
  complexityMin: number
  complexityMax: number
  categories: string[]
  favoritesOnly: boolean
}
