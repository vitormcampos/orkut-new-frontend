import { api } from "./client"
import { getProfilePictureUrl } from "./auth"
import type {
  FriendshipDto,
  SendFriendshipRequest,
  UserSummaryDto,
} from "./types"

function normalizeFriendship(friendship: FriendshipDto): FriendshipDto {
  return {
    ...friendship,
    requesterProfilePicture: getProfilePictureUrl(
      friendship.requesterProfilePicture
    ),
    addresseeProfilePicture: getProfilePictureUrl(
      friendship.addresseeProfilePicture
    ),
  }
}

function normalizeUsers(users: UserSummaryDto[]): UserSummaryDto[] {
  return users.map((user) => {
    if (user.profilePicture) {
      const full = getProfilePictureUrl(user.profilePicture)
      if (full) return { ...user, profilePicture: full }
    }
    return user
  })
}

export async function sendFriendRequest(
  body: SendFriendshipRequest
): Promise<FriendshipDto> {
  return api.post<FriendshipDto>("/Friendships/request", body)
}

export async function acceptFriendRequest(id: string): Promise<FriendshipDto> {
  return api.post<FriendshipDto>(`/Friendships/${id}/accept`)
}

export async function rejectFriendRequest(id: string): Promise<FriendshipDto> {
  return api.post<FriendshipDto>(`/Friendships/${id}/reject`)
}

export async function removeFriendship(id: string): Promise<void> {
  await api.delete<void>(`/Friendships/${id}`)
}

export async function getFriends(): Promise<FriendshipDto[]> {
  const friendships = await api.get<FriendshipDto[]>("/Friendships")
  return friendships.map(normalizeFriendship)
}

export async function getPendingRequests(): Promise<FriendshipDto[]> {
  const friendships = await api.get<FriendshipDto[]>("/Friendships/pending")
  return friendships.map(normalizeFriendship)
}

export async function getSentRequests(): Promise<FriendshipDto[]> {
  const friendships = await api.get<FriendshipDto[]>("/Friendships/sent")
  return friendships.map(normalizeFriendship)
}

export async function getFriendsInCommon(
  userId: string
): Promise<UserSummaryDto[]> {
  const users = await api.get<UserSummaryDto[]>(
    `/Friendships/in-common/${userId}`
  )
  return normalizeUsers(users)
}
