import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Brain, Clock, Dices, Lightbulb, Users, X } from 'lucide-react'
import { useAuth } from '../auth/AuthProvider'
import { Button, ButtonLink } from '../components/Button'
import { Chip } from '../components/Chip'
import { GameRow } from '../components/GameRow'
import { PickCard } from '../components/PickCard'
import { RangeSlider } from '../components/RangeSlider'
import { SearchField } from '../components/SearchField'
import { Toggle } from '../components/Toggle'
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
import { formatPlayTime, formatPlayerRange, groupGamesByLetter } from '../lib/games/display'
import { COMPLEXITY_MAX, COMPLEXITY_MIN, formatComplexity } from '../lib/complexity'
import { isSupabaseConfigured } from '../lib/supabase'
import type { Game, GameFilters } from '../types/game'
import './CollectionPage.css'

const CATEGORY_PREVIEW = 8

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
  const [showAllCategories, setShowAllCategories] = useState(false)
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
  const grouped = useMemo(() => groupGamesByLetter(visible), [visible])
  const categories = useMemo(() => uniqueCategories(games), [games])
  const visibleCategories = showAllCategories
    ? categories
    : categories.slice(0, CATEGORY_PREVIEW)
  const filtersOn = filtersAreActive(filters)

  function patchFilters(partial: Partial<GameFilters>) {
    setFilters((current) => ({ ...current, ...partial }))
  }

  function onRandomPick() {
    const game = pickRandomGame(visible)
    setPicked(game)
    if (game) dialogRef.current?.showModal()
  }

  const welcome = user?.email
    ? `Welcome to ${ownerFirstName(user.email)}'s board game shelf. Browse, discover, and find the perfect game for your next session.`
    : 'Browse, discover, and find the perfect game for your next session.'

  const toolsReady = !loading && !error && isSupabaseConfigured

  return (
    <section className="collection-page">
      <div className="collection-layout">
        <div className="collection-main">
          <div className="collection-hero">
            <div>
              <h1>Game collection</h1>
              <p className="lede">{welcome}</p>
            </div>
            {toolsReady ? (
              <PickCard disabled={visible.length === 0} onPick={onRandomPick} />
            ) : null}
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

          {toolsReady && (
            <div className="collection-search-row">
              <SearchField
                label="Search games"
                value={filters.nameQuery}
                onChange={(e) => patchFilters({ nameQuery: e.target.value })}
                placeholder="Search games"
                autoComplete="off"
              />
              <Button
                className="btn-stack"
                onClick={onRandomPick}
                disabled={visible.length === 0}
              >
                <Dices size={20} strokeWidth={2} aria-hidden />
                <span className="btn-stack-copy">
                  <strong>Random pick</strong>
                  <small>From filtered games</small>
                </span>
              </Button>
            </div>
          )}

        </div>

        {toolsReady && (
          <aside className="filter-panel panel">
            <div className="filter-panel-header">
              <h2>Filters</h2>
              {filtersOn ? (
                <button
                  type="button"
                  className="clear-filters"
                  onClick={() => setFilters(emptyFilters())}
                >
                  <X size={14} strokeWidth={2.25} aria-hidden />
                  Clear filters
                </button>
              ) : null}
            </div>

            <RangeSlider
              label="Players"
              icon={<Users size={16} strokeWidth={2} aria-hidden />}
              min={PLAYER_SLIDER_MIN}
              max={PLAYER_SLIDER_MAX}
              valueMin={filters.playerMin}
              valueMax={filters.playerMax}
              onChange={(playerMin, playerMax) =>
                patchFilters({ playerMin, playerMax })
              }
              formatRange={(min, max) =>
                `${formatPlayerFilter(min)} – ${formatPlayerFilter(max)} players`
              }
              ticks={[
                { value: 1, label: '1' },
                { value: 4, label: '4' },
                { value: 7, label: '7' },
                { value: 10, label: '10+' },
              ]}
            />
            <RangeSlider
              label="Play time"
              icon={<Clock size={16} strokeWidth={2} aria-hidden />}
              min={TIME_SLIDER_MIN}
              max={TIME_SLIDER_MAX}
              step={TIME_SLIDER_STEP}
              valueMin={filters.timeMin}
              valueMax={filters.timeMax}
              onChange={(timeMin, timeMax) => patchFilters({ timeMin, timeMax })}
              formatValue={formatTimeFilter}
              ticks={[
                { value: 0, label: '0' },
                { value: 60, label: '60' },
                { value: 120, label: '120' },
                { value: 180, label: '180+' },
              ]}
            />
            <RangeSlider
              label="Complexity"
              icon={<Brain size={16} strokeWidth={2} aria-hidden />}
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
              formatRange={(min, max) =>
                `${min.toFixed(1)} – ${max.toFixed(1)} / ${COMPLEXITY_MAX}`
              }
              ticks={[
                { value: 1, label: '1' },
                { value: 2, label: '2' },
                { value: 3, label: '3' },
                { value: 4, label: '4' },
                { value: 5, label: '5' },
              ]}
            />

            {categories.length > 0 && (
              <fieldset className="filter-fieldset">
                <legend>Category</legend>
                <div className="chip-row">
                  {visibleCategories.map((category) => (
                    <Chip
                      key={category}
                      checked={filters.categories.includes(category)}
                      onChange={() =>
                        patchFilters({
                          categories: toggleValue(filters.categories, category),
                        })
                      }
                    >
                      {category}
                    </Chip>
                  ))}
                  {categories.length > CATEGORY_PREVIEW ? (
                    <button
                      type="button"
                      className="chip more-chip"
                      onClick={() => setShowAllCategories((open) => !open)}
                    >
                      {showAllCategories
                        ? 'Less'
                        : `+ More (${categories.length - CATEGORY_PREVIEW})`}
                    </button>
                  ) : null}
                </div>
              </fieldset>
            )}

            <Toggle
              label="Favorites only"
              hint="Show starred games on your shelf"
              checked={filters.favoritesOnly}
              onChange={(favoritesOnly) => patchFilters({ favoritesOnly })}
            />

            <p className="filter-tip">
              <Lightbulb size={16} strokeWidth={2} aria-hidden />
              Tip: Use OR logic for categories. Games that match any selected category will appear.
            </p>
          </aside>
        )}

        <div className="collection-results">
          {toolsReady && (
            <p className="filter-status">
              Showing {visible.length} of {games.length} {games.length === 1 ? 'game' : 'games'}
            </p>
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
            <div className="game-groups">
              {grouped.map(([letter, rows]) => (
                <section key={letter} className="game-group">
                  <h2 className="game-letter">{letter}</h2>
                  <ul className="game-list">
                    {rows.map((game) => (
                      <li key={game.id}>
                        <GameRow game={game} />
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}

          {!loading && !error && games.length > 0 && visible.length === 0 && (
            <p className="hint">No games match these filters.</p>
          )}
        </div>
      </div>

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
              {formatPlayerRange(picked)}
              {formatPlayTime(picked) ? ` · ${formatPlayTime(picked)}` : ''}
              {picked.weight != null ? ` · ${formatComplexity(picked.weight)}` : ''}
            </p>
            <div className="pick-actions">
              <ButtonLink
                to={`/games/${picked.id}`}
                onClick={() => dialogRef.current?.close()}
              >
                View game
              </ButtonLink>
              <Button variant="secondary" onClick={onRandomPick}>
                Pick again
              </Button>
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

function ownerFirstName(email: string) {
  const local = email.split('@')[0] ?? email
  return local.charAt(0).toUpperCase() + local.slice(1)
}
