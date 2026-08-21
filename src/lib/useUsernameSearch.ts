import { useEffect, useState } from 'react'
import { searchProfiles } from './profiles'
import type { Profile } from '../types/profile'

export type UsernameSearchStatus = 'idle' | 'loading' | 'empty' | 'results'

export function usernameSearchMessage(query: string, status: UsernameSearchStatus) {
  const trimmed = query.trim()
  if (!trimmed) return null
  if (trimmed.length < 2) return 'Type at least 2 characters.'
  if (status === 'loading') return 'Searching…'
  if (status === 'empty') return `No users match “${trimmed}”.`
  return null
}

export function useUsernameSearch(query: string, excludeId?: string) {
  const [hits, setHits] = useState<Profile[]>([])
  const [status, setStatus] = useState<UsernameSearchStatus>('idle')

  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < 2) {
      setHits([])
      setStatus('idle')
      return
    }

    let cancelled = false
    setHits([])
    setStatus('loading')
    const handle = window.setTimeout(() => {
      searchProfiles(trimmed, excludeId)
        .then((rows) => {
          if (cancelled) return
          setHits(rows)
          setStatus(rows.length === 0 ? 'empty' : 'results')
        })
        .catch(() => {
          if (cancelled) return
          setHits([])
          setStatus('empty')
        })
    }, 200)

    return () => {
      cancelled = true
      window.clearTimeout(handle)
    }
  }, [excludeId, query])

  return { hits, status }
}
