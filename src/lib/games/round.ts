export function roundInt(value: number | null | undefined): number | null {
  if (value == null || !Number.isFinite(value)) return null
  return Math.round(value)
}

export function roundDecimal(
  value: number | null | undefined,
  places = 2,
): number | null {
  if (value == null || !Number.isFinite(value)) return null
  const factor = 10 ** places
  return Math.round(value * factor) / factor
}
