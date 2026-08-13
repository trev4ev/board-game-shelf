import { Link, Navigate } from 'react-router-dom'
import { GameForm } from '../components/GameForm'
import { useAddGame } from './AddGameLayout'
import './AddGamePage.css'

export function AddGameReviewPage() {
  const { user, form, setForm, selectedBggId, status, error, onSave } =
    useAddGame()

  if (!form.name && selectedBggId == null) {
    return <Navigate to="/games/new" replace />
  }

  return (
    <section>
      <p className="hint">
        <Link to="/games/new">← Search results</Link>
      </p>
      <h1>Game details</h1>
      <p className="lede">
        Review the prefilled fields, add notes if you want, then save.
      </p>
      {!user && (
        <p className="hint">
          Saving requires an owner account. <Link to="/login">Sign in</Link>
        </p>
      )}
      {error && <p className="error">{error}</p>}
      <GameForm
        value={form}
        onChange={setForm}
        onSubmit={onSave}
        submitLabel="Save to collection"
        busy={status === 'saving'}
        disabled={!user}
      />
    </section>
  )
}