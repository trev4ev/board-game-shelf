import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import type { GameLookupDetails, GameLookupResult } from './types'
import {
  normalizeGameName,
  pickMostPopular,
  pickNameFinalists,
  scoreNameMatch,
} from './match'

function hit(name: string, bggId: number, yearPublished?: number): GameLookupResult {
  return { bggId, name, yearPublished }
}

describe('normalizeGameName', () => {
  it('strips punctuation, case, and ampersands', () => {
    assert.equal(
      normalizeGameName('Ticket to Ride: Europe'),
      'ticket to ride europe',
    )
    assert.equal(normalizeGameName('Catan: Cities & Knights'), 'catan cities and knights')
    assert.equal(normalizeGameName('Catan Двубоят'), 'catan двубоят')
  })
})

describe('scoreNameMatch', () => {
  it('scores exact names as 1', () => {
    assert.equal(scoreNameMatch('Wingspan', 'Wingspan'), 1)
    assert.equal(scoreNameMatch('ticket to ride europe', 'Ticket to Ride: Europe'), 1)
  })

  it('prefers the base game over an expansion with the same prefix', () => {
    const base = scoreNameMatch('Catan', 'Catan')
    const expansion = scoreNameMatch('Catan', 'Catan: Cities & Knights')
    assert.ok(base > expansion)
    assert.equal(base, 1)
  })

  it('matches a name with extra subtitle words the user typed', () => {
    assert.equal(
      scoreNameMatch('Ticket to Ride Europe', 'Ticket to Ride: Europe'),
      1,
    )
  })
})

describe('pickNameFinalists', () => {
  it('picks the exact BGG name when expansions are also returned', () => {
    const finalists = pickNameFinalists('Catan', [
      hit('Catan: Cities & Knights', 13),
      hit('Catan', 3, 1995),
      hit('Catan: Seafarers', 9),
      hit('Catan Двубоят', 66056, 2010),
    ])
    assert.equal(finalists[0]?.hit.name, 'Catan')
    assert.equal(finalists.length, 1)
  })

  it('keeps reprint ties so popularity can break them', () => {
    const finalists = pickNameFinalists('Dune', [
      hit('Dune', 11, 1979),
      hit('Dune', 283355, 2019),
      hit('Dune: Imperium', 316554, 2020),
    ])
    assert.deepEqual(
      finalists.map((row) => row.hit.yearPublished).sort(),
      [1979, 2019],
    )
  })

  it('returns nothing when nothing is close', () => {
    assert.deepEqual(pickNameFinalists('zzzznotagame', [hit('Wingspan', 1)]), [])
  })
})

describe('pickMostPopular', () => {
  function details(
    partial: Pick<GameLookupDetails, 'bggId' | 'name'> &
      Partial<GameLookupDetails>,
  ): GameLookupDetails {
    return {
      yearPublished: null,
      description: null,
      minPlayers: null,
      maxPlayers: null,
      minPlayTime: null,
      maxPlayTime: null,
      playTime: null,
      minAge: null,
      categories: [],
      mechanics: [],
      bggRating: null,
      weight: null,
      thumbnailUrl: null,
      imageUrl: null,
      usersRated: null,
      ...partial,
    }
  }

  it('breaks equal names with usersRated', () => {
    const scores = new Map([
      [1, 1],
      [2, 1],
    ])
    const picked = pickMostPopular(
      [
        details({ bggId: 1, name: 'Dune', yearPublished: 1979, usersRated: 8000 }),
        details({ bggId: 2, name: 'Dune', yearPublished: 2019, usersRated: 12000 }),
      ],
      scores,
    )
    assert.equal(picked.bggId, 2)
  })

  it('falls back to newer year when ratings are missing', () => {
    const scores = new Map([
      [1, 1],
      [2, 1],
    ])
    const picked = pickMostPopular(
      [
        details({ bggId: 1, name: 'Dune', yearPublished: 1979 }),
        details({ bggId: 2, name: 'Dune', yearPublished: 2019 }),
      ],
      scores,
    )
    assert.equal(picked.bggId, 2)
  })
})
