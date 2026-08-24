const RETURN_KEY = 'postAuthReturnTo'

function storage() {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

/** In-app path after sign-in. Rejects scheme-relative and off-site URLs. */
export function isSafeReturnTo(path: string) {
  if (!path.startsWith('/') || path.startsWith('//') || path.includes('\\')) {
    return false
  }
  if (path.includes('://')) return false
  if (path === '/login' || path.startsWith('/login?') || path.startsWith('/login#')) {
    return false
  }
  return true
}

export function rememberReturnTo(path: string | null | undefined) {
  if (!path || !isSafeReturnTo(path)) return
  storage()?.setItem(RETURN_KEY, path)
}

export function peekReturnTo(): string | null {
  const path = storage()?.getItem(RETURN_KEY)
  if (!path || !isSafeReturnTo(path)) {
    storage()?.removeItem(RETURN_KEY)
    return null
  }
  return path
}

export function clearReturnTo() {
  storage()?.removeItem(RETURN_KEY)
}

export function returnToFromSearch(value: string | null) {
  if (!value) return null
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}
