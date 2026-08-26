import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { Button, ButtonLink } from '../components/Button'
import {
  acceptFriendRequest,
  deleteFriendship,
  listFriendships,
  sendFriendRequest,
} from '../lib/friends'
import { usernameSearchMessage, useUsernameSearch } from '../lib/useUsernameSearch'
import type { Friendship } from '../types/friend'
import type { Profile } from '../types/profile'
import './FriendsPage.css'

export function FriendsPage() {
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [friendships, setFriendships] = useState<Friendship[]>([])
  const [error, setError] = useState<string | null>(null)
  const [hint, setHint] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const { hits, status: searchStatus } = useUsernameSearch(query, user?.id)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    listFriendships(user.id)
      .then((rows) => {
        if (!cancelled) setFriendships(rows)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load friends')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [user])

  const byOther = useMemo(() => {
    const map = new Map<string, Friendship>()
    for (const row of friendships) map.set(row.otherUserId, row)
    return map
  }, [friendships])

  const incoming = friendships.filter(
    (row) => row.status === 'pending' && row.addresseeId === user?.id,
  )
  const outgoing = friendships.filter(
    (row) => row.status === 'pending' && row.requesterId === user?.id,
  )
  const friends = friendships.filter((row) => row.status === 'accepted')

  async function onSearch(event: FormEvent) {
    event.preventDefault()
  }

  async function request(profile: Profile) {
    if (!user || !profile.username) return
    setBusy(true)
    setError(null)
    try {
      await sendFriendRequest(user.id, profile.id)
      setHint(`Sent a request to ${profile.username}`)
      setQuery('')
      setFriendships(await listFriendships(user.id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send request')
    } finally {
      setBusy(false)
    }
  }

  async function accept(row: Friendship) {
    if (!user) return
    setBusy(true)
    setError(null)
    try {
      await acceptFriendRequest(row.id, user.id)
      setFriendships(await listFriendships(user.id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not accept')
    } finally {
      setBusy(false)
    }
  }

  async function remove(row: Friendship, label: string) {
    if (!user) return
    setBusy(true)
    setError(null)
    try {
      await deleteFriendship(row.id)
      setHint(label)
      setFriendships(await listFriendships(user.id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update friends')
    } finally {
      setBusy(false)
    }
  }

  if (!user) {
    return (
      <section>
        <h1>Friends</h1>
        <p className="lede">
          Sign in to add friends, browse their collections, and tag them when
          you log a play. <Link to="/login">Sign in</Link>
        </p>
      </section>
    )
  }

  const searchMessage = usernameSearchMessage(query, searchStatus)

  return (
    <section className="friends-page">
      <h1>Friends</h1>
      <p className="lede">
        Add people by username to browse their shelves and tag them on plays.
        Anyone without an account can still be logged as a guest name.
      </p>
      {error && <p className="error">{error}</p>}
      {hint && <p className="hint">{hint}</p>}

      <form className="friends-search" onSubmit={(event) => void onSearch(event)}>
        <label>
          Find a username
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="start typing"
            autoComplete="off"
            aria-describedby="username-search-status"
          />
        </label>
        <p
          id="username-search-status"
          className="hint username-search-status"
          aria-live="polite"
          hidden={!searchMessage}
        >
          {searchMessage}
        </p>
        {searchStatus === 'results' && (
          <ul className="friend-results">
            {hits.map((profile) => {
              const existing = byOther.get(profile.id)
              return (
                <li key={profile.id}>
                  <span>{profile.username}</span>
                  {existing?.status === 'accepted' ? (
                    <span className="friend-actions">
                      {profile.username ? (
                        <ButtonLink variant="ghost" to={`/friends/${profile.username}`}>
                          Collections
                        </ButtonLink>
                      ) : (
                        <span className="hint">Friends</span>
                      )}
                    </span>
                  ) : existing?.status === 'pending' ? (
                    <span className="hint">Pending</span>
                  ) : (
                    <Button
                      variant="accent"
                      onClick={() => void request(profile)}
                      disabled={busy}
                    >
                      Add friend
                    </Button>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </form>

      {loading && <p className="hint">Loading friends…</p>}

      {incoming.length > 0 && (
        <div className="friends-section">
          <h2>Requests</h2>
          <ul className="friend-list">
            {incoming.map((row) => (
              <li key={row.id}>
                <span>{row.otherUsername ?? 'Unknown'}</span>
                <span className="friend-actions">
                  <Button variant="accent" onClick={() => void accept(row)} disabled={busy}>
                    Accept
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => void remove(row, 'Request declined')}
                    disabled={busy}
                  >
                    Decline
                  </Button>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {outgoing.length > 0 && (
        <div className="friends-section">
          <h2>Sent</h2>
          <ul className="friend-list">
            {outgoing.map((row) => (
              <li key={row.id}>
                <span>{row.otherUsername ?? 'Unknown'}</span>
                <Button
                  variant="ghost"
                  onClick={() => void remove(row, 'Request canceled')}
                  disabled={busy}
                >
                  Cancel
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="friends-section">
        <h2>Your friends</h2>
        {friends.length === 0 && !loading ? (
          <p className="hint">No friends yet. Search for a username above.</p>
        ) : (
          <ul className="friend-list">
            {friends.map((row) => (
              <li key={row.id}>
                {row.otherUsername ? (
                  <Link to={`/friends/${row.otherUsername}`}>{row.otherUsername}</Link>
                ) : (
                  <span>Unknown</span>
                )}
                <span className="friend-actions">
                  {row.otherUsername && (
                    <ButtonLink variant="ghost" to={`/friends/${row.otherUsername}`}>
                      Collections
                    </ButtonLink>
                  )}
                  <Button
                    variant="ghost"
                    onClick={() => void remove(row, 'Unfriended')}
                    disabled={busy}
                  >
                    Unfriend
                  </Button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
