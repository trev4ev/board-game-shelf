import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { getGame } from '../lib/games'
import type { Game } from '../types/game'

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
    <section>
      <p className="hint">
        <Link to="/">← Collection</Link>
        {user && (
          <>
            {' · '}
            <Link to={`/games/${game.id}/edit`}>Edit</Link>
          </>
        )}
      </p>
      <h1>{game.name}</h1>
      {game.thumbnailUrl && (
        <img
          src={game.imageUrl ?? game.thumbnailUrl}
          alt=""
          style={{ maxWidth: 220, borderRadius: 8, marginBottom: '1rem' }}
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
          <dd>{game.playTime != null ? `${game.playTime} min` : '—'}</dd>
        </div>
        <div>
          <dt>Weight</dt>
          <dd>{game.weight ?? '—'}</dd>
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
          <dt>Notes</dt>
          <dd>{game.notes || '—'}</dd>
        </div>
      </dl>
    </section>
  )
}
