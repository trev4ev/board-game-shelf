import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { Button } from '../components/Button'
import { nextPathAfterAuth, peekPendingInvite, rememberPendingInvite } from '../lib/pendingInvite'
import './LoginPage.css'

function GoogleMark() {
  return (
    <svg viewBox="0 0 18 18" width="18" height="18" aria-hidden>
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.92c1.71-1.58 2.68-3.9 2.68-6.61z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.19l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.71H.96v2.33A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.7c-.18-.54-.28-1.11-.28-1.7s.1-1.16.28-1.7V4.97H.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.03l3.01-2.33z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.97l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"
      />
    </svg>
  )
}

export function LoginPage() {
  const {
    user,
    profile,
    loading,
    profileLoading,
    needsUsername,
    isConfigured,
    sendLoginEmail,
    verifyOtp,
    signInWithGoogle,
    signOut,
  } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const emailRef = useRef<HTMLInputElement>(null)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const joiningInvite = Boolean(searchParams.get('invite') || peekPendingInvite())

  useEffect(() => {
    const token = searchParams.get('invite')
    if (token) rememberPendingInvite(token)
  }, [searchParams])

  useEffect(() => {
    if (!user || loading || profileLoading) return
    if (!peekPendingInvite()) return
    navigate(nextPathAfterAuth(needsUsername), { replace: true })
  }, [loading, navigate, needsUsername, profileLoading, user])

  function emailValue() {
    return email.trim() || emailRef.current?.value.trim() || ''
  }

  async function onSendLink(event: FormEvent) {
    event.preventDefault()
    const address = emailValue()
    if (!address) {
      setError('Enter your email, then request a login code.')
      return
    }

    setEmail(address)
    setError(null)
    setBusy(true)
    try {
      await sendLoginEmail(address)
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send login email')
    } finally {
      setBusy(false)
    }
  }

  async function onVerifyOtp(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setBusy(true)
    try {
      await verifyOtp(emailValue(), otp.trim())
      navigate(nextPathAfterAuth(needsUsername))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid or expired code')
    } finally {
      setBusy(false)
    }
  }

  async function onGoogle() {
    setError(null)
    setBusy(true)
    try {
      await signInWithGoogle()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start Google sign-in')
      setBusy(false)
    }
  }

  if (!isConfigured) {
    return (
      <section>
        <h1>Sign in</h1>
        <p className="lede">Supabase is not configured in this environment.</p>
      </section>
    )
  }

  if (loading) {
    return (
      <section>
        <h1>Sign in</h1>
        <p className="hint">Checking session…</p>
      </section>
    )
  }

  if (user) {
    return (
      <section>
        <h1>Signed in</h1>
        <p className="lede">
          {profile?.username ? (
            <>
              Signed in as <strong>{profile.username}</strong>
              {user.email ? ` (${user.email})` : ''}.
            </>
          ) : (
            <>
              Signed in as <strong>{user.email ?? 'your account'}</strong>. Choose a
              username to finish setup.
            </>
          )}
        </p>
        <div className="auth-actions">
          <Link to={nextPathAfterAuth(needsUsername)} className="button-link">
            {needsUsername
              ? 'Choose a username'
              : joiningInvite
                ? 'Join collection'
                : 'Your collections'}
          </Link>
          <button
            type="button"
            className="button-secondary"
            onClick={() => signOut()}
          >
            Sign out
          </button>
        </div>
      </section>
    )
  }

  return (
    <section>
      <h1>Sign in</h1>
      <p className="lede">
        Create an account or sign in to{' '}
        {joiningInvite
          ? 'join this collection.'
          : 'manage your collections, invite co-owners, and tag friends on plays.'}
      </p>

      <form className="auth-form" onSubmit={(event) => void onSendLink(event)}>
        <label>
          Email
          <input
            ref={emailRef}
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setSent(false)
            }}
            onInput={(e) => setEmail(e.currentTarget.value)}
            required
            autoComplete="email"
            disabled={busy}
          />
        </label>
        <Button type="submit" variant="primary" disabled={busy}>
          {busy && !sent ? 'Sending…' : sent ? 'Resend magic code' : 'Send me magic code'}
        </Button>
      </form>

      {sent && (
        <>
          <p className="hint">
            Check your inbox. Click the link, or paste the 6-digit code here.
          </p>
          <form className="auth-form" onSubmit={(event) => void onVerifyOtp(event)}>
            <label>
              One-time code
              <input
                inputMode="numeric"
                autoComplete="one-time-code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                minLength={6}
                placeholder="123456"
              />
            </label>
            <Button type="submit" variant="primary" disabled={busy}>
              {busy ? 'Verifying…' : 'Verify code'}
            </Button>
          </form>
        </>
      )}

      <p className="hint auth-divider">or</p>

      <div className="auth-form">
        <Button variant="outline" onClick={() => void onGoogle()} disabled={busy}>
          <GoogleMark />
          Continue with Google
        </Button>
      </div>

      {error && <p className="error">{error}</p>}
    </section>
  )
}
