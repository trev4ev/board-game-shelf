import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { complexityFieldLabel, formatComplexity } from '../lib/complexity'
import { getGame, patchGame } from '../lib/games'
import type { Game } from '../types/game'
import './GameDetailPage.css'

export function GameDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [game, setGame] = useState<Game | null>(null)
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveHint, setSaveHint] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    getGame(id)
      .then((row) => {
        if (!cancelled) {
          setGame(row)
          setNotes(row?.notes ?? '')
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

  async function saveShelf(patch: { notes?: string | null; isFavorite?: boolean }) {
    if (!id || !user) return
    setSaving(true)
    setSaveHint(null)
    setError(null)
    try {
      const updated = await patchGame(id, patch)
      setGame(updated)
      setNotes(updated.notes ?? '')
      setSaveHint('Saved')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <section>
        <h1>Game detail</h1>
        <p className="hint">Loading…</p>
      </section>
    )
  }

  if ((error && !game) || !game) {
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
            <Link to={`/games/${game.id}/edit`}>Edit catalog</Link>
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
          <dd>{game.bggRating != null ? game.bggRating.toFixed(2) : '—'}</dd>
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
      </dl>

      <div className="shelf-fields">
        <h2>On your shelf</h2>
        {user ? (
          <>
            <label className="favorite-toggle">
              <input
                type="checkbox"
                checked={game.isFavorite}
                disabled={saving}
                onChange={(event) => saveShelf({ isFavorite: event.target.checked })}
              />
              Favorite
            </label>
            <label className="notes-editor">
              Notes
              <textarea
                rows={4}
                value={notes}
                onChange={(event) => {
                  setNotes(event.target.value)
                  setSaveHint(null)
                }}
                onBlur={() => {
                  const next = notes.trim() || null
                  if (next !== (game.notes ?? null)) {
                    void saveShelf({ notes: next })
                  }
                }}
              />
            </label>
            <p className="hint">
              {saving ? 'Saving…' : saveHint}
              {error && !saving ? <span className="error"> {error}</span> : null}
            </p>
          </>
        ) : (
          <>
            <p className="hint">{game.isFavorite ? 'Favorite' : 'Not marked as favorite'}</p>
            <p>{game.notes || 'No notes yet.'}</p>
          </>
        )}
      </div>

      {game.description && (
        <div className="game-description">
          <h2>Description</h2>
          <p>{game.description}</p>
        </div>
      )}
    </section>
  )
}