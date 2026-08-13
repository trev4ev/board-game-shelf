import type { Game, GameInput } from '../../types/game'
import { roundDecimal, roundInt } from './round'

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
    bggId: roundInt(game.bggId),
    name: game.name,
    yearPublished: roundInt(game.yearPublished),
    description: game.description,
    minPlayers: roundInt(game.minPlayers),
    maxPlayers: roundInt(game.maxPlayers),
    minPlayTime: roundInt(game.minPlayTime),
    maxPlayTime: roundInt(game.maxPlayTime),
    playTime: roundInt(game.playTime),
    minAge: roundInt(game.minAge),
    categories: game.categories,
    mechanics: game.mechanics,
    bggRating: roundDecimal(game.bggRating, 2),
    weight: roundDecimal(game.weight, 2),
    thumbnailUrl: game.thumbnailUrl,
    imageUrl: game.imageUrl,
    lastPlayed: game.lastPlayed,
    playCount: game.playCount,
    isFavorite: game.isFavorite,
    notes: game.notes,
  }
}