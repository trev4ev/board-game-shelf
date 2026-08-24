import { Plus } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { useCollections } from '../auth/CollectionProvider'
import { Button, ButtonLink } from '../components/Button'
import { createCollection, listCollectionSummaries } from '../lib/collections'
import type { CollectionSummary } from '../types/collection'
import './HomePage.css'

function gameCountLabel(count: number) {
  return `${count} ${count === 1 ? 'game' : 'games'}`
}

function memberCountLabel(count: number) {
  return `${count} ${count === 1 ? 'member' : 'members'}`
}

export function HomePage() {
  const { user } = useAuth()
  const { accepted, pendingInvites, loading, refresh, acceptInvite, declineInvite } =
    useCollections()
  const navigate = useNavigate()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)
  const [summaries, setSummaries] = useState<Map<string, CollectionSummary>>(
    () => new Map(),
  )
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const ids = accepted.map((item) => item.collection.id)
    if (ids.length === 0) {
      setSummaries(new Map())
      return
    }
    let cancelled = false
    listCollectionSummaries(ids)
      .then((next) => {
        if (!cancelled) setSummaries(next)
      })
      .catch(() => {
        if (!cancelled) setSummaries(new Map())
      })
    return () => {
      cancelled = true
    }
  }, [accepted])

  function openCreate() {
    setError(null)
    setName('')
    dialogRef.current?.showModal()
    window.setTimeout(() => nameRef.current?.focus(), 0)
  }

  function closeCreate() {
    dialogRef.current?.close()
  }

  async function onCreate(event: FormEvent) {
    event.preventDefault()
    if (!user) return
    setBusy(true)
    setError(null)
    try {
      const collection = await createCollection(user.id, name)
      setName('')
      closeCreate()
      await refresh()
      navigate(`/c/${collection.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create collection')
    } finally {
      setBusy(false)
    }
  }

  if (!user) {
    return (
      <section className="home-page">
        <h1>Your tabletop shelf</h1>
        <p className="lede">
          Catalog the games you own, filter for game night, and log plays.
          Sign in to create a collection, invite co-owners, and tag friends.
        </p>
        <p className="hint">
          Anyone with a collection link can browse without signing in. Use Copy
          link on a shelf — the home page is each person's own collections.
        </p>
        <div className="home-actions">
          <ButtonLink to="/login" variant="primary">
            Sign in
          </ButtonLink>
        </div>
      </section>
    )
  }

  return (
    <section className="home-page">
      <h1>Collections</h1>

      {pendingInvites.length > 0 && (
        <div className="invite-list">
          <h2>Invites</h2>
          <ul>
            {pendingInvites.map((invite) => (
              <li key={invite.collection.id} className="invite-row">
                <span>
                  Join <strong>{invite.collection.name}</strong>
                </span>
                <span className="invite-actions">
                  <Button
                    variant="accent"
                    onClick={() => void acceptInvite(invite.collection.id)}
                  >
                    Accept
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => void declineInvite(invite.collection.id)}
                  >
                    Decline
                  </Button>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {loading && <p className="hint">Loading collections…</p>}

      {!loading && (
        <ul className="collection-card-list">
          {accepted.map((item) => {
            const summary = summaries.get(item.collection.id)
            const games = summary?.games ?? []
            return (
              <li key={item.collection.id}>
                <Link to={`/c/${item.collection.id}`} className="collection-card">
                  <strong>{item.collection.name}</strong>
                  {games.length > 0 ? (
                    <span className="collection-card-games">
                      {games.map((game) =>
                        game.thumbnailUrl ? (
                          <img
                            key={game.id}
                            src={game.thumbnailUrl}
                            alt={game.name}
                            title={game.name}
                          />
                        ) : (
                          <span
                            key={game.id}
                            className="collection-card-thumb-placeholder"
                            title={game.name}
                          />
                        ),
                      )}
                    </span>
                  ) : (
                    <span className="collection-card-empty">No games yet</span>
                  )}
                  <span className="collection-card-meta">
                    {gameCountLabel(summary?.gameCount ?? 0)}
                    {' · '}
                    {memberCountLabel(summary?.memberCount ?? 1)}
                  </span>
                </Link>
              </li>
            )
          })}
          <li>
            <button
              type="button"
              className="collection-card collection-card-new"
              onClick={openCreate}
            >
              <Plus size={22} strokeWidth={2.25} aria-hidden />
              <strong>New collection</strong>
            </button>
          </li>
        </ul>
      )}

      <dialog
        ref={dialogRef}
        className="new-collection-dialog"
        onClose={() => {
          setName('')
          setError(null)
        }}
      >
        <form className="new-collection-form" onSubmit={(event) => void onCreate(event)}>
          <h2>New collection</h2>
          <label>
            Name
            <input
              ref={nameRef}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Game night shelf"
              required
              disabled={busy}
            />
          </label>
          {error && <p className="error">{error}</p>}
          <div className="new-collection-actions">
            <Button type="submit" variant="primary" disabled={busy || !name.trim()}>
              {busy ? 'Creating…' : 'Create'}
            </Button>
            <Button variant="ghost" onClick={closeCreate} disabled={busy}>
              Cancel
            </Button>
          </div>
        </form>
      </dialog>
    </section>
  )
}
