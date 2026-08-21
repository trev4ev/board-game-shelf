import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { useCollections } from '../auth/CollectionProvider'
import { Button } from '../components/Button'
import {
  canRemoveCollectionMember,
  deleteCollection,
  getCollection,
  inviteCollectionMember,
  isCollectionCreator,
  listCollectionMembers,
  removeCollectionMember,
  renameCollection,
} from '../lib/collections'
import { usernameSearchMessage, useUsernameSearch } from '../lib/useUsernameSearch'
import type { Collection, CollectionMember } from '../types/collection'
import './CollectionSettingsPage.css'

export function CollectionSettingsPage() {
  const { collectionId } = useParams()
  const { user } = useAuth()
  const { isMember, refresh } = useCollections()
  const navigate = useNavigate()
  const [collection, setCollection] = useState<Collection | null>(null)
  const [members, setMembers] = useState<CollectionMember[]>([])
  const [name, setName] = useState('')
  const [invite, setInvite] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [hint, setHint] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const { hits: suggestions, status: searchStatus } = useUsernameSearch(invite, user?.id)

  useEffect(() => {
    if (!collectionId) return
    let cancelled = false
    setLoading(true)
    Promise.all([
      getCollection(collectionId),
      listCollectionMembers(collectionId).catch(() => [] as CollectionMember[]),
    ])
      .then(([shelf, roster]) => {
        if (cancelled) return
        setCollection(shelf)
        setName(shelf?.name ?? '')
        setMembers(roster)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [collectionId])

  async function onRename(event: FormEvent) {
    event.preventDefault()
    if (!collectionId) return
    setBusy(true)
    setError(null)
    try {
      const updated = await renameCollection(collectionId, name)
      setCollection(updated)
      setHint('Collection renamed')
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not rename')
    } finally {
      setBusy(false)
    }
  }

  async function reloadMembers() {
    if (!collectionId) return
    const roster = await listCollectionMembers(collectionId)
    setMembers(roster)
  }

  async function onInvite(event: FormEvent) {
    event.preventDefault()
    if (!collectionId || !user) return
    setBusy(true)
    setError(null)
    try {
      await inviteCollectionMember(collectionId, user.id, invite)
      setInvite('')
      setHint(`Invited ${invite.trim()}`)
      await reloadMembers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send invite')
    } finally {
      setBusy(false)
    }
  }

  async function onRemove(member: CollectionMember) {
    if (!collectionId || !user) return
    const self = member.userId === user.id
    const label = member.username ?? 'this member'
    if (
      !window.confirm(
        self
          ? 'Leave this collection? You will lose edit access.'
          : `Remove ${label} from this collection?`,
      )
    ) {
      return
    }
    setBusy(true)
    setError(null)
    try {
      await removeCollectionMember(collectionId, member.userId)
      if (self) {
        await refresh()
        navigate('/')
        return
      }
      await reloadMembers()
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update members')
    } finally {
      setBusy(false)
    }
  }

  async function onDelete() {
    if (!collectionId || !collection) return
    if (
      !window.confirm(
        `Delete ${collection.name}? Games and plays in this collection will be removed.`,
      )
    ) {
      return
    }
    setBusy(true)
    setError(null)
    try {
      await deleteCollection(collectionId)
      await refresh()
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete collection')
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <section>
        <h1>Collection settings</h1>
        <p className="hint">Loading…</p>
      </section>
    )
  }

  if (!user || !isMember) {
    return (
      <section>
        <h1>Collection settings</h1>
        <p className="lede">Only collection members can manage this shelf.</p>
        <p className="hint">
          <Link to={collectionId ? `/c/${collectionId}` : '/'}>Back to collection</Link>
        </p>
      </section>
    )
  }

  if (!collection || !collectionId) {
    return (
      <section>
        <h1>Collection settings</h1>
        <p className="error">{error ?? 'Not found'}</p>
      </section>
    )
  }

  const accepted = members.filter((member) => member.status === 'accepted')
  const pending = members.filter((member) => member.status === 'pending')
  const searchMessage = usernameSearchMessage(invite, searchStatus)

  return (
    <section className="settings-page">
      <p className="hint">
        <Link to={`/c/${collectionId}`}>← {collection.name}</Link>
      </p>
      <h1>Collection settings</h1>
      {error && <p className="error">{error}</p>}
      {hint && <p className="hint">{hint}</p>}

      <form className="settings-form" onSubmit={(event) => void onRename(event)}>
        <h2>Name</h2>
        <label>
          Collection name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            disabled={busy}
          />
        </label>
        <Button type="submit" variant="secondary" disabled={busy || !name.trim()}>
          Save name
        </Button>
      </form>

      <form className="settings-form" onSubmit={(event) => void onInvite(event)}>
        <h2>Invite a co-owner</h2>
        <p className="hint">
          Co-owners can add games, log plays, and invite others. They cannot
          remove the original collection creator. Invitees need an account
          and username.
        </p>
        <label>
          Username
          <input
            value={invite}
            onChange={(event) => setInvite(event.target.value)}
            placeholder="friend_username"
            autoComplete="off"
            disabled={busy}
            aria-describedby="invite-search-status"
          />
        </label>
        <p
          id="invite-search-status"
          className="hint username-search-status"
          aria-live="polite"
          hidden={!searchMessage}
        >
          {searchMessage}
        </p>
        {searchStatus === 'results' && (
          <ul className="username-suggestions">
            {suggestions.map((profile) => (
              <li key={profile.id}>
                <button
                  type="button"
                  onClick={() => {
                    setInvite(profile.username ?? '')
                  }}
                >
                  {profile.username}
                </button>
              </li>
            ))}
          </ul>
        )}
        <Button type="submit" variant="primary" disabled={busy || !invite.trim()}>
          Send invite
        </Button>
      </form>

      <div className="settings-form">
        <h2>Members</h2>
        <ul className="member-list">
          {accepted.map((member) => {
            const creator = isCollectionCreator(collection, member.userId)
            const self = member.userId === user.id
            const canRemove = canRemoveCollectionMember(
              collection,
              user.id,
              member.userId,
            )
            return (
              <li key={member.userId}>
                <span>
                  {member.username ?? 'Unknown'}
                  {self ? ' (you)' : ''}
                  {creator ? ' (creator)' : ''}
                </span>
                {canRemove ? (
                  <Button
                    variant="ghost"
                    onClick={() => void onRemove(member)}
                    disabled={busy}
                  >
                    {self ? 'Leave' : 'Remove'}
                  </Button>
                ) : (
                  <span className="hint">Can't be removed</span>
                )}
              </li>
            )
          })}
        </ul>
        {pending.length > 0 && (
          <>
            <h3>Pending</h3>
            <ul className="member-list">
              {pending.map((member) => (
                <li key={member.userId}>
                  <span>{member.username ?? 'Unknown'}</span>
                  <Button
                    variant="ghost"
                    onClick={() => void onRemove(member)}
                    disabled={busy}
                  >
                    Cancel
                  </Button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div className="settings-form danger">
        <h2>Delete collection</h2>
        <p className="hint">This removes the games and play history on this shelf.</p>
        <Button variant="secondary" onClick={() => void onDelete()} disabled={busy}>
          Delete collection
        </Button>
      </div>
    </section>
  )
}
