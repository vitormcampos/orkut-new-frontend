import type { FriendshipDto } from "~/lib/api/types"

export function getFriendDisplay(
  friendship: FriendshipDto,
  currentUserId: string
): {
  name: string
  username?: string | null
  profilePicture?: string | null
} {
  const isRequester = friendship.requesterId === currentUserId

  return isRequester
    ? {
        name: friendship.addresseeName ?? "Usuário",
        username: friendship.addresseeUsername,
        profilePicture: friendship.addresseeProfilePicture,
      }
    : {
        name: friendship.requesterName ?? "Usuário",
        username: friendship.requesterUsername,
        profilePicture: friendship.requesterProfilePicture,
      }
}
