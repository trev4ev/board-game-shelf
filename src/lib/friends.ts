import { supabase } from './supabase'
import { listProfilesByIds } from './profiles'
import type { Friendship } from '../types/friend'
import type { Profile } from '../types/profile'

function requireClient() {
  if (!supabase) throw new Error('Supabase is not configured')
  return supabase
}

type FriendshipRow = {
  id: string
  requester_id: string
  addressee_id: string
  status: 'pending' | 'accepted'
  created_at: string
}

function toFriendship(row: FriendshipRow, me: string, profiles: Profile[]): Friendship {
  const otherUserId = row.requester_id === me ? row.addressee_id : row.requester_id
  const other = profiles.find((profile) => profile.id === otherUserId)
  return {
    id: row.id,
    requesterId: row.requester_id,
    addresseeId: row.addressee_id,
    status: row.status,
    createdAt: row.created_at,
    otherUserId,
    otherUsername: other?.username ?? null,
  }
}

export async function listFriendships(userId: string): Promise<Friendship[]> {
  const client = requireClient()
  const { data, error } = await client
    .from('friendships')
    .select('*')
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
    .order('created_at', { ascending: false })
  if (error) throw error
  const rows = (data ?? []) as FriendshipRow[]
  const otherIds = rows.map((row) =>
    row.requester_id === userId ? row.addressee_id : row.requester_id,
  )
  const profiles = await listProfilesByIds(otherIds)
  return rows.map((row) => toFriendship(row, userId, profiles))
}

export async function sendFriendRequest(fromId: string, toId: string): Promise<void> {
  if (fromId === toId) throw new Error('You cannot friend yourself.')
  const client = requireClient()
  const { error } = await client.from('friendships').insert({
    requester_id: fromId,
    addressee_id: toId,
    status: 'pending',
  })
  if (error) {
    if (error.code === '23505') {
      throw new Error('You already have a friend request with that person.')
    }
    throw error
  }
}

export async function acceptFriendRequest(id: string, userId: string): Promise<void> {
  const client = requireClient()
  const { error } = await client
    .from('friendships')
    .update({ status: 'accepted' })
    .eq('id', id)
    .eq('addressee_id', userId)
    .eq('status', 'pending')
  if (error) throw error
}

export async function deleteFriendship(id: string): Promise<void> {
  const client = requireClient()
  const { error } = await client.from('friendships').delete().eq('id', id)
  if (error) throw error
}
