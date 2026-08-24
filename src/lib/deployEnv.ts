/** True when this build is served from the GitHub Pages staging path. */
export function isStagingDeploy() {
  return import.meta.env.BASE_URL.includes('/staging')
}

export const OWNER_TEST_EMAIL = 'trevoraquino@gmail.com'

const TOGGLE_STORAGE_KEY = 'bgs-owner-env-toggle'

const PROD_PREFIX = '/board-game-shelf'
const STAGING_PREFIX = '/board-game-shelf/staging'

export function isOwnerTester(email: string | null | undefined) {
  return email?.trim().toLowerCase() === OWNER_TEST_EMAIL
}

export function rememberOwnerTester(email: string | null | undefined) {
  if (!isOwnerTester(email)) return
  try {
    window.localStorage.setItem(TOGGLE_STORAGE_KEY, '1')
  } catch {
    /* ignore */
  }
}

function ownerToggleRemembered() {
  try {
    return window.localStorage.getItem(TOGGLE_STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

/** Sticky env switch: owner email, or this browser after that account has signed in. */
export function showOwnerEnvToggle(email: string | null | undefined) {
  return isOwnerTester(email) || ownerToggleRemembered()
}

type LocationBits = Pick<Location, 'pathname' | 'search' | 'hash' | 'hostname' | 'origin'>

function liveOrigin(loc: LocationBits) {
  if (loc.hostname === 'localhost' || loc.hostname === '127.0.0.1') {
    return 'https://trevoraquino.me'
  }
  return loc.origin
}

export function appRelativePath(pathname: string) {
  if (pathname === STAGING_PREFIX || pathname.startsWith(`${STAGING_PREFIX}/`)) {
    return pathname.slice(STAGING_PREFIX.length) || '/'
  }
  if (pathname === PROD_PREFIX || pathname.startsWith(`${PROD_PREFIX}/`)) {
    return pathname.slice(PROD_PREFIX.length) || '/'
  }
  return pathname || '/'
}

export function siblingDeployUrl(
  target: 'production' | 'staging',
  loc: LocationBits = window.location,
) {
  const rest = appRelativePath(loc.pathname)
  const prefix = target === 'staging' ? STAGING_PREFIX : PROD_PREFIX
  const path = rest === '/' ? `${prefix}/` : `${prefix}${rest}`
  return `${liveOrigin(loc)}${path}${loc.search}${loc.hash}`
}
