const BGG_BASE = 'https://boardgamegeek.com/xmlapi2'
const MIN_GAP_MS = 5_000

let lastRequestAt = 0

async function waitForRateLimit() {
  const elapsed = Date.now() - lastRequestAt
  if (elapsed < MIN_GAP_MS) {
    await new Promise((resolve) => setTimeout(resolve, MIN_GAP_MS - elapsed))
  }
  lastRequestAt = Date.now()
}

export async function fetchBggXml(
  pathWithQuery: string,
  token: string,
): Promise<string> {
  if (!token) {
    throw new Error('BGG_API_TOKEN is not set')
  }

  await waitForRateLimit()

  const url = `${BGG_BASE}${pathWithQuery}`
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/xml',
    },
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(
      `BGG request failed (${response.status}): ${body.slice(0, 200)}`,
    )
  }

  return response.text()
}

export function searchPath(query: string): string {
  const params = new URLSearchParams({
    query,
    type: 'boardgame',
  })
  return `/search?${params.toString()}`
}

export function thingPath(bggId: number): string {
  const params = new URLSearchParams({
    id: String(bggId),
    stats: '1',
  })
  return `/thing?${params.toString()}`
}