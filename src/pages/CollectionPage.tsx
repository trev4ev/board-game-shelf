import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { RangeSlider } from '../components/RangeSlider'
import {
  COMPLEXITY_SLIDER_STEP,
  emptyFilters,
  filterGames,
  filtersAreActive,
  formatPlayerFilter,
  formatTimeFilter,
  listGames,
  pickRandomGame,
  uniqueCategories,
  PLAYER_SLIDER_MAX,
  PLAYER_SLIDER_MIN,
  TIME_SLIDER_MAX,
  TIME_SLIDER_MIN,
  TIME_SLIDER_STEP,
} from '../lib/games'
import { COMPLEXITY_MAX, COMPLEXITY_MIN, complexityFieldLabel, formatComplexity } from '../lib/complexity'
import { isSupabaseConfigured } from '../lib/supabase'
import type { Game, GameFilters } from '../types/game'
import './CollectionPage.css'

function toggleValue<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
}

export function CollectionPage() {
  const { user } = useAuth()
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<GameFilters>(emptyFilters)
  const [picked, setPicked] = useState<Game | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)

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

  const visible = useMemo(() => filterGames(games, filters), [games, filters])
  const categories = useMemo(() => uniqueCategories(games), [games])

  function patchFilters(partial: Partial<GameFilters>) {
    setFilters((current) => ({ ...current, ...partial }))
  }

  function onRandomPick() {
    const game = pickRandomGame(visible)
    setPicked(game)
    if (game) dialogRef.current?.showModal()
  }

  return (
    <section>
      <div className="collection-header">
        <div>
          <h1>Collection</h1>
          <p className="lede">
            Browse the shelf, filter by tonight’s constraints, or pick at random.
          </p>
        </div>
        {user && (
          <Link to="/games/new" className="button-link">
            Add game
          </Link>
        )}
      </div>

      {!isSupabaseConfigured && (
        <p className="hint">
          Configure Supabase in <code>.env</code> to load games.
        </p>
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

      {!loading && !error && isSupabaseConfigured && (
        <div className="collection-tools">
          <div className="collection-search-row">
            <label className="search-field">
              <span className="visually-hidden">Search by name</span>
              <input
                type="search"
                value={filters.nameQuery}
                onChange={(e) => patchFilters({ nameQuery: e.target.value })}
                placeholder="Search by name"
                autoComplete="off"
              />
            </label>
            <button
              type="button"
              className="button-link"
              onClick={onRandomPick}
              disabled={visible.length === 0}
            >
              Random pick
            </button>
          </div>

          <div className="filter-groups">
            <RangeSlider
              label="Players"
              min={PLAYER_SLIDER_MIN}
              max={PLAYER_SLIDER_MAX}
              valueMin={filters.playerMin}
              valueMax={filters.playerMax}
              onChange={(playerMin, playerMax) =>
                patchFilters({ playerMin, playerMax })
              }
              formatValue={formatPlayerFilter}
            />
            <RangeSlider
              label="Time"
              min={TIME_SLIDER_MIN}
              max={TIME_SLIDER_MAX}
              step={TIME_SLIDER_STEP}
              valueMin={filters.timeMin}
              valueMax={filters.timeMax}
              onChange={(timeMin, timeMax) => patchFilters({ timeMin, timeMax })}
              formatValue={formatTimeFilter}
            />
            <RangeSlider
              label={complexityFieldLabel()}
              min={COMPLEXITY_MIN}
              max={COMPLEXITY_MAX}
              step={COMPLEXITY_SLIDER_STEP}
              valueMin={filters.complexityMin}
              valueMax={filters.complexityMax}
              onChange={(complexityMin, complexityMax) =>
                patchFilters({
                  complexityMin: Number(complexityMin.toFixed(1)),
                  complexityMax: Number(complexityMax.toFixed(1)),
                })
              }
              formatValue={(value) => value.toFixed(1)}
            />

            {categories.length > 0 && (
              <fieldset>
                <legend>Category</legend>
                <div className="chip-row">
                  {categories.map((category) => (
                    <label
                      key={category}
                      className={
                        filters.categories.includes(category) ? 'chip on' : 'chip'
                      }
                    >
                      <input
                        type="checkbox"
                        checked={filters.categories.includes(category)}
                        onChange={() =>
                          patchFilters({
                            categories: toggleValue(filters.categories, category),
                          })
                        }
                      />
                      {category}
                    </label>
                  ))}
                </div>
              </fieldset>
            )}

            <label className={filters.favoritesOnly ? 'chip on' : 'chip'}>
              <input
                type="checkbox"
                checked={filters.favoritesOnly}
                onChange={(e) => patchFilters({ favoritesOnly: e.target.checked })}
              />
              Favorites only
            </label>
          </div>

          <p className="filter-status">
            Showing {visible.length} of {games.length}
            {filtersAreActive(filters) && (
              <>
                {' · '}
                <button
                  type="button"
                  className="text-button"
                  onClick={() => setFilters(emptyFilters())}
                >
                  Clear filters
                </button>
              </>
            )}
          </p>
        </div>
      )}

      {!loading && !error && games.length === 0 && isSupabaseConfigured && (
        <p className="hint">
          No games yet.
          {user ? (
            <>
              {' '}
              <Link to="/games/new">Add your first game</Link>.
            </>
          ) : (
            ' Sign in as the owner to add games.'
          )}
        </p>
      )}

      {visible.length > 0 && (
        <ul className="game-list">
          {visible.map((game) => (
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
                    {game.weight != null
                      ? ` · complexity ${formatComplexity(game.weight)}`
                      : ''}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {!loading &&
        !error &&
        games.length > 0 &&
        visible.length === 0 && (
          <p className="hint">No games match these filters.</p>
        )}

      <dialog
        ref={dialogRef}
        className="pick-dialog"
        onClose={() => setPicked(null)}
      >
        {picked && (
          <>
            <h2>Tonight’s pick</h2>
            {picked.thumbnailUrl && (
              <img src={picked.thumbnailUrl} alt="" width={96} height={96} />
            )}
            <p className="pick-name">{picked.name}</p>
            <p className="hint">
              {picked.minPlayers ?? '?'}–{picked.maxPlayers ?? '?'} players
              {picked.playTime != null ? ` · ${picked.playTime} min` : ''}
            </p>
            <div className="pick-actions">
              <Link
                to={`/games/${picked.id}`}
                className="button-link"
                onClick={() => dialogRef.current?.close()}
              >
                View game
              </Link>
              <button type="button" className="button-secondary" onClick={onRandomPick}>
                Pick again
              </button>
              <button
                type="button"
                className="text-button"
                onClick={() => dialogRef.current?.close()}
              >
                Close
              </button>
            </div>
          </>
        )}
      </dialog>
    </section>
  )
}