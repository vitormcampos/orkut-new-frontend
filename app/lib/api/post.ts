import { getProfilePictureUrl } from "~/lib/api/auth"
import { api } from "~/lib/api/client"
import type { CreatePostRequest, PostDto, PostPageDto } from "~/lib/api/types"

function normalizePost(post: PostDto): PostDto {
  return {
    ...post,
    authorProfilePicture: getProfilePictureUrl(post.authorProfilePicture),
  }
}

function normalizePage(page: PostPageDto): PostPageDto {
  return { ...page, items: page.items.map(normalizePost) }
}

export async function getUserPosts(
  userId: string,
  page = 1
): Promise<PostPageDto> {
  return normalizePage(
    await api.get<PostPageDto>(
      `/posts/users/${userId}?page=${page}&pageSize=10`
    )
  )
}

export async function getCommunityPosts(
  communityId: string,
  page = 1
): Promise<PostPageDto> {
  return normalizePage(
    await api.get<PostPageDto>(
      `/posts/communities/${communityId}?page=${page}&pageSize=10`
    )
  )
}

export async function createPost(body: CreatePostRequest): Promise<PostDto> {
  return normalizePost(await api.post<PostDto>("/posts", body))
}

export async function deletePost(id: string): Promise<void> {
  await api.delete<void>(`/posts/${id}`)
}
