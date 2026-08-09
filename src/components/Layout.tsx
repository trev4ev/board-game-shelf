import { NavLink, Outlet } from 'react-router-dom'
import { isBggLookupEnabled } from '../lib/gameLookup'
import { isSupabaseConfigured } from '../lib/supabase'
import './Layout.css'

export function Layout() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <NavLink to="/" className="brand">
          Board Game Shelf
        </NavLink>
        <nav className="app-nav">
          <NavLink to="/">Collection</NavLink>
          <NavLink to="/games/new">Add game</NavLink>
          <NavLink to="/login">Owner login</NavLink>
        </nav>
      </header>

      {(!isSupabaseConfigured || !isBggLookupEnabled) && (
        <aside className="dev-banners" aria-label="Setup status">
          {!isSupabaseConfigured && (
            <p className="banner">
              Supabase env not set — copy <code>.env.example</code> to{' '}
              <code>.env</code> when ready.
            </p>
          )}
          {!isBggLookupEnabled && (
            <p className="banner muted">
              BGG lookup disabled (Phase A). Manual entry only until the API
              token is wired.
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
