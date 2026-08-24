import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Brain, Clock, Dices, Link2, Plus, Settings, SlidersHorizontal, Users, X } from 'lucide-react'
import { useAuth } from '../auth/AuthProvider'
import { useCollections } from '../auth/CollectionProvider'
import { Button, ButtonLink } from '../components/Button'
import { Chip } from '../components/Chip'
import { GameRow } from '../components/GameRow'
import { RangeSlider } from '../components/RangeSlider'
import { SearchField } from '../components/SearchField'
import { Toggle } from '../components/Toggle'
import { appUrl } from '../lib/appUrl'
import { getCollection } from '../lib/collections'
import { copyText } from '../lib/copyText'
import {
  applicableCategories,
  COMPLEXITY_SLIDER_STEP,
  emptyFilters,
  filterGames,
  filtersAreActive,
  formatPlayerFilter,
  formatTimeFilter,
  listGames,
  pickRandomGame,
  PLAYER_SLIDER_MAX,
  PLAYER_SLIDER_MIN,
  TIME_SLIDER_MAX,
  TIME_SLIDER_MIN,
  TIME_SLIDER_STEP,
} from '../lib/games'
import { formatPlayTime, formatPlayerRange } from '../lib/games/display'
import { COMPLEXITY_MAX, COMPLEXITY_MIN, formatComplexity } from '../lib/complexity'
import { isSupabaseConfigured } from '../lib/supabase'
import { useMediaQuery } from '../lib/useMediaQuery'
import type { Collection } from '../types/collection'
import type { Game, GameFilters } from '../types/game'
import './CollectionPage.css'

function toggleValue<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
}

