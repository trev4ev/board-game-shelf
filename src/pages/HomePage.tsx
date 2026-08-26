import { Plus } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { useCollections } from '../auth/CollectionProvider'
import { Button, ButtonLink } from '../components/Button'
import { CollectionCard } from '../components/CollectionCard'
import {
  createCollection,
  listCollectionSummaries,
  listFriendCollections,
} from '../lib/collections'
import { excludeCollectionIds, friendNamesLabel } from '../lib/friendCollections'
import { gameCountLabel, memberCountLabel } from '../lib/collectionDisplay'
import { listFriendships } from '../lib/friends'
import type { CollectionSummary, FriendCollection } from '../types/collection'
import '../components/CollectionCard.css'
import './HomePage.css'

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
  const [friendCollections, setFriendCollections] = useState<FriendCollection[]>([])
  const [friendSummaries, setFriendSummaries] = useState<Map<string, CollectionSummary>>(
    () => new Map(),
  )
  const [friendsLoading, setFriendsLoading] = useState(false)
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

  useEffect(() => {
    if (!user) {
      setFriendCollections([])
      setFriendSummaries(new Map())
      return
    }
    let cancelled = false
    setFriendsLoading(true)
    const mine = new Set(accepted.map((item) => item.collection.id))
    listFriendships(user.id)
      .then((rows) => {
        const friends = rows.filter((row) => row.status === 'accepted')
        const usernames = new Map(
          friends.map((row) => [row.otherUserId, row.otherUsername]),
        )
        return listFriendCollections([...usernames.keys()], usernames)
      })
      .then(async (items) => {
        const visible = excludeCollectionIds(items, mine)
        if (cancelled) return
        setFriendCollections(visible)
        if (visible.length === 0) {
          setFriendSummaries(new Map())
          return
        }
        try {
          const next = await listCollectionSummaries(
            visible.map((item) => item.collection.id),
          )
          if (!cancelled) setFriendSummaries(next)
        } catch {
          if (!cancelled) setFriendSummaries(new Map())
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFriendCollections([])
          setFriendSummaries(new Map())
        }
      })
      .finally(() => {
        if (!cancelled) setFriendsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [accepted, user])

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
          Anyone with a collection link can browse without signing in. After you
          sign in, friends' shelves also show up here.
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
            return (
              <li key={item.collection.id}>
                <CollectionCard
                  to={`/c/${item.collection.id}`}
                  name={item.collection.name}
                  games={summary?.games ?? []}
                  meta={`${gameCountLabel(summary?.gameCount ?? 0)} · ${memberCountLabel(summary?.memberCount ?? 1)}`}
                />
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

      <div className="home-section">
        <h2>Friends' collections</h2>
        {friendsLoading && <p className="hint">Loading friends' shelves…</p>}
        {!friendsLoading && friendCollections.length === 0 && (
          <p className="hint">
            Add friends to browse their shelves.{' '}
            <Link to="/friends">Find friends</Link>
          </p>
        )}
        {!friendsLoading && friendCollections.length > 0 && (
          <ul className="collection-card-list">
            {friendCollections.map((item) => {
              const summary = friendSummaries.get(item.collection.id)
              return (
                <li key={item.collection.id}>
                  <CollectionCard
                    to={`/c/${item.collection.id}`}
                    name={item.collection.name}
                    games={summary?.games ?? []}
                    meta={`${gameCountLabel(summary?.gameCount ?? 0)} · ${friendNamesLabel(item.friends)}`}
                  />
                </li>
              )
            })}
          </ul>
        )}
      </div>

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
