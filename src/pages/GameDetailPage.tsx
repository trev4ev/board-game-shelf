import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { complexityFieldLabel, formatComplexity } from '../lib/complexity'
import { getGame } from '../lib/games'
import type { Game } from '../types/game'
import './GameDetailPage.css'

export function GameDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [game, setGame] = useState<Game | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    getGame(id)
      .then((row) => {
        if (!cancelled) {
          setGame(row)
          setError(row ? null : 'Game not found')
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) {
    return (
      <section>
        <h1>Game detail</h1>
        <p className="hint">Loading…</p>
      </section>
    )
  }

  if (error || !game) {
    return (
      <section>
        <h1>Game detail</h1>
        <p className="error">{error ?? 'Not found'}</p>
        <Link to="/">Back to collection</Link>
      </section>
    )
  }

  return (
    <section className="game-detail">
      <p className="hint">
        <Link to="/">← Collection</Link>
        {user && (
          <>
            {' · '}
            <Link to={`/games/${game.id}/edit`}>Edit</Link>
          </>
        )}
      </p>
      <h1>
        {game.name}
        {game.isFavorite ? ' ★' : ''}
      </h1>
      {(game.imageUrl || game.thumbnailUrl) && (
        <img
          src={game.imageUrl ?? game.thumbnailUrl ?? ''}
          alt=""
          className="game-detail-image"
        />
      )}
      <dl className="bgg-details">
        <div>
          <dt>Players</dt>
          <dd>
            {game.minPlayers ?? '?'}–{game.maxPlayers ?? '?'}
          </dd>
        </div>
        <div>
          <dt>Play time</dt>
          <dd>
            {game.minPlayTime ?? game.playTime ?? '—'}
            {game.maxPlayTime != null &&
            game.maxPlayTime !== (game.minPlayTime ?? game.playTime)
              ? `–${game.maxPlayTime}`
              : ''}
            {game.playTime != null || game.minPlayTime != null ? ' min' : ''}
          </dd>
        </div>
        <div>
          <dt>{complexityFieldLabel()}</dt>
          <dd>{game.weight != null ? formatComplexity(game.weight) : '—'}</dd>
        </div>
        <div>
          <dt>BGG rating</dt>
          <dd>{game.bggRating ?? '—'}</dd>
        </div>
        <div>
          <dt>Year</dt>
          <dd>{game.yearPublished ?? '—'}</dd>
        </div>
        <div>
          <dt>Min age</dt>
          <dd>{game.minAge ?? '—'}</dd>
        </div>
        <div>
          <dt>Categories</dt>
          <dd>{game.categories.join(', ') || '—'}</dd>
        </div>
        <div>
          <dt>Mechanics</dt>
          <dd>{game.mechanics.join(', ') || '—'}</dd>
        </div>
        <div>
          <dt>Last played</dt>
          <dd>{game.lastPlayed || '—'}</dd>
        </div>
        <div>
          <dt>Play count</dt>
          <dd>{game.playCount}</dd>
        </div>
        <div>
          <dt>Notes</dt>
          <dd>{game.notes || '—'}</dd>
        </div>
      </dl>
      {game.description && (
        <div className="game-description">
          <h2>Description</h2>
          <p>{game.description}</p>
        </div>
      )}
    </section>
  )
}