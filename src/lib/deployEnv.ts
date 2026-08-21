/** True when this build is served from the GitHub Pages staging path. */
export function isStagingDeploy() {
  return import.meta.env.BASE_URL.includes('/staging')
}
