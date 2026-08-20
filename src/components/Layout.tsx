import { useEffect, useRef, useState } from 'react'
import { Menu, Plus, X } from 'lucide-react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { CollectionProvider, useCollections } from '../auth/CollectionProvider'
import { isBggLookupEnabled } from '../lib/gameLookup'
import { isSupabaseConfigured } from '../lib/supabase'
import { Brand } from './Brand'
import { Button, ButtonLink } from './Button'
import './Layout.css'

function initials(label: string | undefined) {
  if (!label) return '?'
  return label.charAt(0).toUpperCase()
}

function HeaderNav() {
  const { user, profile } = useAuth()
  const { currentCollectionId, isMember, pendingInvites, acceptInvite, declineInvite } =
    useCollections()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const displayName = profile?.username ?? user?.email ?? 'Account'
  const addGameTo = currentCollectionId && isMember ? `/c/${currentCollectionId}/games/new` : null

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
    <>
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
              <>
                <NavLink to="/" className="header-nav-link">
                  Collections
                </NavLink>
                <NavLink to="/friends" className="header-nav-link">
                  Friends
                </NavLink>
                <NavLink to="/login" className="owner-chip">
                  <span className="owner-avatar" aria-hidden>
                    {initials(profile?.username ?? user.email)}
                  </span>
                  <span className="owner-meta">
                    <span className="owner-name">{displayName}</span>
                    <span className="owner-role">
                      {profile?.username ? 'Signed in' : 'Finish setup'}
                    </span>
                  </span>
                </NavLink>
              </>
            ) : (
              <NavLink to="/login" className="owner-login">
                Sign in
              </NavLink>
            )}
            {addGameTo && (
              <ButtonLink to={addGameTo} variant="outline" className="add-game-btn">
                <Plus size={16} strokeWidth={2.25} aria-hidden />
                Add game
              </ButtonLink>
            )}
          </div>
        </div>
      </header>
      {pendingInvites.length > 0 && (
        <aside className="invite-banners" aria-label="Collection invites">
          {pendingInvites.map((invite) => (
            <p key={invite.collection.id} className="invite-banner">
              Invited to <strong>{invite.collection.name}</strong>
              <span className="invite-banner-actions">
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
            </p>
          ))}
        </aside>
      )}
    </>
  )
}

export function Layout() {
  return (
    <CollectionProvider>
      <div className="app-shell">
        <HeaderNav />

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
    </CollectionProvider>
  )
}
