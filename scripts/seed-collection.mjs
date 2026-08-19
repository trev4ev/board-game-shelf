#!/usr/bin/env node
/**
 * Upsert the BGG collection seed into Supabase.
 * Requires SUPABASE_SECRET_KEY (service role) — the publishable key cannot insert.
 *
 *   SUPABASE_SECRET_KEY=sb_secret_... node scripts/seed-collection.mjs
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

try {
  const { config } = await import('dotenv')
  config()
} catch {
  // .env loading is optional; secrets can come from the shell
}

const SUPABASE_URL = (
  process.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  'https://cfzssslioogdnjyuxpvu.supabase.co'
).replace(/\/$/, '')
const SECRET_KEY = process.env.SUPABASE_SECRET_KEY

const SEED_SQL = join(
  dirname(fileURLToPath(import.meta.url)),
  '../supabase/migrations/20260819_seed_collection.sql',
)

function loadRows() {
  const sql = readFileSync(SEED_SQL, 'utf8')
  const match = sql.match(/\$bggseed\$\r?\n([\s\S]*?)\r?\n\$bggseed\$/)
  if (!match) {
    throw new Error('Could not find $bggseed$ JSON payload in seed SQL')
  }
  return JSON.parse(match[1]).map((row) => ({
    bgg_id: row.bgg_id,
    name: row.name,
    year_published: row.year_published,
    description: row.description,
    min_players: row.min_players,
    max_players: row.max_players,
    min_play_time: row.min_play_time,
    max_play_time: row.max_play_time,
    play_time: row.play_time,
    min_age: row.min_age,
    categories: row.categories,
    mechanics: row.mechanics,
    bgg_rating: row.bgg_rating,
    weight: row.weight,
    thumbnail_url: row.thumbnail_url,
    image_url: row.image_url,
  }))
}

async function main() {
  if (!SECRET_KEY) {
    console.error('SUPABASE_SECRET_KEY is not set')
    process.exit(1)
  }

  const rows = loadRows()
  const response = await fetch(`${SUPABASE_URL}/rest/v1/games?on_conflict=bgg_id`, {
    method: 'POST',
    headers: {
      apikey: SECRET_KEY,
      Authorization: `Bearer ${SECRET_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify(rows),
  })
  const data = await response.json()
  if (!response.ok) {
    const message =
      typeof data === 'object' && data && 'message' in data
        ? data.message
        : JSON.stringify(data)
    console.error(message)
    process.exit(1)
  }

  const names = (Array.isArray(data) ? data : []).map((r) => r.name).sort()
  console.log(`Upserted ${names.length} game(s):`)
  for (const name of names) console.log(`  ${name}`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
