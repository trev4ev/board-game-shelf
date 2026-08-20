import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { Button } from './Button'
import { listCollectionMembers } from '../lib/collections'
import { listFriendships } from '../lib/friends'
import { formatPlace, todayIsoDate } from '../lib/games/display'
import type { TaggedPerson } from '../types/friend'
import type { PlayInput, PlayPlayer } from '../types/play'
import './LogPlayForm.css'

type PlayerDraft = {
  key: string
  name: string
  userId: string | null
  score: string
  tiedWithAbove: boolean
  open: boolean
}

function newPlayer(): PlayerDraft {
  return {
    key: crypto.randomUUID(),
    name: '',
    userId: null,
    score: '',
    tiedWithAbove: false,
    open: false,
  }
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
  collectionId: string
  gameName: string
  busy?: boolean
  error?: string | null
  onSubmit: (input: PlayInput) => void
  onCancel: () => void
}

export function LogPlayForm({
  gameId,
  collectionId,
  gameName,
  busy,
  error,
  onSubmit,
  onCancel,
}: LogPlayFormProps) {
  const { user, profile } = useAuth()
  const [playedOn, setPlayedOn] = useState(todayIsoDate)
  const [players, setPlayers] = useState<PlayerDraft[]>(() => [newPlayer(), newPlayer()])
  const [people, setPeople] = useState<TaggedPerson[]>([])
  const [formError, setFormError] = useState<string | null>(null)
  const places = useMemo(() => placesFor(players), [players])

  useEffect(() => {
    if (!user) return
    let cancelled = false
    Promise.all([
      listFriendships(user.id).catch(() => []),
      listCollectionMembers(collectionId).catch(() => []),
    ]).then(([friendships, members]) => {
      if (cancelled) return
      const tagged: TaggedPerson[] = []
      const seen = new Set<string>()
      if (profile?.username) {
        seen.add(user.id)
        tagged.push({
          id: user.id,
          username: profile.username,
          source: 'member',
        })
      }
      for (const row of friendships) {
        if (row.status !== 'accepted' || !row.otherUsername || seen.has(row.otherUserId)) continue
        seen.add(row.otherUserId)
        tagged.push({
          id: row.otherUserId,
          username: row.otherUsername,
          source: 'friend',
        })
      }
      for (const member of members) {
        if (member.status !== 'accepted' || !member.username || seen.has(member.userId)) continue
        if (member.userId === user.id) continue
        seen.add(member.userId)
        tagged.push({
          id: member.userId,
          username: member.username,
          source: 'member',
        })
      }
      tagged.sort((a, b) => a.username.localeCompare(b.username))
      setPeople(tagged)
    })
    return () => {
      cancelled = true
    }
  }, [collectionId, profile?.username, user])

  function patchPlayer(key: string, partial: Partial<PlayerDraft>) {
    setPlayers((current) =>
      current.map((player) => (player.key === key ? { ...player, ...partial } : player)),
    )
  }

  function matchPerson(value: string) {
    const needle = value.trim().toLowerCase()
    if (!needle) return null
    return people.find((person) => person.username.toLowerCase() === needle) ?? null
  }

  function suggestionsFor(value: string) {
    const needle = value.trim().toLowerCase()
    if (!needle) return people.slice(0, 8)
    return people
      .filter((person) => person.username.toLowerCase().includes(needle))
      .slice(0, 8)
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
        userId: player.userId,
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
        <p className="hint log-play-people-hint">
          Tag a friend or co-owner, or type a guest name.
        </p>
        {players.map((player, index) => {
          const suggestions = player.open ? suggestionsFor(player.name) : []
          return (
            <div key={player.key} className="log-play-row">
              <span className="log-play-place">{formatPlace(places[index] ?? index + 1)}</span>
              <div className="log-play-name-wrap">
                <input
                  className="log-play-name"
                  value={player.name}
                  onChange={(event) => {
                    const name = event.target.value
                    const match = matchPerson(name)
                    patchPlayer(player.key, {
                      name,
                      userId: match?.id ?? null,
                      open: true,
                    })
                  }}
                  onFocus={() => patchPlayer(player.key, { open: true })}
                  onBlur={() => {
                    window.setTimeout(() => patchPlayer(player.key, { open: false }), 120)
                  }}
                  placeholder="Name or username"
                  autoComplete="off"
                  aria-label={`${formatPlace(places[index] ?? index + 1)} player name`}
                />
                {suggestions.length > 0 && (
                  <ul className="log-play-suggest">
                    {suggestions.map((person) => (
                      <li key={person.id}>
                        <button
                          type="button"
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() =>
                            patchPlayer(player.key, {
                              name: person.username,
                              userId: person.id,
                              open: false,
                            })
                          }
                        >
                          {person.username}
                          <span>{person.source === 'friend' ? 'friend' : 'member'}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {player.userId ? (
                  <span className="log-play-tagged">Tagged account</span>
                ) : (
                  <span className="log-play-tagged guest">Guest</span>
                )}
              </div>
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
          )
        })}
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
