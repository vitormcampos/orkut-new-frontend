import { getProfilePictureUrl } from "~/lib/api/auth"
import { api } from "~/lib/api/client"
import type {
  CommunityDto,
  CommunityMemberDto,
  CreateCommunityRequest,
  UpdateCommunityRequest,
} from "~/lib/api/types"

function normalizeCommunity(community: CommunityDto): CommunityDto {
  return { ...community, photo: getProfilePictureUrl(community.photo) }
}

function normalizeMember(member: CommunityMemberDto): CommunityMemberDto {
  return {
    ...member,
    userProfilePicture: getProfilePictureUrl(member.userProfilePicture),
  }
}

export async function getCommunity(id: string): Promise<CommunityDto> {
  return normalizeCommunity(await api.get<CommunityDto>(`/Communities/${id}`))
}

export async function getUserCommunities(
  userId: string
): Promise<CommunityDto[]> {
  const communities = await api.get<CommunityDto[]>(
    `/Communities/user/${userId}`
  )
  return communities.map(normalizeCommunity)
}

export async function getCommunityMembers(
  id: string
): Promise<CommunityMemberDto[]> {
  const members = await api.get<CommunityMemberDto[]>(
    `/Communities/${id}/members`
  )
  return members.map(normalizeMember)
}

export async function createCommunity(
  body: CreateCommunityRequest
): Promise<CommunityDto> {
  return normalizeCommunity(await api.post<CommunityDto>("/Communities", body))
}

export async function updateCommunity(
  id: string,
  body: UpdateCommunityRequest
): Promise<CommunityDto> {
  return normalizeCommunity(
    await api.put<CommunityDto>(`/Communities/${id}`, body)
  )
}

export async function joinCommunity(id: string): Promise<void> {
  await api.post<void>(`/Communities/${id}/join`)
}

export async function leaveCommunity(id: string): Promise<void> {
  await api.post<void>(`/Communities/${id}/leave`)
}

export async function uploadCommunityPhoto(
  id: string,
  file: File
): Promise<CommunityDto> {
  const formData = new FormData()
  formData.append("file", file)
  return normalizeCommunity(
    await api.upload<CommunityDto>(`/Communities/${id}/photo`, formData)
  )
}
