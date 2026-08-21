export type PlayPlayer = {
  name: string
  place: number
  score: number | null
  userId: string | null
}

export type Play = {
  id: string
  gameId: string
  playedOn: string
  players: PlayPlayer[]
  createdAt: string
}

export type PlayInput = {
  gameId: string
  playedOn: string
  players: PlayPlayer[]
}
