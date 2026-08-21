import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { useCollections } from '../auth/CollectionProvider'
import { ButtonLink } from '../components/Button'
import {
  joinCollectionByInvite,
  lookupCollectionInvite,
  type CollectionInvitePreview,
} from '../lib/collections'
import {
  clearPendingInvite,
  inviteTokenIsValid,
  rememberPendingInvite,
} from '../lib/pendingInvite'
import { isSupabaseConfigured } from '../lib/supabase'
import './LoginPage.css'

export function InvitePage() {
  const { token = '' } = useParams()
  const { user, loading, profileLoading, needsUsername } = useAuth()
  const { refresh, setActiveCollectionId } = useCollections()
  const navigate = useNavigate()
  const [preview, setPreview] = useState<CollectionInvitePreview | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [lookupDone, setLookupDone] = useState(false)
  const joining = useRef(false)

  const validToken = inviteTokenIsValid(token)

  useEffect(() => {
    if (!validToken) return
    rememberPendingInvite(token)
  }, [token, validToken])

  useEffect(() => {
    if (!isSupabaseConfigured || !validToken) {
      setLookupDone(true)
      return
    }
    let cancelled = false
    setLookupDone(false)
    lookupCollectionInvite(token)
      .then((row) => {
        if (cancelled) return
        setPreview(row)
        if (!row) {
          clearPendingInvite()
          setError('This invite link is invalid or has been replaced.')
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Could not open invite')
        }
      })
      .finally(() => {
        if (!cancelled) setLookupDone(true)
      })
    return () => {
      cancelled = true
    }
  }, [token, validToken])

  useEffect(() => {
    if (!preview || loading || profileLoading || joining.current) return
    if (user && needsUsername) {
      navigate('/onboarding', { replace: true })
      return
    }
    if (!user || needsUsername) return

    joining.current = true
    joinCollectionByInvite(token)
      .then(async (collectionId) => {
        clearPendingInvite()
        setActiveCollectionId(collectionId)
        await refresh()
        navigate(`/c/${collectionId}`, { replace: true })
      })
      .catch((err) => {
        joining.current = false
        setError(err instanceof Error ? err.message : 'Could not join this collection')
      })
  }, [
    loading,
    navigate,
    needsUsername,
    preview,
    profileLoading,
    refresh,
    setActiveCollectionId,
    token,
    user,
  ])

  if (!validToken) {
    return (
      <section>
        <h1>Join collection</h1>
        <p className="error">This invite link is invalid.</p>
        <p className="hint">
          <Link to="/">Back to collections</Link>
        </p>
      </section>
    )
  }

  const joiningNow = Boolean(user && preview && !needsUsername && !error)
  if (!lookupDone || loading || profileLoading || joiningNow) {
    return (
      <section>
        <h1>Join collection</h1>
        <p className="hint">{user ? 'Joining…' : 'Loading invite…'}</p>
      </section>
    )
  }

  if (error || !preview) {
    return (
      <section>
        <h1>Join collection</h1>
        <p className="error">{error ?? 'This invite link is invalid or has been replaced.'}</p>
        <p className="hint">
          <Link to="/">Back to collections</Link>
        </p>
      </section>
    )
  }

  return (
    <section>
      <h1>Join {preview.name}</h1>
      <p className="lede">
        You have been invited to co-own this collection. Sign in — or create an
        account and choose a username — and you will be added as a member.
      </p>
      <div className="auth-actions">
        <ButtonLink to={`/login?invite=${token}`} variant="primary">
          Sign in to join
        </ButtonLink>
      </div>
    </section>
  )
}
