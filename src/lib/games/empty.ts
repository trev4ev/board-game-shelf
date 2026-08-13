import type { Game, GameInput } from '../../types/game'

export function emptyGameInput(): GameInput {
  return {
    bggId: null,
    name: '',
    yearPublished: null,
    description: null,
    minPlayers: null,
    maxPlayers: null,
    minPlayTime: null,
    maxPlayTime: null,
    playTime: null,
    minAge: null,
    categories: [],
    mechanics: [],
    bggRating: null,
    weight: null,
    thumbnailUrl: null,
    imageUrl: null,
    lastPlayed: null,
    playCount: 0,
    isFavorite: false,
    notes: null,
  }
}

export function gameToInput(game: Game): GameInput {
  return {
    bggId: game.bggId,
    name: game.name,
    yearPublished: game.yearPublished,
    description: game.description,
    minPlayers: game.minPlayers,
    maxPlayers: game.maxPlayers,
    minPlayTime: game.minPlayTime,
    maxPlayTime: game.maxPlayTime,
    playTime: game.playTime,
    minAge: game.minAge,
    categories: game.categories,
    mechanics: game.mechanics,
    bggRating: game.bggRating,
    weight: game.weight,
    thumbnailUrl: game.thumbnailUrl,
    imageUrl: game.imageUrl,
    lastPlayed: game.lastPlayed,
    playCount: game.playCount,
    isFavorite: game.isFavorite,
    notes: game.notes,
  }
}