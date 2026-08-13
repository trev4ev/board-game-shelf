import { Brain, ChevronRight, Clock, Star, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatComplexity } from '../lib/complexity'
import { formatPlayTime, formatPlayerRange } from '../lib/games/display'
import type { Game } from '../types/game'
import './GameRow.css'

export function GameRow({ game }: { game: Game }) {
  const time = formatPlayTime(game)

  return (
    <Link to={`/games/${game.id}`} className="game-row">
      {game.thumbnailUrl ? (
        <img src={game.thumbnailUrl} alt="" className="game-row-thumb" />
      ) : (
        <span className="game-row-thumb game-row-placeholder" aria-hidden />
      )}
      <span className="game-row-body">
        <span className="game-row-title">
          {game.name}
          <Star
            className={game.isFavorite ? 'game-row-star on' : 'game-row-star'}
            size={16}
            strokeWidth={2}
            fill={game.isFavorite ? 'currentColor' : 'none'}
            aria-hidden
          />
        </span>
        <span className="game-row-meta">
          <span>
            <Users size={14} strokeWidth={2} aria-hidden />
            {formatPlayerRange(game)}
          </span>
          {time ? (
            <span>
              <Clock size={14} strokeWidth={2} aria-hidden />
              {time}
            </span>
          ) : null}
          {game.weight != null ? (
            <span>
              <Brain size={14} strokeWidth={2} aria-hidden />
              {formatComplexity(game.weight)}
            </span>
          ) : null}
        </span>
      </span>
      <ChevronRight className="game-row-chevron" size={18} strokeWidth={2} aria-hidden />
    </Link>
  )
}
