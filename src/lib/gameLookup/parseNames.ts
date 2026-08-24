const NAME_HEADERS = new Set(['name', 'game', 'title', 'game name', 'board game'])

export type ParseGameNamesOptions = {
  /** Treat the text as CSV (first column, or a name/game/title header). */
  csv?: boolean
}

function splitCsvLine(line: string): string[] {
  const cells: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]!
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }
    if (ch === ',' && !inQuotes) {
      cells.push(current.trim())
      current = ''
      continue
    }
    current += ch
  }
  cells.push(current.trim())
  return cells
}

function dedupeNames(names: string[]): string[] {
  const seen = new Set<string>()
  const unique: string[] = []
  for (const name of names) {
    const key = name.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    unique.push(name)
  }
  return unique
}

/**
 * Parse a pasted list or uploaded file into game names.
 * Plain text is one name per line (commas stay part of the name).
 * CSV uses a `name` / `game` / `title` column when present, otherwise column 1.
 */
export function parseGameNameList(
  text: string,
  options: ParseGameNamesOptions = {},
): string[] {
  const lines = text
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  if (lines.length === 0) return []

  const firstCells = splitCsvLine(lines[0]!)
  const headerIndex = firstCells.findIndex((cell) =>
    NAME_HEADERS.has(cell.toLowerCase()),
  )
  const useCsv = options.csv === true || headerIndex >= 0
  if (!useCsv) return dedupeNames(lines)

  const column = headerIndex >= 0 ? headerIndex : 0
  const start = headerIndex >= 0 ? 1 : 0
  const names: string[] = []
  for (let i = start; i < lines.length; i++) {
    const name = splitCsvLine(lines[i]!)[column]?.trim() ?? ''
    if (name) names.push(name)
  }
  return dedupeNames(names)
}
