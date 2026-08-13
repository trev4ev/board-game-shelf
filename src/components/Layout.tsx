import { Plus } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { isBggLookupEnabled } from '../lib/gameLookup'
import { isSupabaseConfigured } from '../lib/supabase'
import { Brand } from './Brand'
import { ButtonLink } from './Button'
import './Layout.css'

function ownerLabel(email: string | undefined) {
  if (!email) return 'Owner'
  const local = email.split('@')[0] ?? email
  return local.charAt(0).toUpperCase() + local.slice(1)
}

function initials(email: string | undefined) {
  if (!email) return '?'
  return email.charAt(0).toUpperCase()
}

export function Layout() {
  const { user } = useAuth()

  return (
    <div className="app-shell">
      <header className="app-header">
        <Brand />
        <nav className="app-nav">
          <NavLink to="/" end>
            Collection
          </NavLink>
        </nav>
        <div className="app-header-actions">
          {user ? (
            <NavLink to="/login" className="owner-chip">
              <span className="owner-avatar" aria-hidden>
                {initials(user.email)}
              </span>
              <span className="owner-meta">
                <span className="owner-name">{ownerLabel(user.email)}</span>
                <span className="owner-role">Owner</span>
              </span>
            </NavLink>
          ) : (
            <NavLink to="/login" className="owner-login">
              Owner login
            </NavLink>
          )}
          {user && (
            <ButtonLink to="/games/new" variant="outline" className="add-game-btn">
              <Plus size={16} strokeWidth={2.25} aria-hidden />
              Add game
            </ButtonLink>
          )}
        </div>
      </header>

      {(!isSupabaseConfigured || (import.meta.env.DEV && !isBggLookupEnabled)) && (
        <aside className="dev-banners" aria-label="Setup status">
          {!isSupabaseConfigured && (
            <p className="banner">
              Supabase env not set — copy <code>.env.example</code> to{' '}
              <code>.env</code> when ready.
            </p>
          )}
          {import.meta.env.DEV && !isBggLookupEnabled && (
            <p className="banner muted">
              BGG lookup disabled. Set <code>VITE_BGG_LOOKUP_ENABLED=true</code>{' '}
              for local search via the Vite proxy.
            </p>
          )}
        </aside>
      )}

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}
