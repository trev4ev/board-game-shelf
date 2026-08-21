import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { useCollections } from '../auth/CollectionProvider'
import { Button } from '../components/Button'
import { ensureDefaultCollection } from '../lib/collections'
import { setUsername } from '../lib/profiles'
import { USERNAME_MAX, usernameError } from '../lib/username'
import './LoginPage.css'

export function OnboardingPage() {
  const { user, profile, loading, profileLoading, refreshProfile, needsUsername } =
    useAuth()
  const { refresh } = useCollections()
  const navigate = useNavigate()
  const [username, setValue] = useState(profile?.username ?? '')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (loading || profileLoading) {
    return (
      <section>
        <h1>Choose a username</h1>
        <p className="hint">Loading account…</p>
      </section>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!needsUsername && profile?.username) {
    return <Navigate to="/" replace />
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (!user) return
    const invalid = usernameError(username)
    if (invalid) {
      setError(invalid)
      return
    }
    setBusy(true)
    setError(null)
    try {
      const next = await setUsername(user.id, username)
      await refreshProfile()
      if (next.username) {
        await ensureDefaultCollection(user.id, next.username)
        await refresh()
      }
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save username')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section>
      <h1>Choose a username</h1>
      <p className="lede">
        Friends and co-owners will find you by this name. You can still log
        plays with guest names that have no account.
      </p>
      <form className="auth-form" onSubmit={onSubmit}>
        <label>
          Username
          <input
            value={username}
            onChange={(event) => setValue(event.target.value)}
            autoComplete="username"
            maxLength={USERNAME_MAX}
            placeholder="tabletop_pal"
            required
            disabled={busy}
          />
        </label>
        <p className="hint">3–20 characters. Letters, numbers, and underscores.</p>
        <Button type="submit" variant="primary" disabled={busy}>
          {busy ? 'Saving…' : 'Save username'}
        </Button>
      </form>
      {error && <p className="error">{error}</p>}
      <p className="hint">
        Wrong account? <Link to="/login">Sign out</Link>
      </p>
    </section>
  )
}
