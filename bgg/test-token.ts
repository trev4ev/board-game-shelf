import { config } from 'dotenv'
import { fetchBggXml, searchPath, thingPath } from './fetch'
import { parseSearchXml, parseThingXml } from './parse'

config()

async function main() {
  const query = process.argv.slice(2).join(' ').trim() || 'Cascadia'
  const token = process.env.BGG_API_TOKEN

  if (!token) {
    console.error('BGG_API_TOKEN is missing from .env')
    process.exit(1)
  }

  console.log(`Searching BGG for "${query}"…`)
  const searchXml = await fetchBggXml(searchPath(query), token)
  const results = parseSearchXml(searchXml)
  console.log(`Found ${results.length} result(s):`)
  console.log(results.slice(0, 5))

  const first = results[0]
  if (!first) {
    console.error('No results to fetch details for')
    process.exit(1)
  }

  console.log(`\nFetching thing ${first.bggId} (${first.name})…`)
  const thingXml = await fetchBggXml(thingPath(first.bggId), token)
  const details = parseThingXml(thingXml)
  console.log({
    bggId: details.bggId,
    name: details.name,
    yearPublished: details.yearPublished,
    minPlayers: details.minPlayers,
    maxPlayers: details.maxPlayers,
    playTime: details.playTime,
    weight: details.weight,
    bggRating: details.bggRating,
    categories: details.categories.slice(0, 5),
    mechanics: details.mechanics.slice(0, 5),
  })
  console.log('\nBGG token looks good.')
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
