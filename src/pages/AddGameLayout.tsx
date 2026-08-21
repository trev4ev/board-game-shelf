import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type FormEvent,
} from 'react'
import { Outlet, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { useCollections } from '../auth/CollectionProvider'
import {
  gameLookup,
  type GameLookupResult,
} from '../lib/gameLookup'
import { createGame, detailsToGameInput, emptyGameInput } from '../lib/games'
import { useMediaQuery } from '../lib/useMediaQuery'
import type { GameInput } from '../types/game'

type AddGameStatus = 'idle' | 'searching' | 'loading' | 'saving' | 'error'

type AddGameContextValue = {
  user: ReturnType<typeof useAuth>['user']
  isMember: boolean
  collectionId: string | undefined
  isDesktop: boolean
  query: string
  setQuery: (value: string) => void
  results: GameLookupResult[]
  selectedBggId: number | null
  form: GameInput
  setForm: (value: GameInput) => void
  status: AddGameStatus
  error: string | null
  onSearch: (event: React.FormEvent) => Promise<void>
  onPick: (hit: GameLookupResult) => Promise<void>
  onSave: () => Promise<void>
}

const AddGameContext = createContext<AddGameContextValue | null>(null)

export function AddGameLayout() {
  const { collectionId } = useParams()
  const { user } = useAuth()
  const { isMember } = useCollections()
  const navigate = useNavigate()
  const isDesktop = useMediaQuery('(min-width: 48rem)')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GameLookupResult[]>([])
  const [selectedBggId, setSelectedBggId] = useState<number | null>(null)
  const [form, setForm] = useState<GameInput>(emptyGameInput)
  const [status, setStatus] = useState<AddGameStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  const onSearch = useCallback(
    async (event: FormEvent) => {
      event.preventDefault()
      const trimmed = query.trim()
      if (!trimmed) return

      setStatus('searching')
      setError(null)
      setResults([])
      setSelectedBggId(null)

      try {
        const hits = await gameLookup.searchGames(trimmed)
        setResults(hits)
        setStatus('idle')
      } catch (err) {
        setStatus('error')
        setError(err instanceof Error ? err.message : 'Search failed')
      }
    },
    [query],
  )

  const onPick = useCallback(
    async (hit: GameLookupResult) => {
      setStatus('loading')
      setError(null)
      try {
        const details = await gameLookup.getGameDetails(hit.bggId)
        const next = detailsToGameInput(details, {
          notes: form.notes,
          isFavorite: form.isFavorite,
          playCount: form.playCount,
          lastPlayed: form.lastPlayed,
        })
        setForm(next)
        setSelectedBggId(hit.bggId)
        setStatus('idle')
        if (!isDesktop) {
          navigate('review')
        }
      } catch (err) {
        setStatus('error')
        setError(err instanceof Error ? err.message : 'Failed to load game')
      }
    },
    [form.isFavorite, form.lastPlayed, form.notes, form.playCount, isDesktop, navigate],
  )

  const onSave = useCallback(async () => {
    if (!user || !isMember || !collectionId) {
      setError('Sign in as a collection member before saving.')
      return
    }

    setStatus('saving')
    setError(null)
    try {
      const game = await createGame(collectionId, form)
      navigate(`/games/${game.id}`)
    } catch (err) {
      setStatus('error')
      const message = err instanceof Error ? err.message : 'Save failed'
      if (message.toLowerCase().includes('duplicate') || message.includes('23505')) {
        setError('That BGG game is already in your collection.')
      } else {
        setError(message)
      }
    }
  }, [collectionId, form, isMember, navigate, user])

  const value = useMemo<AddGameContextValue>(
    () => ({
      user,
      isMember,
      collectionId,
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
    }),
    [
      user,
      isMember,
      collectionId,
      isDesktop,
      query,
      results,
      selectedBggId,
      form,
      status,
      error,
      onSearch,
      onPick,
      onSave,
    ],
  )

  return (
    <AddGameContext.Provider value={value}>
      <Outlet />
    </AddGameContext.Provider>
  )
}

export function useAddGame() {
  const ctx = useContext(AddGameContext)
  if (!ctx) throw new Error('useAddGame must be used within AddGameLayout')
  return ctx
}
