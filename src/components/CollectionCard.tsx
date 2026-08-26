import { Link } from 'react-router-dom'
import type { CollectionGamePreview } from '../types/collection'
import './CollectionCard.css'

type CollectionCardProps = {
  to: string
  name: string
  games: CollectionGamePreview[]
  meta: string
}

export function CollectionCard({ to, name, games, meta }: CollectionCardProps) {
  return (
    <Link to={to} className="collection-card">
      <strong>{name}</strong>
      {games.length > 0 ? (
        <span className="collection-card-games">
          {games.map((game) =>
            game.thumbnailUrl ? (
              <img
                key={game.id}
                src={game.thumbnailUrl}
                alt={game.name}
                title={game.name}
              />
            ) : (
              <span
                key={game.id}
                className="collection-card-thumb-placeholder"
                title={game.name}
              />
            ),
          )}
        </span>
      ) : (
        <span className="collection-card-empty">No games yet</span>
      )}
      <span className="collection-card-meta">{meta}</span>
    </Link>
  )
}
