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

        try {
          if (url.pathname === '/api/bgg/search') {
            const q = url.searchParams.get('q')?.trim() ?? ''
            if (!q) {
              res.statusCode = 400
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Missing q' }))
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
