import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { useCollections } from '../auth/CollectionProvider'
import { Button, ButtonLink } from '../components/Button'
import { createCollection } from '../lib/collections'
import './HomePage.css'

export function HomePage() {
  const { user, profile } = useAuth()
  const { accepted, pendingInvites, loading, refresh, acceptInvite, declineInvite } =
    useCollections()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onCreate(event: FormEvent) {
    event.preventDefault()
    if (!user) return
    setBusy(true)
    setError(null)
    try {
      const collection = await createCollection(user.id, name)
      setName('')
      await refresh()
      navigate(`/c/${collection.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create collection')
      setBusy(false)
    }
  }

  if (user && accepted.length === 1 && pendingInvites.length === 0 && !loading) {
    const only = accepted[0]
    if (only) return <Navigate to={`/c/${only.collection.id}`} replace />
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
          Guests can still browse a collection if someone shares the link.
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
      <p className="lede">
        {profile?.username
          ? `Hi ${profile.username}. Open a shelf you co-own, or start another.`
          : 'Open a shelf you co-own, or start another.'}
      </p>

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

      {!loading && accepted.length === 0 && (
        <p className="hint">You do not co-own a collection yet.</p>
      )}

      {accepted.length > 0 && (
        <ul className="collection-card-list">
          {accepted.map((item) => (
            <li key={item.collection.id}>
              <Link to={`/c/${item.collection.id}`} className="collection-card">
                <strong>{item.collection.name}</strong>
                <span>Open shelf</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <form className="new-collection-form" onSubmit={(event) => void onCreate(event)}>
        <h2>New collection</h2>
        <label>
          Name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Game night shelf"
            required
            disabled={busy}
          />
        </label>
        <Button type="submit" variant="primary" disabled={busy || !name.trim()}>
          {busy ? 'Creating…' : 'Create collection'}
        </Button>
        {error && <p className="error">{error}</p>}
      </form>
    </section>
  )
}
