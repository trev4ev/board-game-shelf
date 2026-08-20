export type FriendshipStatus = 'pending' | 'accepted'

export type Friendship = {
  id: string
  requesterId: string
  addresseeId: string
  status: FriendshipStatus
  createdAt: string
  otherUserId: string
  otherUsername: string | null
}

export type TaggedPerson = {
  id: string
  username: string
  source: 'friend' | 'member'
}
