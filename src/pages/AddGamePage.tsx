import { isBggLookupEnabled } from '../lib/gameLookup'

export function AddGamePage() {
  return (
    <section>
      <h1>Add game</h1>
      <p className="lede">
        Manual entry form goes here. BGG search will sit above it when Phase B
        is enabled.
      </p>
      {isBggLookupEnabled ? (
        <p>BGG lookup is enabled — wire the search UI next.</p>
      ) : (
        <p className="hint">BGG lookup is off. Use manual fields only for now.</p>
      )}
    </section>
  )
}
