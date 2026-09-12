import { api } from "./client"
import { getProfilePictureUrl } from "./auth"
import type {
  CommunitySearchResultDto,
  SearchPageDto,
  UserSearchResultDto,
} from "./types"

function searchPath(
  path: string,
  term: string,
  page: number,
  pageSize: number
): string {
  const params = new URLSearchParams({
    term,
    page: String(page),
    pageSize: String(pageSize),
  })
  return `${path}?${params.toString()}`
}

export async function searchUsers(
  term: string,
  page = 1,
  pageSize = 10
): Promise<SearchPageDto<UserSearchResultDto>> {
  const result = await api.get<SearchPageDto<UserSearchResultDto>>(
    searchPath("/Users/search", term, page, pageSize)
  )

  return {
    ...result,
    items: result.items.map((user) => ({
      ...user,
      profilePicture: getProfilePictureUrl(user.profilePicture),
    })),
  }
}

export async function searchCommunities(
  term: string,
  page = 1,
  pageSize = 10
): Promise<SearchPageDto<CommunitySearchResultDto>> {
  const result = await api.get<SearchPageDto<CommunitySearchResultDto>>(
    searchPath("/Communities/search", term, page, pageSize)
  )

  return {
    ...result,
    items: result.items.map((community) => ({
      ...community,
      photo: getProfilePictureUrl(community.photo),
    })),
  }
}
