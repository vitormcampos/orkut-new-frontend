import { useState } from "react"
import { Button } from "~/components/ui/button"
import { PostCard } from "~/components/posts/post-card"
import { PostComposer } from "~/components/posts/post-composer"
import { useAuth } from "~/lib/auth-context"
import { getErrorMessage } from "~/lib/api/client"
import {
  createPost,
  deletePost,
  getCommunityPosts,
  getUserPosts,
} from "~/lib/api/post"
import { useAsyncData } from "~/lib/use-async-data"
import type { PostDto } from "~/lib/api/types"

const PAGE_SIZE = 10

export function PostWall({
  userId,
  communityId,
  canPost = false,
  canModerate = false,
}: {
  userId?: string
  communityId?: string
  canPost?: boolean
  canModerate?: boolean
}) {
  const { user } = useAuth()
  const [busy, setBusy] = useState(false)
  const [moreBusy, setMoreBusy] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const fetchPage = (page = 1) =>
    communityId
      ? getCommunityPosts(communityId, page)
      : getUserPosts(userId!, page)
  const { data, setData, loading, error, refresh } = useAsyncData(
    () => fetchPage(),
    [userId, communityId],
    { fallbackError: "Erro ao carregar publicações." }
  )

  async function publish(content: string): Promise<boolean> {
    setBusy(true)
    setErrorMessage(null)
    try {
      const post = await createPost({
        communityId: communityId ?? null,
        content,
      })
      setData((current) =>
        current
          ? {
              ...current,
              items: [
                post,
                ...current.items.filter((item) => item.id !== post.id),
              ].slice(0, PAGE_SIZE),
              totalCount: current.totalCount + 1,
            }
          : { items: [post], page: 1, pageSize: PAGE_SIZE, totalCount: 1 }
      )
      return true
    } catch (err) {
      setErrorMessage(getErrorMessage(err, "Não foi possível publicar."))
      return false
    } finally {
      setBusy(false)
    }
  }

  async function loadMore() {
    if (!data || data.page * data.pageSize >= data.totalCount || moreBusy)
      return
    setMoreBusy(true)
    setErrorMessage(null)
    try {
      const next = await fetchPage(data.page + 1)
      setData((current) =>
        current
          ? {
              ...next,
              items: [
                ...current.items,
                ...next.items.filter(
                  (post) => !current.items.some((item) => item.id === post.id)
                ),
              ],
            }
          : next
      )
    } catch (err) {
      setErrorMessage(
        getErrorMessage(err, "Não foi possível carregar mais publicações.")
      )
    } finally {
      setMoreBusy(false)
    }
  }

  async function remove(post: PostDto) {
    setDeletingId(post.id)
    setErrorMessage(null)
    try {
      await deletePost(post.id)
      setData((current) =>
        current
          ? {
              ...current,
              items: current.items.filter((item) => item.id !== post.id),
              totalCount: Math.max(0, current.totalCount - 1),
            }
          : current
      )
    } catch (err) {
      setErrorMessage(
        getErrorMessage(err, "Não foi possível excluir a publicação.")
      )
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section className="post-wall space-y-5" aria-label="Publicações">
      {canPost && user && (
        <PostComposer busy={busy} onPublish={publish} />
      )}
      {errorMessage && (
        <p
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {errorMessage}
        </p>
      )}
      {loading ? (
        <div className="post-loading rounded-xl border bg-card px-5 py-12 text-center text-sm text-muted-foreground" role="status">
          Carregando publicações...
        </div>
      ) : error ? (
        <div className="empty-state">
          <h2>Não foi possível carregar</h2>
          <p>{error}</p>
          <Button
            type="button"
            variant="outline"
            className="mt-4"
            onClick={refresh}
          >
            Tentar novamente
          </Button>
        </div>
      ) : data?.items.length ? (
        <div className="space-y-3">
          {data.items.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              canDelete={
                !!user &&
                (user.id === post.authorId || (canModerate && !!communityId))
              }
              deleting={deletingId === post.id}
              onDelete={() => void remove(post)}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="eyebrow">publicações</div>
          <h2>Nada por aqui ainda</h2>
          <p>
            {canPost
              ? "Compartilhe uma ideia para começar a conversa."
              : "As publicações aparecerão aqui."}
          </p>
        </div>
      )}
      {data && data.page * data.pageSize < data.totalCount && (
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => void loadMore()}
            disabled={moreBusy}
          >
            {moreBusy ? "Carregando..." : "Carregar mais"}
          </Button>
        </div>
      )}
    </section>
  )
}
