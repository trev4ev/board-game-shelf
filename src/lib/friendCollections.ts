import type { Collection, FriendCollection } from '../types/collection'

export type FriendCollectionRow = {
  userId: string
  username: string | null
  collection: Collection
}

export function groupFriendCollections(rows: FriendCollectionRow[]): FriendCollection[] {
  const map = new Map<string, FriendCollection>()
  for (const row of rows) {
    const existing = map.get(row.collection.id)
    if (existing) {
      if (!existing.friends.some((friend) => friend.userId === row.userId)) {
        existing.friends.push({ userId: row.userId, username: row.username })
      }
      continue
    }
    map.set(row.collection.id, {
      collection: row.collection,
      friends: [{ userId: row.userId, username: row.username }],
    })
  }
  return [...map.values()].sort((a, b) =>
    a.collection.name.localeCompare(b.collection.name, undefined, {
      sensitivity: 'base',
    }),
  )
}

export function friendNamesLabel(friends: FriendCollection['friends']) {
  const names = friends
    .map((friend) => friend.username)
    .filter((name): name is string => Boolean(name))
  if (names.length === 0) return 'Friend'
  if (names.length === 1) return names[0]
  if (names.length === 2) return `${names[0]} and ${names[1]}`
  return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`
}

export function excludeCollectionIds(
  items: FriendCollection[],
  ids: Iterable<string>,
) {
  const skip = new Set(ids)
  return items.filter((item) => !skip.has(item.collection.id))
}
