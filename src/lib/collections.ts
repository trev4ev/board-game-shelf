import { supabase } from './supabase'
import { listProfilesByIds, findProfileByUsername } from './profiles'
import type {
  Collection,
  CollectionMember,
  CollectionMembership,
  CollectionSummary,
} from '../types/collection'

function requireClient() {
  if (!supabase) throw new Error('Supabase is not configured')
  return supabase
}

type CollectionRow = {
  id: string
  name: string
  created_by: string
  created_at: string
  updated_at: string
}

type MemberRow = {
  collection_id: string
  user_id: string
  status: 'pending' | 'accepted'
  invited_by: string | null
  created_at: string
}

export function rowToCollection(row: CollectionRow): Collection {
  return {
    id: row.id,
    name: row.name,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function getCollection(id: string): Promise<Collection | null> {
  const client = requireClient()
  const { data, error } = await client
    .from('collections')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data ? rowToCollection(data as CollectionRow) : null
}

export async function listMyMemberships(
  userId: string,
): Promise<CollectionMembership[]> {
  const client = requireClient()
  const { data, error } = await client
    .from('collection_members')
    .select('status, created_at, collection_id, collections (*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
  if (error) throw error

  const rows = (data ?? []) as Array<
    MemberRow & { collections: CollectionRow | CollectionRow[] | null }
  >
  const memberships: CollectionMembership[] = []
  for (const row of rows) {
    const collectionRow = Array.isArray(row.collections)
      ? row.collections[0]
      : row.collections
    if (!collectionRow) continue
    memberships.push({
      collection: rowToCollection(collectionRow),
      status: row.status,
      createdAt: row.created_at,
    })
  }
  return memberships
}

const PREVIEW_GAMES = 4

export async function listCollectionSummaries(
  collectionIds: string[],
): Promise<Map<string, CollectionSummary>> {
  const summaries = new Map<string, CollectionSummary>()
  for (const id of collectionIds) {
    summaries.set(id, {
      collectionId: id,
      gameCount: 0,
      memberCount: 0,
      games: [],
    })
  }
  if (collectionIds.length === 0) return summaries

  const client = requireClient()
  const [{ data: gameRows, error: gameError }, { data: memberRows, error: memberError }] =
    await Promise.all([
      client
        .from('games')
        .select('id, collection_id, name, thumbnail_url')
        .in('collection_id', collectionIds)
        .order('name', { ascending: true }),
      client
        .from('collection_members')
        .select('collection_id')
        .in('collection_id', collectionIds)
        .eq('status', 'accepted'),
    ])
  if (gameError) throw gameError
  if (memberError) throw memberError

  for (const row of (gameRows ?? []) as Array<{
    id: string
    collection_id: string
    name: string
    thumbnail_url: string | null
  }>) {
    const summary = summaries.get(row.collection_id)
    if (!summary) continue
    summary.gameCount += 1
    if (summary.games.length < PREVIEW_GAMES) {
      summary.games.push({
        id: row.id,
        name: row.name,
        thumbnailUrl: row.thumbnail_url,
      })
    }
  }

  for (const row of (memberRows ?? []) as Array<{ collection_id: string }>) {
    const summary = summaries.get(row.collection_id)
    if (summary) summary.memberCount += 1
  }

  return summaries
}

export async function createCollection(userId: string, name: string): Promise<Collection> {
  const trimmed = name.trim()
  if (!trimmed) throw new Error('Name your collection.')
  const client = requireClient()
  const { data, error } = await client
    .from('collections')
    .insert({ name: trimmed, created_by: userId })
    .select('*')
    .single()
  if (error) throw error
  return rowToCollection(data as CollectionRow)
}

export async function ensureDefaultCollection(
  userId: string,
  username: string,
): Promise<Collection | null> {
  const memberships = await listMyMemberships(userId)
  if (memberships.some((item) => item.status === 'accepted')) {
    return memberships.find((item) => item.status === 'accepted')?.collection ?? null
  }
  return createCollection(userId, `${username}'s collection`)
}

export async function renameCollection(id: string, name: string): Promise<Collection> {
  const trimmed = name.trim()
  if (!trimmed) throw new Error('Name your collection.')
  const client = requireClient()
  const { data, error } = await client
    .from('collections')
    .update({ name: trimmed })
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw error
  return rowToCollection(data as CollectionRow)
}

export async function deleteCollection(id: string): Promise<void> {
  const client = requireClient()
  const { error } = await client.from('collections').delete().eq('id', id)
  if (error) throw error
}

export async function listCollectionMembers(
  collectionId: string,
): Promise<CollectionMember[]> {
  const client = requireClient()
  const { data, error } = await client
    .from('collection_members')
    .select('*')
    .eq('collection_id', collectionId)
    .order('created_at', { ascending: true })
  if (error) throw error
  const rows = (data ?? []) as MemberRow[]
  const profiles = await listProfilesByIds(rows.map((row) => row.user_id))
  const names = new Map(profiles.map((profile) => [profile.id, profile.username]))
  return rows.map((row) => ({
    collectionId: row.collection_id,
    userId: row.user_id,
    status: row.status,
    invitedBy: row.invited_by,
    createdAt: row.created_at,
    username: names.get(row.user_id) ?? null,
  }))
}

export async function inviteCollectionMember(
  collectionId: string,
  invitedBy: string,
  username: string,
): Promise<void> {
  const profile = await findProfileByUsername(username)
  if (!profile?.username) {
    throw new Error('No user with that username.')
  }
  if (profile.id === invitedBy) {
    throw new Error('You already own this collection.')
  }
  const client = requireClient()
  const { error } = await client.from('collection_members').insert({
    collection_id: collectionId,
    user_id: profile.id,
    status: 'pending',
    invited_by: invitedBy,
  })
  if (error) {
    if (error.code === '23505') {
      throw new Error('That person is already a member or has a pending invite.')
    }
    throw error
  }
}

export async function acceptCollectionInvite(
  collectionId: string,
  userId: string,
): Promise<void> {
  const client = requireClient()
  const { error } = await client
    .from('collection_members')
    .update({ status: 'accepted' })
    .eq('collection_id', collectionId)
    .eq('user_id', userId)
    .eq('status', 'pending')
  if (error) throw error
}

export async function removeCollectionMember(
  collectionId: string,
  userId: string,
): Promise<void> {
  const client = requireClient()
  const { error } = await client
    .from('collection_members')
    .delete()
    .eq('collection_id', collectionId)
    .eq('user_id', userId)
  if (error) {
    if (error.code === 'P0001' || error.message.toLowerCase().includes('last member')) {
      throw new Error('You are the last member. Delete the collection instead.')
    }
    throw error
  }
}

export function isAcceptedMember(
  memberships: CollectionMembership[],
  collectionId: string,
) {
  return memberships.some(
    (item) => item.collection.id === collectionId && item.status === 'accepted',
  )
}
