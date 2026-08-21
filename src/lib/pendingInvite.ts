const STORAGE_KEY = 'pendingCollectionInvite'

const TOKEN_PATTERN = /^[A-Za-z0-9-]{8,80}$/

function storage() {
  try {
    return window.sessionStorage
  } catch {
    return null
  }
}

export function inviteTokenIsValid(token: string) {
  return TOKEN_PATTERN.test(token)
}

export function rememberPendingInvite(token: string) {
  if (!inviteTokenIsValid(token)) return
  storage()?.setItem(STORAGE_KEY, token)
}

export function peekPendingInvite(): string | null {
  const token = storage()?.getItem(STORAGE_KEY) ?? null
  if (!token || !inviteTokenIsValid(token)) {
    storage()?.removeItem(STORAGE_KEY)
    return null
  }
  return token
}

export function clearPendingInvite() {
  storage()?.removeItem(STORAGE_KEY)
}

export function pendingInvitePath(token = peekPendingInvite()): string | null {
  return token ? `/invite/${token}` : null
}

export function nextPathAfterAuth(needsUsername: boolean) {
  if (needsUsername) return '/onboarding'
  return pendingInvitePath() ?? '/'
}
