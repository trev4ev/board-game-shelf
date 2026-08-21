import { supabase } from './supabase'
import type { Profile } from '../types/profile'
import { normalizeUsername, usernameError } from './username'

function requireClient() {
  if (!supabase) throw new Error('Supabase is not configured')
  return supabase
}

type ProfileRow = {
  id: string
  username: string | null
  username_set_at: string | null
  created_at: string
  updated_at: string
}

export function rowToProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    username: row.username,
    usernameSetAt: row.username_set_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const client = requireClient()
  const { data, error } = await client
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()
  if (error) throw error
  return data ? rowToProfile(data as ProfileRow) : null
}

export async function setUsername(userId: string, raw: string): Promise<Profile> {
  const username = normalizeUsername(raw)
  const invalid = usernameError(username)
  if (invalid) throw new Error(invalid)

  const client = requireClient()
  const { data, error } = await client
    .from('profiles')
    .update({
      username,
      username_set_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select('*')
    .single()

  if (error) {
    if (error.code === '23505') {
      throw new Error('That username is already taken.')
    }
    throw error
  }
  return rowToProfile(data as ProfileRow)
}

export async function findProfileByUsername(raw: string): Promise<Profile | null> {
  const username = normalizeUsername(raw)
  if (!username) return null
  const client = requireClient()
  const { data, error } = await client
    .from('profiles')
    .select('*')
    .ilike('username', username)
    .maybeSingle()
  if (error) throw error
  return data ? rowToProfile(data as ProfileRow) : null
}

export async function searchProfiles(
  raw: string,
  excludeId?: string,
  limit = 8,
): Promise<Profile[]> {
  const query = normalizeUsername(raw).replace(/[%_]/g, '')
  if (query.length < 2) return []
  const client = requireClient()
  let request = client
    .from('profiles')
    .select('*')
    .not('username', 'is', null)
    .ilike('username', `${query}%`)
    .order('username', { ascending: true })
    .limit(limit)
  if (excludeId) request = request.neq('id', excludeId)
  const { data, error } = await request
  if (error) throw error
  return ((data ?? []) as ProfileRow[]).map(rowToProfile)
}

export async function listProfilesByIds(ids: string[]): Promise<Profile[]> {
  if (ids.length === 0) return []
  const client = requireClient()
  const { data, error } = await client.from('profiles').select('*').in('id', ids)
  if (error) throw error
  return ((data ?? []) as ProfileRow[]).map(rowToProfile)
}
