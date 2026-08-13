import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import './LoginPage.css'

export function LoginPage() {
  const {
    user,
    loading,
    isConfigured,
    sendLoginEmail,
    verifyOtp,
    signInWithPassword,
    signOut,
  } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSendLink(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setBusy(true)
    try {
      await sendLoginEmail(email.trim())
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send login email')
    } finally {
      setBusy(false)
    }
  }

  async function onPasswordSignIn(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setBusy(true)
    try {
      await signInWithPassword(email.trim(), password)
      navigate('/games/new')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign in')
    } finally {
      setBusy(false)
    }
  }

  async function onVerifyOtp(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setBusy(true)
    try {
      await verifyOtp(email.trim(), otp.trim())
      navigate('/games/new')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid or expired code')
    } finally {
      setBusy(false)
    }
  }

  if (!isConfigured) {
    return (
      <section>
        <h1>Owner login</h1>
        <p className="lede">Supabase is not configured in this environment.</p>
      </section>
    )
  }

  if (loading) {
    return (
      <section>
        <h1>Owner login</h1>
        <p className="hint">Checking session…</p>
      </section>
    )
  }

  if (user) {
    return (
      <section>
        <h1>Owner login</h1>
        <p className="lede">
          Signed in as <strong>{user.email}</strong>. Guests stay view-only;
          you can add and edit games.
        </p>
        <div className="auth-actions">
          <Link to="/games/new" className="button-link">
            Add a game
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
      <h1>Owner login</h1>
      <p className="lede">
        Sign in with a password (no email sent), or request a one-time login
        email. Supabase’s built-in mailer allows about two emails per hour.
      </p>

      <form className="auth-form" onSubmit={onPasswordSignIn}>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setSent(false)
            }}
            required
            autoComplete="email"
            disabled={busy}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            disabled={busy}
          />
        </label>
        <button type="submit" disabled={busy || !password}>
          {busy ? 'Please wait…' : 'Sign in with password'}
        </button>
      </form>

      <p className="hint">
        Need a password? In the Supabase dashboard go to Authentication → Users,
        open your user (or add one), set a password, and leave the user
        confirmed.
      </p>

      <form className="auth-form" onSubmit={onSendLink}>
        <button type="submit" disabled={busy || !email.trim()} className="button-secondary">
          {busy && !sent ? 'Sending…' : sent ? 'Resend login email' : 'Email me a login code'}
        </button>
      </form>

      {sent && (
        <>
          <p className="hint">
            Check your inbox. Click the link, or paste the 6-digit code here.
          </p>
          <form className="auth-form" onSubmit={onVerifyOtp}>
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
            <button type="submit" disabled={busy}>
              {busy ? 'Verifying…' : 'Verify code'}
            </button>
          </form>
        </>
      )}

      {error && <p className="error">{error}</p>}
    </section>
  )
}
