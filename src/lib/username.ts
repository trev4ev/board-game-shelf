export const USERNAME_MIN = 3
export const USERNAME_MAX = 20
export const USERNAME_PATTERN = /^[A-Za-z0-9_]{3,20}$/

export function normalizeUsername(raw: string) {
  return raw.trim()
}

export function usernameError(raw: string): string | null {
  const value = normalizeUsername(raw)
  if (!value) return 'Choose a username.'
  if (value.length < USERNAME_MIN || value.length > USERNAME_MAX) {
    return `Username must be ${USERNAME_MIN}–${USERNAME_MAX} characters.`
  }
  if (!USERNAME_PATTERN.test(value)) {
    return 'Use letters, numbers, and underscores only.'
  }
  return null
}
