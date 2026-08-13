import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { GameForm } from '../components/GameForm'
import { deleteGame, getGame, gameToInput, replaceGame } from '../lib/games'
import type { GameInput } from '../types/game'
import './EditGamePage.css'

export function EditGamePage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState<GameInput | null>(null)
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    getGame(id)
      .then((row) => {
        if (cancelled) return
        if (!row) {
          setError('Game not found')
          setForm(null)
        } else {
          setForm(gameToInput(row))
          setName(row.name)
          setError(null)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  async function onSave() {
    if (!id || !form) return
    setSaving(true)
    setError(null)
    try {
      const updated = await replaceGame(id, form)
      navigate(`/games/${updated.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function onDelete() {
    if (!id) return
    if (!window.confirm(`Delete ${name || 'this game'} from the collection?`)) {
      return
    }
    setDeleting(true)
    setError(null)
    try {
      await deleteGame(id)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <section>
        <h1>Edit game</h1>
        <p className="hint">Loading…</p>
      </section>
    )
  }

  if (!user) {
    return (
      <section>
        <h1>Edit game</h1>
        <p className="lede">Only the owner can edit or delete games.</p>
        <p className="hint">
          <Link to="/login">Sign in</Link>
          {' · '}
          <Link to={id ? `/games/${id}` : '/'}>Back</Link>
        </p>
      </section>
    )
  }

  if (error && !form) {
    return (
      <section>
        <h1>Edit game</h1>
        <p className="error">{error}</p>
        <Link to="/">Back to collection</Link>
      </section>
    )
  }

  if (!form || !id) {
    return (
      <section>
        <h1>Edit game</h1>
        <p className="error">Not found</p>
      </section>
    )
  }

  return (
    <section>
      <p className="hint">
        <Link to={`/games/${id}`}>← {name}</Link>
      </p>
      <h1>Edit game</h1>
      {error && <p className="error">{error}</p>}
      <GameForm
        value={form}
        onChange={setForm}
        onSubmit={onSave}
        submitLabel="Save changes"
        busy={saving || deleting}
      />
      <button
        type="button"
        className="delete-button"
        onClick={onDelete}
        disabled={saving || deleting}
      >
        {deleting ? 'Deleting…' : 'Delete game'}
      </button>
    </section>
  )
}