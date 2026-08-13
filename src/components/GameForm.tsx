import type { FormEvent } from 'react'
import type { GameInput } from '../types/game'
import './GameForm.css'

type GameFormProps = {
  value: GameInput
  onChange: (next: GameInput) => void
  onSubmit: () => void
  submitLabel: string
  busy?: boolean
  disabled?: boolean
}

function parseList(raw: string): string[] {
  return raw
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
}

function parseNum(raw: string): number | null {
  if (raw.trim() === '') return null
  const n = Number(raw)
  return Number.isFinite(n) ? n : null
}

export function GameForm({
  value,
  onChange,
  onSubmit,
  submitLabel,
  busy,
  disabled,
}: GameFormProps) {
  function patch(partial: Partial<GameInput>) {
    onChange({ ...value, ...partial })
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!value.name.trim() || busy || disabled) return
    onSubmit()
  }

  return (
    <form className="game-form" onSubmit={handleSubmit}>
      <fieldset>
        <legend>Catalog</legend>
        <label>
          Name
          <input
            value={value.name}
            onChange={(e) => patch({ name: e.target.value })}
            required
            autoComplete="off"
          />
        </label>
        <div className="game-form-row">
          <label>
            Year
            <input
              type="number"
              inputMode="numeric"
              value={value.yearPublished ?? ''}
              onChange={(e) => patch({ yearPublished: parseNum(e.target.value) })}
            />
          </label>
          <label>
            Min age
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={value.minAge ?? ''}
              onChange={(e) => patch({ minAge: parseNum(e.target.value) })}
            />
          </label>
          <label>
            BGG id
            <input
              type="number"
              inputMode="numeric"
              value={value.bggId ?? ''}
              onChange={(e) => patch({ bggId: parseNum(e.target.value) })}
            />
          </label>
        </div>
        <label>
          Description
          <textarea
            rows={4}
            value={value.description ?? ''}
            onChange={(e) => patch({ description: e.target.value || null })}
          />
        </label>
        <div className="game-form-row">
          <label>
            Min players
            <input
              type="number"
              inputMode="numeric"
              min={1}
              value={value.minPlayers ?? ''}
              onChange={(e) => patch({ minPlayers: parseNum(e.target.value) })}
            />
          </label>
          <label>
            Max players
            <input
              type="number"
              inputMode="numeric"
              min={1}
              value={value.maxPlayers ?? ''}
              onChange={(e) => patch({ maxPlayers: parseNum(e.target.value) })}
            />
          </label>
        </div>
        <div className="game-form-row">
          <label>
            Min time (min)
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={value.minPlayTime ?? ''}
              onChange={(e) => patch({ minPlayTime: parseNum(e.target.value) })}
            />
          </label>
          <label>
            Max time (min)
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={value.maxPlayTime ?? ''}
              onChange={(e) => patch({ maxPlayTime: parseNum(e.target.value) })}
            />
          </label>
          <label>
            Play time (min)
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={value.playTime ?? ''}
              onChange={(e) => patch({ playTime: parseNum(e.target.value) })}
            />
          </label>
        </div>
        <div className="game-form-row">
          <label>
            Weight (1–5)
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min={1}
              max={5}
              value={value.weight ?? ''}
              onChange={(e) => patch({ weight: parseNum(e.target.value) })}
            />
          </label>
          <label>
            BGG rating
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min={1}
              max={10}
              value={value.bggRating ?? ''}
              onChange={(e) => patch({ bggRating: parseNum(e.target.value) })}
            />
          </label>
        </div>
        <label>
          Categories (comma-separated)
          <input
            value={value.categories.join(', ')}
            onChange={(e) => patch({ categories: parseList(e.target.value) })}
          />
        </label>
        <label>
          Mechanics (comma-separated)
          <input
            value={value.mechanics.join(', ')}
            onChange={(e) => patch({ mechanics: parseList(e.target.value) })}
          />
        </label>
        <label>
          Thumbnail URL
          <input
            value={value.thumbnailUrl ?? ''}
            onChange={(e) => patch({ thumbnailUrl: e.target.value || null })}
          />
        </label>
        <label>
          Image URL
          <input
            value={value.imageUrl ?? ''}
            onChange={(e) => patch({ imageUrl: e.target.value || null })}
          />
        </label>
      </fieldset>

      <fieldset>
        <legend>On your shelf</legend>
        <div className="game-form-row">
          <label>
            Last played
            <input
              type="date"
              value={value.lastPlayed ?? ''}
              onChange={(e) => patch({ lastPlayed: e.target.value || null })}
            />
          </label>
          <label>
            Play count
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={value.playCount}
              onChange={(e) =>
                patch({ playCount: parseNum(e.target.value) ?? 0 })
              }
            />
          </label>
        </div>
        <label>
          Notes
          <textarea
            rows={3}
            value={value.notes ?? ''}
            onChange={(e) => patch({ notes: e.target.value || null })}
          />
        </label>
        <label className="game-form-check">
          <input
            type="checkbox"
            checked={value.isFavorite}
            onChange={(e) => patch({ isFavorite: e.target.checked })}
          />
          Favorite
        </label>
      </fieldset>

      <button type="submit" disabled={busy || disabled || !value.name.trim()}>
        {busy ? 'Saving…' : submitLabel}
      </button>
    </form>
  )
}