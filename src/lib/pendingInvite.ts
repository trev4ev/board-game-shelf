import { clearReturnTo, peekReturnTo } from './postAuth'

const STORAGE_KEY = 'pendingCollectionInvite'

const TOKEN_PATTERN = /^[A-Za-z0-9-]{8,80}$/

function storage() {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

function sessionStore() {
  try {
    return window.sessionStorage
  } catch {
    return null
  }
}

export function inviteTokenIsValid(token: string) {
  return TOKEN_PATTERN.test(token)
}

function readStoredToken() {
  const local = storage()?.getItem(STORAGE_KEY)
  if (local) return local
  const fromSession = sessionStore()?.getItem(STORAGE_KEY)
  if (fromSession) {
    storage()?.setItem(STORAGE_KEY, fromSession)
    sessionStore()?.removeItem(STORAGE_KEY)
  }
  return fromSession
}

export function rememberPendingInvite(token: string) {
  if (!inviteTokenIsValid(token)) return
  storage()?.setItem(STORAGE_KEY, token)
  sessionStore()?.removeItem(STORAGE_KEY)
}

export function peekPendingInvite(): string | null {
  const token = readStoredToken() ?? null
  if (!token || !inviteTokenIsValid(token)) {
    storage()?.removeItem(STORAGE_KEY)
    sessionStore()?.removeItem(STORAGE_KEY)
    return null
  }
  return token
}

export function clearPendingInvite() {
  storage()?.removeItem(STORAGE_KEY)
  sessionStore()?.removeItem(STORAGE_KEY)
}

export function pendingInvitePath(token = peekPendingInvite()): string | null {
  return token ? `/invite/${token}` : null
}

export function nextPathAfterAuth(needsUsername: boolean) {
  if (needsUsername) return '/onboarding'
  return pendingInvitePath() ?? peekReturnTo() ?? '/'
}

/** Path to open after login. Clears a stored return URL once it is consumed. */
export function consumePathAfterAuth(needsUsername: boolean) {
  const path = nextPathAfterAuth(needsUsername)
  if (path !== '/onboarding') clearReturnTo()
  return path
}
