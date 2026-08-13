/** BGG averageweight votes are 1–5; the stored average is ~1.00–5.00. */
export const COMPLEXITY_MIN = 1
export const COMPLEXITY_MAX = 5

export function complexityFieldLabel(): string {
  return `Complexity (${COMPLEXITY_MIN}–${COMPLEXITY_MAX})`
}

export function formatComplexity(value: number): string {
  return `${value.toFixed(1)}/${COMPLEXITY_MAX}`
}
