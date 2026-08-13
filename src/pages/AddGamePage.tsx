import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import {
  gameLookup,
  isBggLookupEnabled,
  type GameLookupDetails,
  type GameLookupResult,
} from '../lib/gameLookup'
import { createGame, detailsToGameInput } from '../lib/games'
import './AddGamePage.css'

export function AddGamePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GameLookupResult[]>([])
  const [selected, setSelected] = useState<GameLookupDetails | null>(null)
  const [notes, setNotes] = useState('')
  const [isFavorite, setIsFavorite] = useState(false)
  const [status, setStatus] = useState<
    'idle' | 'searching' | 'loading' | 'saving' | 'error'
  >('idle')
  const [error, setError] = useState<string | null>(null)

  async function onSearch(event: FormEvent) {
    event.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return

    setStatus('searching')
    setError(null)
    setSelected(null)
    setResults([])

    try {
      const hits = await gameLookup.searchGames(trimmed)
      setResults(hits)
      setStatus('idle')
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Search failed')
    }
  }

  async function onPick(hit: GameLookupResult) {
    setStatus('loading')
    setError(null)
    try {
      const details = await gameLookup.getGameDetails(hit.bggId)
      setSelected(details)
      setStatus('idle')
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Failed to load game')
    }
  }

  async function onSave() {
    if (!selected) return
    if (!user) {
      setError('Sign in as the owner before saving to your collection.')
      return
    }

    setStatus('saving')
    setError(null)
    try {
      const game = await createGame(
        detailsToGameInput(selected, {
          notes: notes.trim() || null,
          isFavorite,
        }),
      )
      navigate(`/games/${game.id}`)
    } catch (err) {
      setStatus('error')
      const message = err instanceof Error ? err.message : 'Save failed'
      if (message.toLowerCase().includes('duplicate') || message.includes('23505')) {
        setError('That BGG game is already in your collection.')
      } else {
        setError(message)
      }
    }
  }

  return (
    <section>
      <h1>Add game</h1>
      <p className="lede">
        Search BoardGameGeek, review the details, then save to your Supabase
        collection.
      </p>

      {!user && (
        <p className="hint">
          You can search without signing in, but saving requires an owner
          account. <Link to="/login">Sign in</Link>
        </p>
      )}

      {!isBggLookupEnabled ? (
        <p className="hint">
          BGG lookup is off. Set <code>VITE_BGG_LOOKUP_ENABLED=true</code> in{' '}
          <code>.env</code> and restart the dev server.
        </p>
      ) : (
        <div className="bgg-lookup">
          <form className="bgg-search" onSubmit={onSearch}>
            <label htmlFor="bgg-query">Search BGG</label>
            <div className="bgg-search-row">
              <input
                id="bgg-query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Cascadia"
                autoComplete="off"
              />
              <button type="submit" disabled={status === 'searching'}>
                {status === 'searching' ? 'Searching…' : 'Search'}
              </button>
            </div>
            <p className="hint">
              BGG allows about one request every 5 seconds — searches may pause
              briefly.
            </p>
          </form>

          {error && <p className="error">{error}</p>}

          {results.length > 0 && (
            <ul className="bgg-results">
              {results.map((hit) => (
                <li key={hit.bggId}>
                  <button
                    type="button"
                    onClick={() => onPick(hit)}
                    disabled={status === 'loading' || status === 'saving'}
                  >
                    <span className="bgg-result-name">{hit.name}</span>
                    {hit.yearPublished != null && (
                      <span className="bgg-result-year">
                        ({hit.yearPublished})
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {status === 'loading' && <p className="hint">Loading details…</p>}

          {selected && (
            <div className="bgg-prefill">
              <h2>Ready to save</h2>
              {selected.thumbnailUrl && (
                <img
                  src={selected.thumbnailUrl}
                  alt=""
                  className="bgg-thumb"
                  width={120}
                  height={120}
                />
              )}
              <dl className="bgg-details">
                <div>
                  <dt>Name</dt>
                  <dd>{selected.name}</dd>
                </div>
                <div>
                  <dt>Players</dt>
                  <dd>
                    {selected.minPlayers ?? '?'}–{selected.maxPlayers ?? '?'}
                  </dd>
                </div>
                <div>
                  <dt>Play time</dt>
                  <dd>
                    {selected.minPlayTime ?? selected.playTime ?? '?'}
                    {selected.maxPlayTime != null &&
                    selected.maxPlayTime !== selected.minPlayTime
                      ? `–${selected.maxPlayTime}`
                      : ''}{' '}
                    min
                  </dd>
                </div>
                <div>
                  <dt>Weight</dt>
                  <dd>{selected.weight ?? '—'}</dd>
                </div>
                <div>
                  <dt>BGG rating</dt>
                  <dd>{selected.bggRating ?? '—'}</dd>
                </div>
                <div>
                  <dt>Categories</dt>
                  <dd>{selected.categories.join(', ') || '—'}</dd>
                </div>
                <div>
                  <dt>Mechanics</dt>
                  <dd>{selected.mechanics.join(', ') || '—'}</dd>
                </div>
              </dl>

              <label className="notes-field">
                Notes
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Optional notes for your shelf"
                />
              </label>

              <label className="favorite-field">
                <input
                  type="checkbox"
                  checked={isFavorite}
                  onChange={(e) => setIsFavorite(e.target.checked)}
                />
                Mark as favorite
              </label>

              <button
                type="button"
                className="save-button"
                onClick={onSave}
                disabled={status === 'saving' || !user}
              >
                {status === 'saving' ? 'Saving…' : 'Save to collection'}
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
