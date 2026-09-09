import { api } from "./client"
import { getProfilePictureUrl } from "./auth"
import type { CreateScrapRequest, ScrapDto, ScrapPageDto } from "./types"

export async function getProfileScraps(
  profileId: string,
  page = 1,
  pageSize = 10
): Promise<ScrapPageDto> {
  const result = await api.get<ScrapPageDto>(
    `/Scraps/profile/${profileId}?page=${page}&pageSize=${pageSize}`
  )

  return {
    ...result,
    items: result.items.map((scrap) => ({
      ...scrap,
      authorProfilePicture: getProfilePictureUrl(scrap.authorProfilePicture),
    })),
  }
}

export async function createScrap(body: CreateScrapRequest): Promise<ScrapDto> {
  return api.post<ScrapDto>("/Scraps", body)
}

export async function deleteScrap(id: string): Promise<void> {
  await api.delete<void>(`/Scraps/${id}`)
}
