import { Link } from 'react-router-dom'
import { GameForm } from '../components/GameForm'
import { isBggLookupEnabled } from '../lib/gameLookup'
import { useAddGame } from './AddGameLayout'
import './AddGamePage.css'

export function AddGameSearchPage() {
  const {
    user,
    isDesktop,
    query,
    setQuery,
    results,
    selectedBggId,
    form,
    setForm,
    status,
    error,
    onSearch,
    onPick,
    onSave,
  } = useAddGame()

  const showFormHere = isDesktop || selectedBggId == null
  const split = isDesktop && selectedBggId != null

  return (
    <section>
      <h1>Add game</h1>
      <p className="lede">
        Search BoardGameGeek to prefill, or enter a game by hand. Saving requires
        an owner account.
      </p>

      {!user && (
        <p className="hint">
          You can fill in details without signing in, but saving requires an
          owner account. <Link to="/login">Sign in</Link>
        </p>
      )}

      <div className={split ? 'add-game-split has-selection' : 'add-game-split'}>
        <div className="add-game-search-pane">
          {isBggLookupEnabled ? (
            <div className="bgg-lookup">
              <form className="bgg-search" onSubmit={onSearch}>
                <label htmlFor="bgg-query">Search BGG</label>
                <div className="bgg-search-row">
                  <input
                    id="bgg-query"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g. Cascadia"
                    autoComplete="off"
                  />
                  <button type="submit" disabled={status === 'searching'}>
                    {status === 'searching' ? 'Searching…' : 'Search'}
                  </button>
                </div>
                <p className="hint">
                  BGG allows about one request every 5 seconds — searches may
                  pause briefly.
                </p>
              </form>

              {results.length > 0 && (
                <ul className="bgg-results">
                  {results.map((hit) => (
                    <li key={hit.bggId}>
                      <button
                        type="button"
                        className={
                          selectedBggId === hit.bggId ? 'selected' : undefined
                        }
                        onClick={() => onPick(hit)}
                        disabled={status === 'loading' || status === 'saving'}
                      >
                        <span className="bgg-result-name">{hit.name}</span>
                        {hit.yearPublished != null && (
                          <span className="bgg-result-year">
                            ({hit.yearPublished})
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {status === 'loading' && <p className="hint">Loading details…</p>}
            </div>
          ) : (
            <p className="hint">
              BGG lookup is off. You can still add a game manually, or set{' '}
              <code>VITE_BGG_LOOKUP_ENABLED=true</code> for search.
            </p>
          )}
        </div>

        {showFormHere && (
          <div className="add-game-form-pane">
            {error && <p className="error">{error}</p>}
            <h2 className="form-heading">
              {selectedBggId != null ? 'Selected game' : 'Game details'}
            </h2>
            <GameForm
              value={form}
              onChange={setForm}
              onSubmit={onSave}
              submitLabel="Save to collection"
              busy={status === 'saving'}
              disabled={!user}
            />
          </div>
        )}
      </div>

      {!showFormHere && error && <p className="error">{error}</p>}
    </section>
  )
}