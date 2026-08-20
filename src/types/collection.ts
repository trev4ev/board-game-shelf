export type Collection = {
  id: string
  name: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

export type MembershipStatus = 'pending' | 'accepted'

export type CollectionMember = {
  collectionId: string
  userId: string
  status: MembershipStatus
  invitedBy: string | null
  createdAt: string
  username: string | null
}

export type CollectionMembership = {
  collection: Collection
  status: MembershipStatus
  createdAt: string
}
