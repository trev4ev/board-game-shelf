import { Navigate } from 'react-router-dom'
import { useCollections } from '../auth/CollectionProvider'

export function GamesNewRedirect() {
  const { currentCollectionId, isMember } = useCollections()
  if (currentCollectionId && isMember) {
    return <Navigate to={`/c/${currentCollectionId}/games/new`} replace />
  }
  return <Navigate to="/" replace />
}
