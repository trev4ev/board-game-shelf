import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { Button } from './Button'
import { formatPlace, todayIsoDate } from '../lib/games/display'
import type { PlayInput, PlayPlayer } from '../types/play'
import './LogPlayForm.css'

type PlayerDraft = {
  key: string
  name: string
  score: string
  tiedWithAbove: boolean
}

function newPlayer(): PlayerDraft {
  return { key: crypto.randomUUID(), name: '', score: '', tiedWithAbove: false }
}

function parseScore(raw: string): number | null {
  const trimmed = raw.trim()
  if (!trimmed) return null
  const n = Number(trimmed)
  return Number.isFinite(n) ? n : null
}

function placesFor(players: PlayerDraft[]): number[] {
  let place = 1
  return players.map((player, index) => {
    if (index === 0 || !player.tiedWithAbove) {
      place = index + 1
    }
    return place
  })
}

type LogPlayFormProps = {
  gameId: string
  gameName: string
  busy?: boolean
  error?: string | null
  onSubmit: (input: PlayInput) => void
  onCancel: () => void
}

export function LogPlayForm({
  gameId,
  gameName,
  busy,
  error,
  onSubmit,
  onCancel,
}: LogPlayFormProps) {
  const [playedOn, setPlayedOn] = useState(todayIsoDate)
  const [players, setPlayers] = useState<PlayerDraft[]>(() => [newPlayer(), newPlayer()])
  const [formError, setFormError] = useState<string | null>(null)
  const places = useMemo(() => placesFor(players), [players])

  function patchPlayer(key: string, partial: Partial<PlayerDraft>) {
    setPlayers((current) =>
      current.map((player) => (player.key === key ? { ...player, ...partial } : player)),
    )
  }

  function movePlayer(index: number, direction: -1 | 1) {
    const next = index + direction
    if (next < 0 || next >= players.length) return
    setPlayers((current) => {
      const copy = [...current]
      const a = copy[index]
      const b = copy[next]
      if (!a || !b) return current
      copy[index] = b
      copy[next] = a
      if (copy[0]) copy[0] = { ...copy[0], tiedWithAbove: false }
      return copy
    })
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const named: PlayPlayer[] = []
    const assigned = placesFor(players)
    for (const [index, player] of players.entries()) {
      const name = player.name.trim()
      if (!name) continue
      named.push({
        name,
        place: assigned[index] ?? named.length + 1,
        score: parseScore(player.score),
      })
    }

    if (named.length === 0) {
      setFormError('Add at least one player.')
      return
    }

    setFormError(null)
    onSubmit({ gameId, playedOn, players: named })
  }

  return (
    <form className="log-play-form" onSubmit={handleSubmit}>
      <p className="hint log-play-game">{gameName}</p>
      <label className="log-play-date">
        Date played
        <input
          type="date"
          value={playedOn}
          onChange={(event) => setPlayedOn(event.target.value)}
          required
        />
      </label>

      <fieldset className="log-play-players">
        <legend>Players (first place at the top)</legend>
        {players.map((player, index) => (
          <div key={player.key} className="log-play-row">
            <span className="log-play-place">{formatPlace(places[index] ?? index + 1)}</span>
            <input
              className="log-play-name"
              value={player.name}
              onChange={(event) => patchPlayer(player.key, { name: event.target.value })}
              placeholder="Name"
              autoComplete="off"
              aria-label={`${formatPlace(places[index] ?? index + 1)} player name`}
            />
            <input
              className="log-play-score"
              value={player.score}
              onChange={(event) => patchPlayer(player.key, { score: event.target.value })}
              placeholder="Score"
              inputMode="decimal"
              autoComplete="off"
              aria-label={`${formatPlace(places[index] ?? index + 1)} score (optional)`}
            />
            <span className="log-play-row-actions">
              <button
                type="button"
                className="log-play-icon"
                onClick={() => movePlayer(index, -1)}
                disabled={index === 0}
                aria-label="Move up"
              >
                <ChevronUp size={16} strokeWidth={2} />
              </button>
              <button
                type="button"
                className="log-play-icon"
                onClick={() => movePlayer(index, 1)}
                disabled={index === players.length - 1}
                aria-label="Move down"
              >
                <ChevronDown size={16} strokeWidth={2} />
              </button>
              <button
                type="button"
                className="log-play-icon"
                onClick={() =>
                  setPlayers((current) => {
                    const next = current.filter((item) => item.key !== player.key)
                    if (next[0]) next[0] = { ...next[0], tiedWithAbove: false }
                    return next.length === 0 ? current : next
                  })
                }
                disabled={players.length <= 1}
                aria-label="Remove player"
              >
                <Trash2 size={16} strokeWidth={2} />
              </button>
            </span>
            {index > 0 ? (
              <button
                type="button"
                className={player.tiedWithAbove ? 'log-play-tie on' : 'log-play-tie'}
                onClick={() =>
                  patchPlayer(player.key, { tiedWithAbove: !player.tiedWithAbove })
                }
              >
                {player.tiedWithAbove ? 'Tied with above' : 'Mark as tied'}
              </button>
            ) : null}
          </div>
        ))}
        <Button
          variant="secondary"
          onClick={() => setPlayers((current) => [...current, newPlayer()])}
        >
          <Plus size={16} strokeWidth={2.25} aria-hidden />
          Add player
        </Button>
      </fieldset>

      {(formError || error) && <p className="error">{formError ?? error}</p>}

      <div className="log-play-actions">
        <Button type="submit" variant="accent" disabled={busy}>
          {busy ? 'Saving…' : 'Log play'}
        </Button>
        <Button variant="ghost" onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
