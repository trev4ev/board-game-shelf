import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { GameForm } from '../components/GameForm'
import {
  gameLookup,
  isBggLookupEnabled,
  type GameLookupResult,
} from '../lib/gameLookup'
import {
  createGame,
  detailsToGameInput,
  emptyGameInput,
} from '../lib/games'
import type { GameInput } from '../types/game'
import './AddGamePage.css'

export function AddGamePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GameLookupResult[]>([])
  const [form, setForm] = useState<GameInput>(emptyGameInput)
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
      setForm(
        detailsToGameInput(details, {
          notes: form.notes,
          isFavorite: form.isFavorite,
          playCount: form.playCount,
          lastPlayed: form.lastPlayed,
        }),
      )
      setStatus('idle')
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Failed to load game')
    }
  }

  async function onSave() {
    if (!user) {
      setError('Sign in as the owner before saving to your collection.')
      return
    }

    setStatus('saving')
    setError(null)
    try {
      const game = await createGame(form)
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
        Search BoardGameGeek to prefill, or enter a game by hand. Saving requires
        an owner account.
      </p>

      {!user && (
        <p className="hint">
          You can fill in details without signing in, but saving requires an
          owner account. <Link to="/login">Sign in</Link>
        </p>
      )}

      {isBggLookupEnabled ? (
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
        </div>
      ) : (
        <p className="hint">
          BGG lookup is off. You can still add a game manually, or set{' '}
          <code>VITE_BGG_LOOKUP_ENABLED=true</code> for search.
        </p>
      )}

      {error && <p className="error">{error}</p>}

      <h2 className="form-heading">Game details</h2>
      <GameForm
        value={form}
        onChange={setForm}
        onSubmit={onSave}
        submitLabel="Save to collection"
        busy={status === 'saving'}
        disabled={!user}
      />
    </section>
  )
}