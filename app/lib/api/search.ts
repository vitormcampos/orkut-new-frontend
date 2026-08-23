import { api } from "./client"
import { getProfilePictureUrl } from "./auth"
import type { CommunitySearchResultDto, UserSearchResultDto } from "./types"

function searchPath(path: string, term: string, limit: number): string {
  const params = new URLSearchParams({ term, limit: String(limit) })
  return `${path}?${params.toString()}`
}

export async function searchUsers(
  term: string,
  limit = 10
): Promise<UserSearchResultDto[]> {
  const users = await api.get<UserSearchResultDto[]>(
    searchPath("/Users/search", term, limit)
  )

  return users.map((user) => ({
    ...user,
    profilePicture: getProfilePictureUrl(user.profilePicture),
  }))
}

export async function searchCommunities(
  term: string,
  limit = 10
): Promise<CommunitySearchResultDto[]> {
  const communities = await api.get<CommunitySearchResultDto[]>(
    searchPath("/Communities/search", term, limit)
  )

  return communities.map((community) => ({
    ...community,
    photo: getProfilePictureUrl(community.photo),
  }))
}
