/** Vite `BASE_URL` always has a trailing slash (`/` or `/board-game-shelf/`). */
export function routerBasename(): string | undefined {
  const base = import.meta.env.BASE_URL
  if (base === '/') return undefined
  return base.replace(/\/$/, '')
}

export function appUrl(path: string): string {
  const base = import.meta.env.BASE_URL
  const trimmed = path.replace(/^\//, '')
  return `${window.location.origin}${base}${trimmed}`
}