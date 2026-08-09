import { useParams } from 'react-router-dom'

export function GameDetailPage() {
  const { id } = useParams()

  return (
    <section>
      <h1>Game detail</h1>
      <p className="lede">
        Placeholder for game <code>{id}</code> — stats, notes, edit link for
        owners.
      </p>
    </section>
  )
}