export function CollectionPage() {
  const { collectionId } = useParams()
  const { user } = useAuth()
  const { isMember } = useCollections()
  const isDesktop = useMediaQuery('(min-width: 58rem)')
  const [collection, setCollection] = useState<Collection | null>(null)
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<GameFilters>(emptyFilters)
  const [picked, setPicked] = useState<Game | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [copyHint, setCopyHint] = useState<string | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    if (!isSupabaseConfigured || !collectionId) {
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    Promise.all([getCollection(collectionId), listGames(collectionId)])
      .then(([shelf, rows]) => {
        if (!cancelled) {
          setCollection(shelf)
          setGames(rows)
          setError(shelf ? null : 'Collection not found')
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
  }, [collectionId])

  const visible = useMemo(() => filterGames(games, filters), [games, filters])
  const categories = useMemo(
    () => applicableCategories(games, filters),
    [games, filters],
  )
  const filtersOn = filtersAreActive(filters)
  const toolsReady = !loading && !error && isSupabaseConfigured
  const showFilterSheet = toolsReady && (isDesktop || showFilters)
  const resultSummary = `Showing ${visible.length} of ${games.length} ${
    games.length === 1 ? 'game' : 'games'
  }`

  useEffect(() => {
    if (isDesktop || !showFilters) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShowFilters(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [isDesktop, showFilters])

  function patchFilters(partial: Partial<GameFilters>) {
    setFilters((current) => ({ ...current, ...partial }))
  }

  function onRandomPick() {
    const game = pickRandomGame(visible)
    setPicked(game)
    if (game) dialogRef.current?.showModal()
  }

  async function onCopyCollectionLink() {
    if (!collectionId) return
    const copied = await copyText(appUrl(`c/${collectionId}`))
    setCopyHint(copied ? 'Link copied' : 'Could not copy. Copy the URL from the address bar.')
  }

  return (
    <section className="collection-page">
      <div className="collection-layout">
        <div className="collection-primary">
        <div className="collection-main">
          <div className="collection-hero">
            <div className="collection-hero-copy">
              <p className="hint collection-back">
                <Link to="/">← Collections</Link>
              </p>
              <h1>{collection?.name ?? 'Game collection'}</h1>
              {toolsReady && collection && !isMember ? (
                <p className="hint collection-browse-note">
                  {user
                    ? 'You can browse this shelf. Members can add games and log plays.'
                    : 'Anyone with this link can browse. Sign in only if you want your own collection or a member invite.'}
                </p>
              ) : null}
              {copyHint ? <p className="hint collection-browse-note">{copyHint}</p> : null}
            </div>
            {collectionId ? (
              <div className="collection-hero-actions">
                <button
                  type="button"
                  className="collection-share-link"
                  onClick={() => void onCopyCollectionLink()}
                >
                  <Link2 size={16} strokeWidth={2} aria-hidden />
                  Copy link
                </button>
                {isMember ? (
                  <>
                    <ButtonLink
                      to={`/c/${collectionId}/games/new`}
                      variant="accent"
                      className="add-game-btn"
                    >
                      <Plus size={16} strokeWidth={2.25} aria-hidden />
                      Add game
                    </ButtonLink>
                    <Link to={`/c/${collectionId}/settings`} className="collection-settings-link">
                      <Settings size={16} strokeWidth={2} aria-hidden />
                      Settings
                    </Link>
                  </>
                ) : null}
              </div>
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
              <div className="collection-search-tools">
                <SearchField
                  label="Search games"
                  value={filters.nameQuery}
                  onChange={(e) => patchFilters({ nameQuery: e.target.value })}
                  placeholder="Search games"
                  autoComplete="off"
                />
                {!isDesktop && (
                  <button
                    type="button"
                    className={
                      showFilters || filtersOn ? 'filter-toggle on' : 'filter-toggle'
                    }
                    aria-pressed={showFilters}
                    onClick={() => setShowFilters((open) => !open)}
                  >
                    <SlidersHorizontal size={18} strokeWidth={2} aria-hidden />
                    <span className="visually-hidden">
                      {showFilters ? 'Hide filters' : 'Show filters'}
                    </span>
                  </button>
                )}
              </div>
              <Button
                variant="accent"
                className="random-pick-btn"
                onClick={onRandomPick}
                disabled={visible.length === 0}
              >
                <Dices size={18} strokeWidth={2} aria-hidden />
                Random pick
              </Button>
            </div>
          )}

        </div>

        <div className="collection-results">
          {toolsReady && <p className="filter-status">{resultSummary}</p>}

          {!loading && !error && games.length === 0 && isSupabaseConfigured && (
            <p className="hint">
              No games yet.
              {user && isMember && collectionId ? (
                <>
                  {' '}
                  <Link to={`/c/${collectionId}/games/new`}>Add your first game</Link>.
                </>
              ) : user ? (
                ' You can browse this shelf; members can add games.'
              ) : (
                ' Sign in to add games to a collection you co-own.'
              )}
            </p>
          )}

          {visible.length > 0 && (
            <ul className="game-list">
              {visible.map((game) => (
                <li key={game.id}>
                  <GameRow game={game} />
                </li>
              ))}
            </ul>
          )}

          {!loading && !error && games.length > 0 && visible.length === 0 && (
            <p className="hint">No games match these filters.</p>
          )}
        </div>
        </div>

        {showFilterSheet && (
          <aside className="filter-panel panel">
            <div className="filter-panel-top">
              <div className="filter-panel-header">
                <h2>Filters</h2>
                <div className="filter-panel-header-actions">
                  {filtersOn ? (
                    <button
                      type="button"
                      className="clear-filters"
                      onClick={() => setFilters(emptyFilters())}
                    >
                      Clear filters
                    </button>
                  ) : null}
                  {!isDesktop ? (
                    <button
                      type="button"
                      className="filter-close"
                      onClick={() => setShowFilters(false)}
                    >
                      <X size={22} strokeWidth={2} aria-hidden />
                      <span className="visually-hidden">Close filters</span>
                    </button>
                  ) : null}
                </div>
              </div>
              {!isDesktop ? (
                <p className="filter-panel-results" aria-live="polite">
                  {resultSummary}
                </p>
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
                <div className="chip-scroll">
                  <div className="chip-row">
                    {categories.map((category) => (
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
                  </div>
                </div>
              </fieldset>
            )}

            <Toggle
              label="Favorites only"
              hint="Show starred games on your shelf"
              checked={filters.favoritesOnly}
              onChange={(favoritesOnly) => patchFilters({ favoritesOnly })}
            />
          </aside>
        )}
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
              <Button variant="accent" onClick={onRandomPick}>
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
