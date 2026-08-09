export function CollectionPage() {
  return (
    <section>
      <h1>Collection</h1>
      <p className="lede">
        Browse, filter, and pick a game. Data and filters land in the next
        pass — this is the shell.
      </p>
      <ul className="placeholder-list">
        <li>Name search</li>
        <li>Multi-select filters (players, time, category, weight, favorites)</li>
        <li>Game list</li>
        <li>Random pick from filtered results</li>
      </ul>
    </section>
  )
}
