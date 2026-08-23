import { useState } from "react"
import { useNavigate, useParams } from "react-router"
import type { Route } from "./+types/community-detail"
import { Navbar } from "~/components/navbar"
import { CommunityActions } from "~/components/communities/community-actions"
import { CommunityEmptyState } from "~/components/communities/community-empty-state"
import { CommunityErrorState } from "~/components/communities/community-error-state"
import { CommunityHeader } from "~/components/communities/community-header"
import { CommunityLoading } from "~/components/communities/community-loading"
import { CommunityMemberList } from "~/components/communities/community-member-list"
import { CommunityPhotoUpload } from "~/components/communities/community-photo-upload"
import { Separator } from "~/components/ui/separator"
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
      <main className="shell">
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
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
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
            <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_280px]">
              <section className="side-card">
                <h2>Sobre a comunidade</h2>
                <p className="mt-3 whitespace-pre-wrap text-muted-foreground">
                  {current.description ||
                    "Esta comunidade ainda não tem uma descrição."}
                </p>
                <Separator className="my-6" />
                <h2>Membros</h2>
                <div className="mt-4">
                  {members.loading ? (
                    <CommunityLoading label="Carregando membros..." />
                  ) : members.error ? (
                    <CommunityErrorState message={members.error} />
                  ) : members.data ? (
                    <CommunityMemberList members={members.data} />
                  ) : null}
                </div>
              </section>
              <aside className="space-y-4">
                {isOwner && (
                  <div className="side-card">
                    <CommunityPhotoUpload
                      id={current.id}
                      photo={current.photo}
                      onUploaded={handleUploaded}
                    />
                  </div>
                )}
                <div className="side-card">
                  <p className="text-sm text-muted-foreground">
                    Criada em{" "}
                    {new Date(current.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                  {current.ownerName && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Por{" "}
                      <strong className="text-foreground">
                        {current.ownerName}
                      </strong>
                    </p>
                  )}
                </div>
              </aside>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
