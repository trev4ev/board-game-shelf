import type { Plugin } from 'vite'
import { fetchBggXml, searchPath, thingPath } from './fetch'
import { parseSearchXml, parseThingXml } from './parse'

function readJsonError(error: unknown): { status: number; message: string } {
  const message = error instanceof Error ? error.message : 'Unknown BGG error'
  if (message.includes('BGG_API_TOKEN')) {
    return { status: 503, message }
  }
  if (message.includes('401') || message.includes('403')) {
    return { status: 502, message }
  }
  return { status: 502, message }
}

async function fetchViaEdgeFunction(pathAndQuery: string): Promise<unknown> {
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const key =
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY
  if (!supabaseUrl || !key) {
    throw new Error('BGG_API_TOKEN is not set')
  }
  const response = await fetch(
    `${supabaseUrl.replace(/\/$/, '')}/functions/v1/bgg${pathAndQuery}`,
    {
      headers: {
        Authorization: `Bearer ${key}`,
        apikey: key,
      },
    },
  )
  const data: unknown = await response.json()
  if (!response.ok) {
    const message =
      typeof data === 'object' &&
      data !== null &&
      'error' in data &&
      typeof (data as { error: unknown }).error === 'string'
        ? (data as { error: string }).error
        : `Lookup failed (${response.status})`
    throw new Error(message)
  }
  return data
}

/**
 * Local-only BGG proxy for `npm run dev`.
 * Keeps the token on the Vite server; mirrors the future Edge Function shape.
 */
export function bggDevProxy(): Plugin {
  return {
    name: 'bgg-dev-proxy',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/bgg/')) {
          next()
          return
        }

        const token = process.env.BGG_API_TOKEN ?? ''
        const url = new URL(req.url, 'http://localhost')
        const useEdgeFallback = !token

        try {
          if (url.pathname === '/api/bgg/search') {
            const q = url.searchParams.get('q')?.trim() ?? ''
            if (!q) {
              res.statusCode = 400
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Missing q' }))
              return
            }

            if (useEdgeFallback) {
              const results = await fetchViaEdgeFunction(`/search?${url.searchParams}`)
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify(results))
              return
            }

            const xml = await fetchBggXml(searchPath(q), token)
            const results = parseSearchXml(xml)
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(results))
            return
          }

          if (url.pathname === '/api/bgg/thing') {
            const id = Number(url.searchParams.get('id'))
            if (!Number.isFinite(id)) {
              res.statusCode = 400
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Missing or invalid id' }))
              return
            }

            if (useEdgeFallback) {
              const details = await fetchViaEdgeFunction(`/thing?${url.searchParams}`)
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify(details))
              return
            }

            const xml = await fetchBggXml(thingPath(id), token)
            const details = parseThingXml(xml)
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(details))
            return
          }

          res.statusCode = 404
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Not found' }))
        } catch (error) {
          const { status, message } = readJsonError(error)
          res.statusCode = status
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: message }))
        }
      })
    },
  }
}
