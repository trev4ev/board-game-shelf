import { XMLParser } from 'fast-xml-parser'
import type { GameLookupDetails, GameLookupResult } from '../src/lib/gameLookup/types'

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  isArray: (name) => name === 'item' || name === 'link' || name === 'name',
})

function asArray<T>(value: T | T[] | undefined | null): T[] {
  if (value == null) return []
  return Array.isArray(value) ? value : [value]
}

function numAttr(node: Record<string, unknown> | undefined, key = '@_value'): number | null {
  if (!node) return null
  const raw = node[key]
  if (raw == null || raw === '') return null
  const n = Number(raw)
  return Number.isFinite(n) ? n : null
}

function textContent(node: unknown): string | null {
  if (node == null) return null
  if (typeof node === 'string') return node
  if (typeof node === 'object' && node !== null && '#text' in node) {
    return String((node as { '#text': unknown })['#text'])
  }
  return null
}

function ensureHttps(url: string | null): string | null {
  if (!url) return null
  if (url.startsWith('//')) return `https:${url}`
  return url
}

export function parseSearchXml(xml: string): GameLookupResult[] {
  const doc = parser.parse(xml) as {
    items?: { item?: Record<string, unknown>[] }
  }
  const items = asArray(doc.items?.item)
  const results: GameLookupResult[] = []

  for (const item of items) {
    const bggId = Number(item['@_id'])
    const names = asArray(item.name as Record<string, unknown>[] | undefined)
    const primary = names.find((n) => n['@_type'] === 'primary') ?? names[0]
    const name = primary ? String(primary['@_value'] ?? '') : ''
    const yearPublished =
      numAttr(item.yearpublished as Record<string, unknown>) ?? undefined

    if (!Number.isFinite(bggId) || !name) continue
    results.push({ bggId, name, yearPublished })
  }

  return results
}

export function parseThingXml(xml: string): GameLookupDetails {
  const doc = parser.parse(xml) as {
    items?: { item?: Record<string, unknown>[] }
  }
  const item = asArray(doc.items?.item)[0]
  if (!item) {
    throw new Error('BGG thing response contained no item')
  }

  const bggId = Number(item['@_id'])
  const names = asArray(item.name as Record<string, unknown>[] | undefined)
  const primary = names.find((n) => n['@_type'] === 'primary') ?? names[0]
  const name = primary ? String(primary['@_value'] ?? '') : ''

  const links = asArray(item.link as Record<string, unknown>[] | undefined)
  const categories = links
    .filter((l) => l['@_type'] === 'boardgamecategory')
    .map((l) => String(l['@_value'] ?? ''))
    .filter(Boolean)
  const mechanics = links
    .filter((l) => l['@_type'] === 'boardgamemechanic')
    .map((l) => String(l['@_value'] ?? ''))
    .filter(Boolean)

  const ratings = (
    item.statistics as
      | {
          ratings?: {
            average?: Record<string, unknown>
            averageweight?: Record<string, unknown>
            usersrated?: Record<string, unknown>
          }
        }
      | undefined
  )?.ratings

  return {
    bggId,
    name,
    yearPublished: numAttr(item.yearpublished as Record<string, unknown>),
    description: textContent(item.description),
    minPlayers: numAttr(item.minplayers as Record<string, unknown>),
    maxPlayers: numAttr(item.maxplayers as Record<string, unknown>),
    minPlayTime: numAttr(item.minplaytime as Record<string, unknown>),
    maxPlayTime: numAttr(item.maxplaytime as Record<string, unknown>),
    playTime: numAttr(item.playingtime as Record<string, unknown>),
    minAge: numAttr(item.minage as Record<string, unknown>),
    categories,
    mechanics,
    bggRating: numAttr(ratings?.average),
    weight: numAttr(ratings?.averageweight),
    thumbnailUrl: ensureHttps(textContent(item.thumbnail)),
    imageUrl: ensureHttps(textContent(item.image)),
    usersRated: numAttr(ratings?.usersrated),
  }
}
