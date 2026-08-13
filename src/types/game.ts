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

/** Fields the owner fills or edits on add/edit forms */
export type GameInput = Omit<Game, 'id' | 'createdAt' | 'updatedAt'>

export type TimeBucketId = '30' | '45' | '60' | '90' | 'long'
export type WeightBucketId = '1-2' | '2-3' | '3-5'

export type GameFilters = {
  nameQuery: string
  /** Selected player counts; 5 means 5+ */
  playerCounts: number[]
  timeBuckets: TimeBucketId[]
  categories: string[]
  weightBuckets: WeightBucketId[]
  favoritesOnly: boolean
}
