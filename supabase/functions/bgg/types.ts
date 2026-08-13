export type GameLookupResult = {
  bggId: number
  name: string
  yearPublished?: number
}

export type GameLookupDetails = {
  bggId: number
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
  bggRating: number | null
  weight: number | null
  thumbnailUrl: string | null
  imageUrl: string | null
}