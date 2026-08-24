import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <section>
      <h1>Page not found</h1>
      <p className="lede">That link does not match a collection or screen in this app.</p>
      <p className="hint">
        <Link to="/">Back to collections</Link>
      </p>
    </section>
  )
}
