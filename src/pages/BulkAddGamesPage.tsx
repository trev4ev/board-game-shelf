import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Upload } from 'lucide-react'
import { useAuth } from '../auth/AuthProvider'
import { useCollections } from '../auth/CollectionProvider'
import { Button, ButtonLink } from '../components/Button'
import {
  gameLookup,
  isBggLookupEnabled,
  matchGameName,
  parseGameNameList,
  type BulkMatchRow,
} from '../lib/gameLookup'
import { createGames, detailsToGameInput, listGames } from '../lib/games'
import './AddGamePage.css'
import './BulkAddGamesPage.css'

const MAX_NAMES = 40

type BulkPhase = 'edit' | 'matching' | 'review' | 'saving'

function statusLabel(row: BulkMatchRow): string {
  if (row.status === 'unmatched') return 'No close match'
  if (row.status === 'error') return row.error ?? 'Lookup failed'
  if (row.status === 'already_in_collection') return 'Already in this collection'
  if (row.score != null && row.score < 0.9) return 'Approximate match'
  return 'Matched'
}

export function BulkAddGamesPage() {
  const { collectionId } = useParams()
  const { user } = useAuth()
  const { isMember } = useCollections()
  const navigate = useNavigate()
  const fileId = useId()
  const listId = useId()

  const [text, setText] = useState('')
  const [phase, setPhase] = useState<BulkPhase>('edit')
  const [rows, setRows] = useState<BulkMatchRow[]>([])
  const [progress, setProgress] = useState<{ current: number; total: number; query: string } | null>(
    null,
  )
  const [error, setError] = useState<string | null>(null)
  const [existingBggIds, setExistingBggIds] = useState<Set<number>>(new Set())
  const cancelRef = useRef(false)

  const backTo = collectionId ? `/c/${collectionId}/games/new` : '/'

  useEffect(() => {
    if (!collectionId) return
    let cancelled = false
    listGames(collectionId)
      .then((games) => {
        if (cancelled) return
        setExistingBggIds(
          new Set(
            games
              .map((game) => game.bggId)
              .filter((id): id is number => id != null),
          ),
        )
      })
      .catch(() => {
        if (!cancelled) setExistingBggIds(new Set())
      })
    return () => {
      cancelled = true
    }
  }, [collectionId])

  const onFile = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    const csv = /\.csv$/i.test(file.name) || file.type === 'text/csv'
    const names = parseGameNameList(await file.text(), { csv })
    setText(names.join('\n'))
    setError(null)
    setPhase('edit')
    setRows([])
  }, [])

  const onCancelMatch = useCallback(() => {
    cancelRef.current = true
  }, [])

  async function onFindMatches(event: FormEvent) {
    event.preventDefault()
    const names = parseGameNameList(text)
    if (names.length === 0) {
      setError('Add at least one game name.')
      return
    }
    if (names.length > MAX_NAMES) {
      setError(`Please split this into batches of ${MAX_NAMES} names or fewer.`)
      return
    }
    if (!isBggLookupEnabled) {
      setError('BGG lookup is off, so names cannot be matched.')
      return
    }

    cancelRef.current = false
    setError(null)
    setPhase('matching')
    setRows([])
    const next: BulkMatchRow[] = []
    const seenBggIds = new Set(existingBggIds)

    for (let i = 0; i < names.length; i++) {
      if (cancelRef.current) {
        setPhase(next.length > 0 ? 'review' : 'edit')
        setProgress(null)
        return
      }
      const query = names[i]!
      setProgress({ current: i + 1, total: names.length, query })
      const row = await matchGameName(query, gameLookup, seenBggIds)
      if (row.details && row.selected) seenBggIds.add(row.details.bggId)
      next.push(row)
      setRows([...next])
    }

    setProgress(null)
    setPhase('review')
  }

  function toggleRow(index: number, selected: boolean) {
    setRows((current) =>
      current.map((row, i) => (i === index ? { ...row, selected } : row)),
    )
  }

  const selectedCount = rows.filter((row) => row.selected && row.details).length

  async function onAddSelected() {
    if (!user || !isMember || !collectionId) {
      setError('Sign in as a collection member before saving.')
      return
    }
    const inputs = rows
      .filter((row) => row.selected && row.details)
      .map((row) => detailsToGameInput(row.details!))
    if (inputs.length === 0) {
      setError('Select at least one matched game to add.')
      return
    }

    setPhase('saving')
    setError(null)
    try {
      await createGames(collectionId, inputs)
      navigate(`/c/${collectionId}`)
    } catch (err) {
      setPhase('review')
      const message = err instanceof Error ? err.message : 'Save failed'
      if (message.toLowerCase().includes('duplicate') || message.includes('23505')) {
        setError('One of those BGG games is already in your collection.')
      } else {
        setError(message)
      }
    }
  }

  const busy = phase === 'matching' || phase === 'saving'

  return (
    <section className="bulk-add">
      <p className="hint">
        <Link to={backTo}>← Back to search</Link>
      </p>
      <h1>Bulk add games</h1>
      <p className="lede">
        Paste one name per line, or upload a text/CSV list. Each name is looked
        up on BoardGameGeek and matched to the closest title. Matching runs
        sequentially because BGG rate-limits requests.
      </p>

      {!user && (
        <p className="hint">
          Saving requires a collection you co-own. <Link to="/login">Sign in</Link>
        </p>
      )}

      {error && <p className="error">{error}</p>}

      <form className="bulk-add-form" onSubmit={(event) => void onFindMatches(event)}>
        <label htmlFor={listId}>Game names</label>
        <textarea
          id={listId}
          rows={10}
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={'Wingspan\nCatan\nTicket to Ride Europe'}
          disabled={busy}
          spellCheck={false}
        />
        <div className="bulk-add-file-row">
          <label htmlFor={fileId} className="bulk-add-file-label">
            <Upload size={16} strokeWidth={2} aria-hidden />
            Upload .txt or .csv
          </label>
          <input
            id={fileId}
            className="bulk-add-file-input"
            type="file"
            accept=".txt,.csv,text/plain,text/csv"
            onChange={(event) => void onFile(event)}
            disabled={busy}
          />
          <p className="hint bulk-add-file-hint">
            CSV: a <code>name</code> column if you have a header, otherwise the
            first column. Up to {MAX_NAMES} names.
          </p>
        </div>
        <div className="bulk-add-actions">
          <Button type="submit" disabled={busy || !text.trim()}>
            {phase === 'matching' ? 'Matching…' : 'Find matches'}
          </Button>
          {phase === 'matching' && (
            <Button variant="ghost" type="button" onClick={onCancelMatch}>
              Stop
            </Button>
          )}
          <ButtonLink to={backTo} variant="secondary">
            Cancel
          </ButtonLink>
        </div>
      </form>

      {progress && (
        <p className="hint bulk-add-progress" aria-live="polite">
          Matching {progress.current} of {progress.total}: {progress.query}
        </p>
      )}

      {rows.length > 0 && (
        <div className="bulk-add-results">
          <h2 className="form-heading">Matches</h2>
          <ul className="bulk-add-list">
            {rows.map((row, index) => {
              const canSelect = row.details != null && row.status !== 'error'
              return (
                <li key={`${row.query}-${index}`} className={`bulk-add-row is-${row.status}`}>
                  <label>
                    <input
                      type="checkbox"
                      checked={row.selected}
                      disabled={!canSelect || busy}
                      onChange={(event) => toggleRow(index, event.target.checked)}
                    />
                    <span className="bulk-add-row-body">
                      {row.details?.thumbnailUrl ? (
                        <img
                          src={row.details.thumbnailUrl}
                          alt=""
                          className="bulk-add-thumb"
                        />
                      ) : (
                        <span className="bulk-add-thumb bulk-add-thumb-empty" />
                      )}
                      <span>
                        <span className="bulk-add-query">{row.query}</span>
                        <span className="bulk-add-match">
                          {row.details
                            ? `${row.details.name}${
                                row.details.yearPublished != null
                                  ? ` (${row.details.yearPublished})`
                                  : ''
                              }`
                            : '—'}
                        </span>
                        <span className="bulk-add-status">{statusLabel(row)}</span>
                      </span>
                    </span>
                  </label>
                </li>
              )
            })}
          </ul>
          <div className="bulk-add-actions">
            <Button
              onClick={() => void onAddSelected()}
              disabled={busy || selectedCount === 0 || !user || !isMember}
            >
              {phase === 'saving'
                ? 'Adding…'
                : `Add ${selectedCount} ${selectedCount === 1 ? 'game' : 'games'}`}
            </Button>
          </div>
        </div>
      )}
    </section>
  )
}
