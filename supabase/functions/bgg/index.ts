import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { fetchBggXml, searchPath, thingPath } from './fetch.ts'
import { parseSearchXml, parseThingXml } from './parse.ts'

function corsHeaders(origin: string | null): Record<string, string> {
  const allowed = origin != null && isAllowedOrigin(origin)
  return {
    'Access-Control-Allow-Origin': allowed ? origin! : 'https://trev4ev.github.io',
    'Access-Control-Allow-Headers':
      'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  }
}

function isAllowedOrigin(origin: string): boolean {
  try {
    const { hostname } = new URL(origin)
    return (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === 'trev4ev.github.io' ||
      hostname.endsWith('.github.io') ||
      hostname === 'trevoraquino.me' ||
      hostname.endsWith('.trevoraquino.me')
    )
  } catch {
    return false
  }
}

function json(data: unknown, status: number, origin: string | null) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders(origin),
      'Content-Type': 'application/json',
    },
  })
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get('Origin')
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders(origin) })
  }
  if (req.method !== 'GET') {
    return json({ error: 'Method not allowed' }, 405, origin)
  }

  const token = Deno.env.get('BGG_API_TOKEN') ?? ''
  const url = new URL(req.url)
  const path = url.pathname.replace(/\/+$/, '')

  try {
    if (path.endsWith('/search')) {
      const q = url.searchParams.get('q')?.trim() ?? ''
      if (!q) return json({ error: 'Missing q' }, 400, origin)
      const xml = await fetchBggXml(searchPath(q), token)
      return json(parseSearchXml(xml), 200, origin)
    }

    if (path.endsWith('/thing')) {
      const id = Number(url.searchParams.get('id'))
      if (!Number.isFinite(id)) {
        return json({ error: 'Missing or invalid id' }, 400, origin)
      }
      const xml = await fetchBggXml(thingPath(id), token)
      return json(parseThingXml(xml), 200, origin)
    }

    return json(
      { error: 'Not found. Use /search?q= or /thing?id=' },
      404,
      origin,
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown BGG error'
    const status = message.includes('BGG_API_TOKEN') ? 503 : 502
    return json({ error: message }, status, origin)
  }
})
