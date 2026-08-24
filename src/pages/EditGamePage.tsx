import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useCollections } from '../auth/CollectionProvider'
import { Button } from '../components/Button'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { GameForm } from '../components/GameForm'
import { isAcceptedMember } from '../lib/collections'
import { deleteGame, getGame, gameToInput, replaceGame } from '../lib/games'
import type { GameInput } from '../types/game'
import './EditGamePage.css'

export function EditGamePage() {
  const { id } = useParams()
  const { memberships, setActiveCollectionId } = useCollections()
  const navigate = useNavigate()
  const [form, setForm] = useState<GameInput | null>(null)
  const [name, setName] = useState('')
  const [collectionId, setCollectionId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

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
          setCollectionId(row.collectionId)
          setActiveCollectionId(row.collectionId)
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
  }, [id, setActiveCollectionId])

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
    if (!id || deleting) return
    setDeleting(true)
    setError(null)
    try {
      await deleteGame(id)
      navigate(collectionId ? `/c/${collectionId}` : '/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  const canEdit = Boolean(collectionId && isAcceptedMember(memberships, collectionId))

  if (loading) {
    return (
      <section>
        <h1>Edit game</h1>
        <p className="hint">Loading…</p>
      </section>
    )
  }

  if (!canEdit) {
    return (
      <section>
        <h1>Edit game</h1>
        <p className="lede">Only collection members can edit or delete games.</p>
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
        <Link to={collectionId ? `/c/${collectionId}` : '/'}>Back to collection</Link>
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
      <Button
        type="button"
        variant="danger"
        className="delete-button"
        onClick={() => setConfirmDelete(true)}
        disabled={saving || deleting}
      >
        {deleting ? 'Deleting…' : 'Delete game'}
      </Button>
      <ConfirmDialog
        open={confirmDelete}
        title="Delete game?"
        description={`Delete ${name || 'this game'} from the collection?`}
        confirmLabel={deleting ? 'Deleting…' : 'Delete game'}
        danger
        busy={saving || deleting}
        onConfirm={() => void onDelete()}
        onCancel={() => {
          if (!saving && !deleting) setConfirmDelete(false)
        }}
      />
    </section>
  )
}