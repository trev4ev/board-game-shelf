import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { rememberReturnTo } from '../lib/postAuth'
import { useAuth } from './AuthProvider'

export function RequireUsername() {
  const { user, loading, profileLoading, needsUsername } = useAuth()
  const location = useLocation()

  if (loading || (user && profileLoading)) {
    return (
      <section>
        <p className="hint">Loading account…</p>
      </section>
    )
  }

  if (user && needsUsername && location.pathname !== '/onboarding') {
    rememberReturnTo(`${location.pathname}${location.search}`)
    return <Navigate to="/onboarding" replace />
  }

  return <Outlet />
}
