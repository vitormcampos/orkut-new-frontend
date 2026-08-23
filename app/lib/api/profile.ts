import { api } from "./client"
import { getProfilePictureUrl } from "./auth"
import type { PublicProfileDto } from "./types"

export async function getPublicProfile(
  username: string
): Promise<PublicProfileDto> {
  const profile = await api.get<PublicProfileDto>(
    `/Profiles/${encodeURIComponent(username)}`
  )
  if (profile.profilePicture) {
    const full = getProfilePictureUrl(profile.profilePicture)
    if (full) return { ...profile, profilePicture: full }
  }
  return profile
}
