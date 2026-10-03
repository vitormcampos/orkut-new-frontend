import { useState } from "react"
import { useNavigate, useParams } from "react-router"
import type { Route } from "./+types/community-detail"
import styles from "./community-detail.module.css"
import { Navbar } from "~/components/navbar"
import { CommunityActions } from "~/components/communities/community-actions"
import { PostWall } from "~/components/posts/post-wall"
import { CommunityEmptyState } from "~/components/communities/community-empty-state"
import { CommunityErrorState } from "~/components/communities/community-error-state"
import { CommunityHeader } from "~/components/communities/community-header"
import { CommunityLoading } from "~/components/communities/community-loading"
import { CommunityMemberList } from "~/components/communities/community-member-list"
import { CommunityPhotoUpload } from "~/components/communities/community-photo-upload"
import { useAuth } from "~/lib/auth-context"
import { ApiError, getErrorMessage } from "~/lib/api/client"
import {
  getCommunity,
  getCommunityMembers,
  joinCommunity,
  leaveCommunity,
} from "~/lib/api/community"
import { useAsyncData } from "~/lib/use-async-data"
import type { CommunityDto } from "~/lib/api/types"

export function meta({}: Route.MetaArgs) {
  return [{ title: "Comunidade | newkut" }]
}
export default function CommunityDetailPage() {
  const { id } = useParams()
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const community = useAsyncData(
    () => {
      if (!id) throw new Error("Comunidade ausente")
      return getCommunity(id)
    },
    [id],
    {
      resetOnFetch: true,
      fallbackError: "Erro ao carregar comunidade.",
      mapError: (err) =>
        err instanceof ApiError && err.status === 404
          ? { message: "Comunidade não encontrada.", notFound: true }
          : null,
    }
  )
  const members = useAsyncData(
    () => {
      if (!id) throw new Error("Comunidade ausente")
      return getCommunityMembers(id)
    },
    [id],
    { resetOnFetch: true, fallbackError: "Erro ao carregar membros." }
  )
  const current = community.data
  const isOwner = !!user && !!current && user.id === current.ownerId
  const isMember =
    !!user && !!members.data?.some((member) => member.userId === user.id)
  async function handleAction(action: "join" | "leave") {
    if (!id) return
    if (
      action === "leave" &&
      !globalThis.confirm("Deseja sair desta comunidade?")
    )
      return
    setActionLoading(true)
    setMessage(null)
    try {
      if (action === "join") await joinCommunity(id)
      else await leaveCommunity(id)
      setMessage(
        action === "join"
          ? "Você entrou na comunidade!"
          : "Você saiu da comunidade."
      )
      community.setData((value) =>
        value
          ? {
              ...value,
              memberCount: Math.max(
                0,
                value.memberCount + (action === "join" ? 1 : -1)
              ),
            }
          : value
      )
      members.refresh()
    } catch (err) {
      setMessage(getErrorMessage(err, "Não foi possível concluir a ação."))
    } finally {
      setActionLoading(false)
    }
  }
  function handleUploaded(updated: CommunityDto) {
    community.setData(updated)
  }
  return (
    <div className="min-h-svh">
      <Navbar />
      <main className={`shell community-detail-page ${styles.page}`}>
        {community.loading ? (
          <CommunityLoading />
        ) : community.notFound ? (
          <CommunityEmptyState
            title="Comunidade não encontrada"
            description="Este espaço não existe ou foi removido."
          />
        ) : community.error || !current ? (
          <CommunityErrorState
            message={
              community.error ?? "Não foi possível carregar a comunidade."
            }
          />
        ) : (
          <>
            <CommunityHeader community={current} />
            <div className={styles.actionRow}>
              <CommunityActions
                community={current}
                isOwner={isOwner}
                isMember={isMember}
                membershipKnown={
                  !members.loading && !members.error && !!members.data
                }
                loading={actionLoading || authLoading || members.loading}
                onJoin={() => void handleAction("join")}
                onLeave={() => void handleAction("leave")}
              />
              {message && (
                <p className="text-sm text-muted-foreground" role="status">
                  {message}
                </p>
              )}
            </div>
            <div className={styles.layout}>
              <section className={styles.feed} aria-label="Mural da comunidade">
                <div className={styles.sectionHeading}>
                  <div>
                    <p className="eyebrow">conversa aberta</p>
                    <h2>Mural</h2>
                  </div>
                </div>
                <PostWall
                  communityId={current.id}
                  canPost={isMember}
                  canModerate={isOwner}
                />
              </section>
              <aside className={styles.aside}>
                <section className={`${styles.info} side-card`}>
                  <h2>Sobre</h2>
                  <p className="whitespace-pre-wrap text-muted-foreground">
                    {current.description ||
                      "Esta comunidade ainda não tem uma descrição."}
                  </p>
                </section>
                {isOwner && (
                  <section className="side-card">
                    <CommunityPhotoUpload
                      id={current.id}
                      photo={current.photo}
                      onUploaded={handleUploaded}
                    />
                  </section>
                )}
                <section className={`${styles.members} side-card`}>
                  <div className={styles.sectionHeading}>
                    <h2>Membros</h2>
                    {members.data && (
                      <span className={styles.memberCount}>
                        {members.data.length}
                      </span>
                    )}
                  </div>
                  {members.loading ? (
                    <CommunityLoading label="Carregando membros..." />
                  ) : members.error ? (
                    <CommunityErrorState message={members.error} />
                  ) : members.data ? (
                    <CommunityMemberList members={members.data} />
                  ) : null}
                </section>
                <p className={styles.created}>
                  Criada em{" "}
                  {new Date(current.createdAt).toLocaleDateString("pt-BR")}
                  {current.ownerName && (
                    <>
                      {" "}
                      por <strong>{current.ownerName}</strong>
                    </>
                  )}
                </p>
              </aside>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
