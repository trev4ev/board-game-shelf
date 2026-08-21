import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useCollections } from '../auth/CollectionProvider'
import { LogPlayForm } from '../components/LogPlayForm'
import { isAcceptedMember } from '../lib/collections'
import { createPlay, getGame } from '../lib/games'
import type { Game } from '../types/game'
import type { PlayInput } from '../types/play'

export function LogPlayPage() {
  const { id } = useParams()
  const { memberships, setActiveCollectionId } = useCollections()
  const navigate = useNavigate()
  const [game, setGame] = useState<Game | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    getGame(id)
      .then((row) => {
        if (!cancelled) {
          setGame(row)
          setError(row ? null : 'Game not found')
          if (row) setActiveCollectionId(row.collectionId)
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

  async function onSubmit(input: PlayInput) {
    if (!game) return
    setSaving(true)
    setError(null)
    try {
      await createPlay(input, game)
      navigate(`/games/${game.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not log play')
      setSaving(false)
    }
  }

  const canEdit = Boolean(game && isAcceptedMember(memberships, game.collectionId))

  if (loading) {
    return (
      <section>
        <h1>Log play</h1>
        <p className="hint">Loading…</p>
      </section>
    )
  }

  if (!canEdit) {
    return (
      <section>
        <h1>Log play</h1>
        <p className="hint">
          Sign in as a collection member to log a play. <Link to="/login">Sign in</Link>
        </p>
      </section>
    )
  }

  if (!game) {
    return (
      <section>
        <h1>Log play</h1>
        <p className="error">{error ?? 'Not found'}</p>
        <Link to="/">Back to collection</Link>
      </section>
    )
  }

  return (
    <section>
      <p className="hint">
        <Link to={`/games/${game.id}`}>← {game.name}</Link>
      </p>
      <h1>Log play</h1>
      <LogPlayForm
        gameId={game.id}
        collectionId={game.collectionId}
        gameName={game.name}
        busy={saving}
        error={error}
        onSubmit={(input) => void onSubmit(input)}
        onCancel={() => navigate(`/games/${game.id}`)}
      />
    </section>
  )
}
