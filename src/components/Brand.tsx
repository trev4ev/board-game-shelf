import { NavLink } from 'react-router-dom'
import './Brand.css'

export function Brand() {
  return (
    <NavLink to="/" className="brand">
      <span className="brand-mark" aria-hidden>
        <svg viewBox="0 0 32 32" fill="currentColor">
          <circle cx="16" cy="6.2" r="4.4" />
          <path d="M8.2 14.2c0-3.1 3.5-4.8 7.8-4.8s7.8 1.7 7.8 4.8v.9c4 1.1 6.7 4.8 6.7 9.1V27H1.5v-2.8c0-4.3 2.7-8 6.7-9.1z" />
        </svg>
      </span>
      <span className="brand-text">
        <span className="brand-name">tabletop</span>
        <span className="brand-sub">Collection</span>
      </span>
    </NavLink>
  )
}
