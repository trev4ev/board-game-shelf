/**
 * Lookup DTOs — BGG maps into these in Phase B.
 * The rest of the app never imports BGG XML types.
 */

export type GameLookupResult = {
  bggId: number
  name: string
  yearPublished?: number
}

/** Catalog subset returned by thing lookup; merges into the add form */
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
  /** BGG usersrated — popularity proxy; search does not include this */
  usersRated: number | null
}

export interface GameLookup {
  searchGames(query: string): Promise<GameLookupResult[]>
  getGameDetails(bggId: number): Promise<GameLookupDetails>
}

export class GameLookupUnavailableError extends Error {
  constructor(message = 'BoardGameGeek lookup is not enabled yet') {
    super(message)
    this.name = 'GameLookupUnavailableError'
  }
}
