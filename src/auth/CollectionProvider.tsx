import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useLocation } from 'react-router-dom'
import type { Collection, CollectionMembership } from '../types/collection'
import {
  acceptCollectionInvite,
  isAcceptedMember,
  listMyMemberships,
  removeCollectionMember,
} from '../lib/collections'
import { useAuth } from './AuthProvider'

type CollectionContextValue = {
  memberships: CollectionMembership[]
  accepted: CollectionMembership[]
  pendingInvites: CollectionMembership[]
  currentCollectionId: string | null
  currentCollection: Collection | null
  isMember: boolean
  loading: boolean
  setActiveCollectionId: (id: string | null) => void
  refresh: () => Promise<void>
  acceptInvite: (collectionId: string) => Promise<void>
  declineInvite: (collectionId: string) => Promise<void>
}

const CollectionContext = createContext<CollectionContextValue | null>(null)

function collectionIdFromPath(pathname: string) {
  const match = pathname.match(/^\/c\/([^/]+)/)
  return match?.[1] ?? null
}

export function CollectionProvider({ children }: { children: ReactNode }) {
  const { user, profile } = useAuth()
  const location = useLocation()
  const [memberships, setMemberships] = useState<CollectionMembership[]>([])
  const [loading, setLoading] = useState(false)
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!user) {
      setMemberships([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const rows = await listMyMemberships(user.id)
      setMemberships(rows)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (!user || !profile?.username) {
      setMemberships([])
      return
    }
    void refresh()
  }, [profile?.username, refresh, user])

  const accepted = useMemo(
    () => memberships.filter((item) => item.status === 'accepted'),
    [memberships],
  )
  const pendingInvites = useMemo(
    () => memberships.filter((item) => item.status === 'pending'),
    [memberships],
  )

  const currentCollectionId =
    collectionIdFromPath(location.pathname) ??
    activeCollectionId ??
    (accepted.length === 1 ? (accepted[0]?.collection.id ?? null) : null)

  const currentCollection =
    memberships.find((item) => item.collection.id === currentCollectionId)?.collection ??
    null

  const isMember = currentCollectionId
    ? isAcceptedMember(memberships, currentCollectionId)
    : false

  const acceptInvite = useCallback(
    async (collectionId: string) => {
      if (!user) return
      await acceptCollectionInvite(collectionId, user.id)
      await refresh()
    },
    [refresh, user],
  )

  const declineInvite = useCallback(
    async (collectionId: string) => {
      if (!user) return
      await removeCollectionMember(collectionId, user.id)
      await refresh()
    },
    [refresh, user],
  )

  const value = useMemo<CollectionContextValue>(
    () => ({
      memberships,
      accepted,
      pendingInvites,
      currentCollectionId,
      currentCollection,
      isMember,
      loading,
      setActiveCollectionId,
      refresh,
      acceptInvite,
      declineInvite,
    }),
    [
      memberships,
      accepted,
      pendingInvites,
      currentCollectionId,
      currentCollection,
      isMember,
      loading,
      refresh,
      acceptInvite,
      declineInvite,
    ],
  )

  return (
    <CollectionContext.Provider value={value}>{children}</CollectionContext.Provider>
  )
}

export function useCollections() {
  const ctx = useContext(CollectionContext)
  if (!ctx) throw new Error('useCollections must be used within CollectionProvider')
  return ctx
}
