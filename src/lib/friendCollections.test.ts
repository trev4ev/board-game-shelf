import assert from 'node:assert/strict'
import { test } from 'node:test'
import type { Collection } from '../types/collection'
import {
  excludeCollectionIds,
  friendNamesLabel,
  groupFriendCollections,
} from './friendCollections'

function collection(id: string, name: string): Collection {
  return {
    id,
    name,
    createdBy: 'owner',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  }
}

test('groupFriendCollections merges friends who share a shelf', () => {
  const grouped = groupFriendCollections([
    {
      userId: 'b',
      username: 'bee',
      collection: collection('2', 'Zebra shelf'),
    },
    {
      userId: 'a',
      username: 'aye',
      collection: collection('1', 'Alpha shelf'),
    },
    {
      userId: 'c',
      username: 'cee',
      collection: collection('2', 'Zebra shelf'),
    },
  ])

  assert.deepEqual(
    grouped.map((item) => item.collection.name),
    ['Alpha shelf', 'Zebra shelf'],
  )
  assert.equal(grouped[1]?.friends.length, 2)
  assert.equal(friendNamesLabel(grouped[1]?.friends ?? []), 'bee and cee')
})

test('excludeCollectionIds drops shelves you already belong to', () => {
  const grouped = groupFriendCollections([
    {
      userId: 'a',
      username: 'aye',
      collection: collection('1', 'Shared'),
    },
    {
      userId: 'b',
      username: 'bee',
      collection: collection('2', 'Theirs'),
    },
  ])
  const filtered = excludeCollectionIds(grouped, ['1'])
  assert.equal(filtered.length, 1)
  assert.equal(filtered[0]?.collection.id, '2')
})
