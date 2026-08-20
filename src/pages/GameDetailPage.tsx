import { Star } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useCollections } from '../auth/CollectionProvider'
import { Button } from '../components/Button'
import { LogPlayForm } from '../components/LogPlayForm'
import { Toggle } from '../components/Toggle'
import { complexityFieldLabel, formatComplexity } from '../lib/complexity'
import { isAcceptedMember } from '../lib/collections'
import { createPlay, formatLastPlayed, formatPlace, getGame, listPlays, patchGame } from '../lib/games'
import { useMediaQuery } from '../lib/useMediaQuery'
import type { Game } from '../types/game'
import type { Play, PlayInput } from '../types/play'
import './GameDetailPage.css'

export function GameDetailPage() {
  const { id } = useParams()
  const { memberships, setActiveCollectionId } = useCollections()
  const navigate = useNavigate()
  const isDesktop = useMediaQuery('(min-width: 48rem)')
  const [game, setGame] = useState<Game | null>(null)
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveHint, setSaveHint] = useState<string | null>(null)
  const [playError, setPlayError] = useState<string | null>(null)
  const [formKey, setFormKey] = useState(0)
  const [plays, setPlays] = useState<Play[]>([])
  const playDialogRef = useRef<HTMLDialogElement>(null)

  const canEdit = Boolean(game && isAcceptedMember(memberships, game.collectionId))

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

    listPlays(id)
      .then((rows) => {
        if (!cancelled) setPlays(rows)
      })
      .catch(() => {
        if (!cancelled) setPlays([])
      })
    return () => {
      cancelled = true
    }
  }, [id])

  useEffect(() => {
    if (!game) return
    setActiveCollectionId(game.collectionId)
    return () => setActiveCollectionId(null)
  }, [game, setActiveCollectionId])

  async function saveShelf(
    patch: { notes?: string | null; isFavorite?: boolean; playCount?: number; lastPlayed?: string | null },
    hint = 'Saved',
  ) {
    if (!id || !canEdit) return
    setSaving(true)
    setSaveHint(null)
    setError(null)
    try {
      const updated = await patchGame(id, patch)
      setGame(updated)
      setNotes(updated.notes ?? '')
      setSaveHint(hint)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save')
    } finally {
      setSaving(false)
    }
  }

  function openLogPlay() {
    if (!game) return
    if (!isDesktop) {
      navigate(`/games/${game.id}/play`)
      return
    }
    setPlayError(null)
    setFormKey((key) => key + 1)
    playDialogRef.current?.showModal()
  }

  async function submitPlay(input: PlayInput) {
    if (!game) return
    setSaving(true)
    setPlayError(null)
    setError(null)
    try {
      const updated = await createPlay(input, game)
      setGame(updated)
      setNotes(updated.notes ?? '')
      setSaveHint('Logged a play')
      playDialogRef.current?.close()
      const rows = await listPlays(updated.id)
      setPlays(rows)
    } catch (err) {
      setPlayError(err instanceof Error ? err.message : 'Could not log play')
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
        <Link to={`/c/${game.collectionId}`}>← Collection</Link>
        {canEdit && (
          <>
            {' · '}
            <Link to={`/games/${game.id}/edit`}>Edit catalog</Link>
          </>
        )}
      </p>
      <h1>
        {game.name}
        {game.isFavorite ? (
          <Star
            className="game-title-star"
            size={22}
            strokeWidth={2}
            fill="currentColor"
            aria-label="Favorite"
          />
        ) : null}
      </h1>
      {(game.imageUrl || game.thumbnailUrl) && (
        <img
          src={game.imageUrl ?? game.thumbnailUrl ?? ''}
          alt=""
          className="game-detail-image"
        />
      )}

      <div className="shelf-fields">
        {canEdit ? (
          <>
            <div className="game-actions">
              <Toggle
                label="Favorite"
                checked={game.isFavorite}
                onChange={(isFavorite) => void saveShelf({ isFavorite })}
              />
              <Button variant="accent" onClick={openLogPlay} disabled={saving}>
                Log play
              </Button>
            </div>
            <label className="notes-editor">
              Notes
              <textarea
                rows={3}
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
          <p className="hint">
            {game.isFavorite ? 'Favorite' : 'Not marked as favorite'}
            {game.notes ? ` · ${game.notes}` : ''}
          </p>
        )}
      </div>

      <div className="play-history">
        <h2>Plays</h2>
        {plays.length === 0 ? (
          <p className="hint">No plays logged yet.</p>
        ) : (
          <ol className="play-history-list">
            {plays.map((play) => (
              <li key={play.id} className="play-history-item">
                <p className="play-history-date">{formatLastPlayed(play.playedOn)}</p>
                <ol className="play-history-players">
                  {play.players.map((player, index) => {
                    const tied =
                      index > 0 && play.players[index - 1]?.place === player.place
                    return (
                      <li key={`${play.id}-${index}`}>
                        <span className="play-history-place">
                          {formatPlace(player.place)}
                          {tied ? ' (tie)' : ''}
                        </span>
                        <span className="play-history-name">
                          {player.name}
                          {player.userId ? (
                            <span className="play-history-tag"> tagged</span>
                          ) : null}
                        </span>
                        {player.score != null ? (
                          <span className="play-history-score">{player.score}</span>
                        ) : null}
                      </li>
                    )
                  })}
                </ol>
              </li>
            ))}
          </ol>
        )}
      </div>

      <details className="game-catalog">
        <summary>Game details</summary>
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
            <dd>{formatLastPlayed(game.lastPlayed)}</dd>
          </div>
          <div>
            <dt>Play count</dt>
            <dd>{game.playCount}</dd>
          </div>
        </dl>
        {game.description ? (
          <div className="game-description">
            <h2>Description</h2>
            <p>{game.description}</p>
          </div>
        ) : null}
      </details>

      <dialog ref={playDialogRef} className="log-play-dialog">
        <h2>Log play</h2>
          <LogPlayForm
          key={formKey}
          gameId={game.id}
          collectionId={game.collectionId}
          gameName={game.name}
          busy={saving}
          error={playError}
          onSubmit={(input) => void submitPlay(input)}
          onCancel={() => playDialogRef.current?.close()}
        />
      </dialog>
    </section>
  )
}