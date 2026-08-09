import { useParams } from 'react-router-dom'

export function EditGamePage() {
  const { id } = useParams()

  return (
    <section>
      <h1>Edit game</h1>
      <p className="lede">
        Owner-only form for game <code>{id}</code>.
      </p>
    </section>
  )
}
