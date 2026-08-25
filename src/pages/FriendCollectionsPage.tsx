import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { useCollections } from '../auth/CollectionProvider'
import { Button, ButtonLink } from '../components/Button'
import { CollectionCard } from '../components/CollectionCard'
import {
  listCollectionSummaries,
  listFriendCollections,
  listMyMemberships,
} from '../lib/collections'
import { friendNamesLabel } from '../lib/friendCollections'
import { gameCountLabel, memberCountLabel } from '../lib/collectionDisplay'
import {
  acceptFriendRequest,
  listFriendships,
  sendFriendRequest,
} from '../lib/friends'
import { findProfileByUsername } from '../lib/profiles'
import type { CollectionSummary, FriendCollection } from '../types/collection'
import type { Friendship } from '../types/friend'
import type { Profile } from '../types/profile'
import './FriendCollectionsPage.css'

export function FriendCollectionsPage() {
  const { username } = useParams()
  const { user } = useAuth()
  const { accepted } = useCollections()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [friendship, setFriendship] = useState<Friendship | null>(null)
  const [items, setItems] = useState<FriendCollection[]>([])
  const [summaries, setSummaries] = useState<Map<string, CollectionSummary>>(
    () => new Map(),
  )
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  const isSelf = Boolean(user && profile && user.id === profile.id)
  const isFriend = friendship?.status === 'accepted'
  const canViewCollections = isSelf || isFriend

  useEffect(() => {
    if (!user || !username) {
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    Promise.all([findProfileByUsername(username), listFriendships(user.id)])
      .then(async ([found, rows]) => {
        if (cancelled) return
        setProfile(found)
        const row = found
          ? (rows.find((item) => item.otherUserId === found.id) ?? null)
          : null
        setFriendship(row)
        if (!found) {
          setItems([])
          return
        }
        if (found.id === user.id) {
          const mine = await listMyMemberships(user.id)
          setItems(
            mine
              .filter((item) => item.status === 'accepted')
              .map((item) => ({
                collection: item.collection,
                friends: [{ userId: user.id, username: found.username }],
              })),
          )
          return
        }
        if (row?.status !== 'accepted') {
          setItems([])
          return
        }
        const usernames = new Map([[found.id, found.username]])
        setItems(await listFriendCollections([found.id], usernames))
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load collections')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [user, username])

  useEffect(() => {
    const ids = items.map((item) => item.collection.id)
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
  }, [items])

  async function refreshFriendship() {
    if (!user) return
    const rows = await listFriendships(user.id)
    const row = profile
      ? (rows.find((item) => item.otherUserId === profile.id) ?? null)
      : null
    setFriendship(row)
    if (profile && row?.status === 'accepted') {
      const usernames = new Map([[profile.id, profile.username]])
      setItems(await listFriendCollections([profile.id], usernames))
    } else if (!isSelf) {
      setItems([])
    }
  }

  async function request() {
    if (!user || !profile) return
    setBusy(true)
    setError(null)
    try {
      await sendFriendRequest(user.id, profile.id)
      await refreshFriendship()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send request')
    } finally {
      setBusy(false)
    }
  }

  async function accept() {
    if (!user || !friendship) return
    setBusy(true)
    setError(null)
    try {
      await acceptFriendRequest(friendship.id, user.id)
      await refreshFriendship()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not accept')
    } finally {
      setBusy(false)
    }
  }

  const displayName = profile?.username ?? username ?? 'Friend'
  const mineIds = new Set(accepted.map((item) => item.collection.id))

  return (
    <section className="friend-collections-page">
      <p className="hint collection-back">
        <Link to="/friends">← Friends</Link>
      </p>
      <h1>{isSelf ? 'Your collections' : `${displayName}'s collections`}</h1>

      {error && <p className="error">{error}</p>}
      {loading && <p className="hint">Loading collections…</p>}

      {!loading && !profile && (
        <p className="lede">No user with that username.</p>
      )}

      {!loading && profile && !canViewCollections && (
        <div className="friend-collections-locked">
          <p className="lede">
            Add {displayName} as a friend to browse their shelves.
          </p>
          {friendship?.status === 'pending' && friendship.addresseeId === user?.id ? (
            <Button variant="accent" onClick={() => void accept()} disabled={busy}>
              Accept friend request
            </Button>
          ) : friendship?.status === 'pending' ? (
            <p className="hint">Friend request pending.</p>
          ) : (
            <Button variant="accent" onClick={() => void request()} disabled={busy}>
              Add friend
            </Button>
          )}
        </div>
      )}

      {!loading && profile && canViewCollections && items.length === 0 && (
        <p className="hint">
          {isSelf
            ? 'You do not have a collection yet.'
            : `${displayName} has not added a collection yet.`}
        </p>
      )}

      {!loading && profile && canViewCollections && items.length > 0 && (
        <ul className="collection-card-list">
          {items.map((item) => {
            const summary = summaries.get(item.collection.id)
            const shared = !isSelf && mineIds.has(item.collection.id)
            const meta = isSelf
              ? `${gameCountLabel(summary?.gameCount ?? 0)} · ${memberCountLabel(summary?.memberCount ?? 1)}`
              : shared
                ? `${gameCountLabel(summary?.gameCount ?? 0)} · You co-own this`
                : `${gameCountLabel(summary?.gameCount ?? 0)} · ${friendNamesLabel(item.friends)}`
            return (
              <li key={item.collection.id}>
                <CollectionCard
                  to={`/c/${item.collection.id}`}
                  name={item.collection.name}
                  games={summary?.games ?? []}
                  meta={meta}
                />
              </li>
            )
          })}
        </ul>
      )}

      {isSelf && (
        <p className="hint">
          <ButtonLink to="/" variant="ghost">
            Manage your collections
          </ButtonLink>
        </p>
      )}
    </section>
  )
}
