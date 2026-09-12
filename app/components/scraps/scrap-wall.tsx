import { useState, type FormEvent } from "react"
import { Link } from "react-router"
import { useAuth } from "~/lib/auth-context"
import { getProfilePictureUrl } from "~/lib/api/auth"
import { getErrorMessage } from "~/lib/api/client"
import { createScrap, deleteScrap, getProfileScraps } from "~/lib/api/scrap"
import { useAsyncData } from "~/lib/use-async-data"
import type { PublicProfileDto } from "~/lib/api/types"

const MAX_CONTENT_LENGTH = 500

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function ScrapWall({ profile }: { profile: PublicProfileDto }) {
  const { user: me } = useAuth()
  const isSelf = me?.id === profile.id
  const [content, setContent] = useState("")
  const [visibility, setVisibility] = useState<"Public" | "Private">("Public")
  const [submitting, setSubmitting] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const { data, setData, loading, error, refresh } = useAsyncData(
    () => getProfileScraps(profile.id),
    [profile.id],
    { fallbackError: "Erro ao carregar scraps." }
  )

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!content.trim()) return

    setSubmitting(true)
    setActionError(null)
    try {
      const createdScrap = await createScrap({
        recipientId: profile.id,
        content: content.trim(),
        visibility,
      })
      setContent("")
      setVisibility("Public")
      setData((current) =>
        current
          ? {
              ...current,
              items: [
                {
                  ...createdScrap,
                  authorProfilePicture: getProfilePictureUrl(
                    createdScrap.authorProfilePicture
                  ),
                },
                ...current.items.filter((scrap) => scrap.id !== createdScrap.id),
              ],
              totalItems: current.totalItems + 1,
            }
          : {
              items: [
                {
                  ...createdScrap,
                  authorProfilePicture: getProfilePictureUrl(
                    createdScrap.authorProfilePicture
                  ),
                },
              ],
              page: 1,
              pageSize: 10,
              totalItems: 1,
              hasNextPage: false,
            }
      )
    } catch (err) {
      setActionError(getErrorMessage(err, "Não foi possível publicar o scrap."))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleLoadMore() {
    if (!data?.hasNextPage || loadingMore) return

    setLoadingMore(true)
    setActionError(null)
    try {
      const nextPage = await getProfileScraps(profile.id, data.page + 1)
      setData((current) =>
        current
          ? {
              ...nextPage,
              items: [
                ...current.items,
                ...nextPage.items.filter(
                  (nextScrap) =>
                    !current.items.some((scrap) => scrap.id === nextScrap.id)
                ),
              ],
            }
          : nextPage
      )
    } catch (err) {
      setActionError(
        getErrorMessage(err, "Não foi possível carregar mais scraps.")
      )
    } finally {
      setLoadingMore(false)
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    setActionError(null)
    try {
      await deleteScrap(id)
      setData((current) =>
        current
          ? {
              ...current,
              items: current.items.filter((scrap) => scrap.id !== id),
              totalItems: Math.max(0, current.totalItems - 1),
            }
          : current
      )
    } catch (err) {
      setActionError(getErrorMessage(err, "Não foi possível excluir o scrap."))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section className="space-y-5" aria-labelledby="scraps-title">
      <div>
        <div className="section-title">mural</div>
        <h2 id="scraps-title" className="text-2xl font-semibold tracking-tight">
          Scraps
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Deixe um recado para {profile.name}.
        </p>
      </div>

      {me && !isSelf && (
        <form
          onSubmit={handleSubmit}
          className="space-y-3 rounded-xl border bg-card p-5"
        >
          <label htmlFor="scrap-content" className="sr-only">
            Escreva um scrap
          </label>
          <textarea
            id="scrap-content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            maxLength={MAX_CONTENT_LENGTH}
            rows={4}
            placeholder="Escreva um recado..."
            className="min-h-28 w-full resize-y rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            disabled={submitting}
          />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <label htmlFor="scrap-visibility">Visibilidade</label>
              <select
                id="scrap-visibility"
                value={visibility}
                onChange={(event) =>
                  setVisibility(event.target.value as "Public" | "Private")
                }
                className="rounded-md border bg-background px-2 py-1.5 text-sm text-foreground"
                disabled={submitting}
              >
                <option value="Public">Público</option>
                <option value="Private">Privado</option>
              </select>
              <span>
                {content.length}/{MAX_CONTENT_LENGTH}
              </span>
            </div>
            <button
              type="submit"
              className="btn primary"
              disabled={submitting || !content.trim()}
            >
              {submitting ? "Publicando..." : "Publicar scrap"}
            </button>
          </div>
        </form>
      )}

      {actionError && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {actionError}
        </p>
      )}

      {loading ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Carregando scraps...
        </p>
      ) : error ? (
        <div className="empty-state">
          <h2>Não foi possível carregar</h2>
          <p>{error}</p>
          <button type="button" className="btn mt-4" onClick={refresh}>
            Tentar novamente
          </button>
        </div>
      ) : data?.items.length ? (
        <div className="space-y-3">
          {data.items.map((scrap) => (
            <article key={scrap.id} className="rounded-xl border bg-card p-4">
              <div className="flex items-start gap-3">
                <div className="mini-avatar" aria-hidden="true">
                  {scrap.authorProfilePicture ? (
                    <img src={scrap.authorProfilePicture} alt="" />
                  ) : (
                    initials(scrap.authorName)
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <Link
                      to={`/u/${scrap.authorUsername}`}
                      className="font-semibold hover:underline"
                    >
                      {scrap.authorName}
                    </Link>
                    <span className="text-xs text-muted-foreground">
                      @{scrap.authorUsername}
                    </span>
                    <time
                      dateTime={scrap.createdAt}
                      className="text-xs text-muted-foreground"
                    >
                      · {formatDate(scrap.createdAt)}
                    </time>
                  </div>
                  <p className="mt-2 text-sm leading-6 whitespace-pre-wrap">
                    {scrap.content}
                  </p>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="text-xs text-muted-foreground">
                      {scrap.visibility === "Private"
                        ? "🔒 Privado"
                        : "🌐 Público"}
                    </span>
                    {me?.id === scrap.authorId && (
                      <button
                        type="button"
                        className="text-xs text-destructive hover:underline"
                        onClick={() => handleDelete(scrap.id)}
                        disabled={deletingId === scrap.id}
                      >
                        {deletingId === scrap.id ? "Excluindo..." : "Excluir"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </article>
          ))}
          {data.hasNextPage && (
            <div className="flex justify-center">
              <button
                type="button"
                className="btn"
                onClick={handleLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? "Carregando..." : "Carregar mais"}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="empty-state">
          <h2>Nenhum scrap ainda</h2>
          <p>Seja a primeira pessoa a deixar um recado.</p>
        </div>
      )}
    </section>
  )
}
