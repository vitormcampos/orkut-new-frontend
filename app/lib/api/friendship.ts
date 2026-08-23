import { api } from "./client"
import { getProfilePictureUrl } from "./auth"
import type {
  FriendshipDto,
  SendFriendshipRequest,
  UserSummaryDto,
} from "./types"

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
  return api.get<FriendshipDto[]>("/Friendships")
}

export async function getPendingRequests(): Promise<FriendshipDto[]> {
  return api.get<FriendshipDto[]>("/Friendships/pending")
}

export async function getSentRequests(): Promise<FriendshipDto[]> {
  return api.get<FriendshipDto[]>("/Friendships/sent")
}

export async function getFriendsInCommon(
  userId: string
): Promise<UserSummaryDto[]> {
  const users = await api.get<UserSummaryDto[]>(
    `/Friendships/in-common/${userId}`
  )
  return normalizeUsers(users)
}
