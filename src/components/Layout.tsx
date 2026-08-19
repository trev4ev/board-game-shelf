import { useEffect, useRef, useState } from 'react'
import { Menu, Plus, X } from 'lucide-react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
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
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!menuOpen) return

    function onPointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [menuOpen])

  return (
    <div className="app-shell">
      <header className="app-header">
        <Brand />
        <div
          className={menuOpen ? 'app-header-actions open' : 'app-header-actions'}
          ref={menuRef}
        >
          <button
            type="button"
            className="header-menu-btn"
            aria-expanded={menuOpen}
            aria-controls="header-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? (
              <X size={22} strokeWidth={2} aria-hidden />
            ) : (
              <Menu size={22} strokeWidth={2} aria-hidden />
            )}
            <span className="visually-hidden">{menuOpen ? 'Close menu' : 'Open menu'}</span>
          </button>
          <div id="header-menu" className="app-header-menu">
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
