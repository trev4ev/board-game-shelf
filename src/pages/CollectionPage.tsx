import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listGames } from '../lib/games'
import { isSupabaseConfigured } from '../lib/supabase'
import type { Game } from '../types/game'
import './CollectionPage.css'

export function CollectionPage() {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    listGames()
      .then((rows) => {
        if (!cancelled) {
          setGames(rows)
          setError(null)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load games')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section>
      <div className="collection-header">
        <div>
          <h1>Collection</h1>
          <p className="lede">
            Your shelf. Filters and random pick come next.
          </p>
        </div>
        <Link to="/games/new" className="button-link">
          Add game
        </Link>
      </div>

      {!isSupabaseConfigured && (
        <p className="hint">Configure Supabase in <code>.env</code> to load games.</p>
      )}

      {loading && <p className="hint">Loading collection…</p>}
      {error && (
        <p className="error">
          {error}
          {error.toLowerCase().includes('relation') ||
          error.toLowerCase().includes('does not exist') ? (
            <>
              {' '}
              Run the SQL in{' '}
              <code>supabase/migrations/20260812_create_games.sql</code> in the
              Supabase SQL editor.
            </>
          ) : null}
        </p>
      )}

      {!loading && !error && games.length === 0 && isSupabaseConfigured && (
        <p className="hint">
          No games yet. <Link to="/games/new">Add your first game</Link>.
        </p>
      )}

      {games.length > 0 && (
        <ul className="game-list">
          {games.map((game) => (
            <li key={game.id}>
              <Link to={`/games/${game.id}`} className="game-card">
                {game.thumbnailUrl ? (
                  <img src={game.thumbnailUrl} alt="" width={56} height={56} />
                ) : (
                  <span className="game-card-placeholder" aria-hidden />
                )}
                <span className="game-card-body">
                  <span className="game-card-name">
                    {game.name}
                    {game.isFavorite ? ' ★' : ''}
                  </span>
                  <span className="game-card-meta">
                    {game.minPlayers ?? '?'}–{game.maxPlayers ?? '?'} players
                    {game.playTime != null ? ` · ${game.playTime} min` : ''}
                    {game.weight != null ? ` · weight ${game.weight.toFixed(1)}` : ''}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
