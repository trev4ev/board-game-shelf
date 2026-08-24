import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { useCollections } from '../auth/CollectionProvider'
import { Button } from '../components/Button'
import { ConfirmDialog } from '../components/ConfirmDialog'
import {
  canRemoveCollectionMember,
  deleteCollection,
  getCollection,
  getCollectionInviteToken,
  inviteCollectionMember,
  isCollectionCreator,
  listCollectionMembers,
  regenerateCollectionInvite,
  removeCollectionMember,
  renameCollection,
} from '../lib/collections'
import { appUrl } from '../lib/appUrl'
import { copyText } from '../lib/copyText'
import { usernameSearchMessage, useUsernameSearch } from '../lib/useUsernameSearch'
import type { Collection, CollectionMember } from '../types/collection'
import './CollectionSettingsPage.css'

type PendingConfirm =
  | { type: 'regenerateInvite' }
  | { type: 'removeMember'; member: CollectionMember }
  | { type: 'deleteCollection' }

function confirmCopy(
  pending: PendingConfirm,
  userId: string,
  collectionName: string,
) {
  switch (pending.type) {
    case 'regenerateInvite':
      return {
        title: 'Replace invite link?',
        description: 'The old link will stop working.',
        confirmLabel: 'Replace link',
        danger: false,
      }
    case 'removeMember': {
      const self = pending.member.userId === userId
      const label = pending.member.username ?? 'this member'
      if (self) {
        return {
          title: 'Leave collection?',
          description: 'You will lose edit access.',
          confirmLabel: 'Leave',
          danger: true,
        }
      }
      if (pending.member.status === 'pending') {
        return {
          title: 'Cancel invite?',
          description: `${label} will not be added as a co-owner.`,
          confirmLabel: 'Cancel invite',
          danger: false,
        }
      }
      return {
        title: 'Remove member?',
        description: `Remove ${label} from this collection?`,
        confirmLabel: 'Remove',
        danger: true,
      }
    }
    case 'deleteCollection':
      return {
        title: 'Delete collection?',
        description: `${collectionName} and its games and plays will be removed.`,
        confirmLabel: 'Delete collection',
        danger: true,
      }
  }
}

export function CollectionSettingsPage() {
  const { collectionId } = useParams()
  const { user } = useAuth()
  const { isMember, refresh } = useCollections()
  const navigate = useNavigate()
  const [collection, setCollection] = useState<Collection | null>(null)
  const [members, setMembers] = useState<CollectionMember[]>([])
  const [name, setName] = useState('')
  const [invite, setInvite] = useState('')
  const [inviteToken, setInviteToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [hint, setHint] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [confirmAction, setConfirmAction] = useState<PendingConfirm | null>(null)
  const { hits: suggestions, status: searchStatus } = useUsernameSearch(invite, user?.id)

  useEffect(() => {
    if (!collectionId) return
    let cancelled = false
    setLoading(true)
    Promise.all([
      getCollection(collectionId),
      listCollectionMembers(collectionId).catch(() => [] as CollectionMember[]),
      getCollectionInviteToken(collectionId).catch(() => null),
    ])
      .then(([shelf, roster, token]) => {
        if (cancelled) return
        setCollection(shelf)
        setName(shelf?.name ?? '')
        setMembers(roster)
        setInviteToken(token)
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

  async function onCopyInviteLink() {
    if (!inviteToken) return
    const copied = await copyText(appUrl(`invite/${inviteToken}`))
    if (copied) {
      setHint('Invite link copied')
      setError(null)
    } else {
      setError('Could not copy. Select the link and copy it yourself.')
    }
  }

  async function onCopyBrowseLink() {
    if (!collectionId) return
    const copied = await copyText(appUrl(`c/${collectionId}`))
    if (copied) {
      setHint('Collection link copied')
      setError(null)
    } else {
      setError('Could not copy. Select the link and copy it yourself.')
    }
  }

  async function regenerateInvite() {
    if (!collectionId) return
    setBusy(true)
    setError(null)
    try {
      const token = await regenerateCollectionInvite(collectionId)
      setInviteToken(token)
      setHint('New invite link created')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not replace invite link')
    } finally {
      setBusy(false)
    }
  }

  function onRegenerateInviteLink() {
    if (!collectionId) return
    if (inviteToken) {
      setConfirmAction({ type: 'regenerateInvite' })
      return
    }
    void regenerateInvite()
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

  async function removeMember(member: CollectionMember) {
    if (!collectionId || !user) return
    const self = member.userId === user.id
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

  async function deleteShelf() {
    if (!collectionId) return
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

  async function onConfirmPending() {
    if (!confirmAction || busy) return
    const current = confirmAction
    setConfirmAction(null)
    if (current.type === 'regenerateInvite') await regenerateInvite()
    else if (current.type === 'removeMember') await removeMember(current.member)
    else await deleteShelf()
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
  const confirm = confirmAction
    ? confirmCopy(confirmAction, user.id, collection.name)
    : null

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

      <div className="settings-form">
        <h2>Share collection</h2>
        <p className="hint">
          Anyone with this link can browse, filter, and pick a game. They do
          not become a member.
        </p>
        <label>
          Browse link
          <input
            value={appUrl(`c/${collectionId}`)}
            readOnly
            onFocus={(event) => event.currentTarget.select()}
          />
        </label>
        <div className="invite-link-actions">
          <Button
            type="button"
            variant="secondary"
            onClick={() => void onCopyBrowseLink()}
            disabled={busy}
          >
            Copy browse link
          </Button>
        </div>
      </div>

      <div className="settings-form">
        <h2>Invite link</h2>
        <p className="hint">
          Anyone with this link can join as a co-owner after they sign in. New
          users will create an account, choose a username, and then be added.
          Use this only when you want them to edit the shelf — not for
          browsing.
        </p>
        {inviteToken ? (
          <>
            <label>
              Link
              <input
                value={appUrl(`invite/${inviteToken}`)}
                readOnly
                onFocus={(event) => event.currentTarget.select()}
              />
            </label>
            <div className="invite-link-actions">
              <Button
                type="button"
                variant="primary"
                onClick={() => void onCopyInviteLink()}
                disabled={busy}
              >
                Copy invite link
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => void onRegenerateInviteLink()}
                disabled={busy}
              >
                Replace link
              </Button>
            </div>
          </>
        ) : (
          <Button
            type="button"
            variant="primary"
            onClick={() => void onRegenerateInviteLink()}
            disabled={busy}
          >
            Create invite link
          </Button>
        )}
      </div>

      <form className="settings-form" onSubmit={(event) => void onInvite(event)}>
        <h2>Invite by username</h2>
        <p className="hint">
          If they already have an account, you can add them by username.
          Co-owners can add games, log plays, and invite others. They cannot
          remove the original collection creator.
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
                    onClick={() => setConfirmAction({ type: 'removeMember', member })}
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
                    onClick={() => setConfirmAction({ type: 'removeMember', member })}
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
        <Button
          variant="secondary"
          onClick={() => setConfirmAction({ type: 'deleteCollection' })}
          disabled={busy}
        >
          Delete collection
        </Button>
      </div>

      <ConfirmDialog
        open={confirm !== null}
        title={confirm?.title ?? ''}
        description={confirm?.description ?? ''}
        confirmLabel={confirm?.confirmLabel ?? 'Confirm'}
        danger={confirm?.danger ?? false}
        busy={busy}
        onConfirm={() => void onConfirmPending()}
        onCancel={() => {
          if (!busy) setConfirmAction(null)
        }}
      />
    </section>
  )
}
