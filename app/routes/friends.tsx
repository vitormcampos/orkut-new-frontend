import { useState } from "react"
import { useSearchParams } from "react-router"
import type { Route } from "./+types/friends"
import { Navbar } from "~/components/navbar"
import { FriendCard } from "~/components/friend-card"
import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { useAuth } from "~/lib/auth-context"
import { getErrorMessage } from "~/lib/api/client"
import { useAsyncData } from "~/lib/use-async-data"
import { getFriendDisplay } from "~/lib/friendship-utils"
import { ApiError } from "~/lib/api/client"
import {
  acceptFriendRequest,
  getFriends,
  getPendingRequests,
  getSentRequests,
  rejectFriendRequest,
  removeFriendship,
  sendFriendRequest,
} from "~/lib/api/friendship"
import type { FriendshipDto } from "~/lib/api/types"

export function meta({}: Route.MetaArgs) {
  return [{ title: "Amigos | newkut" }]
}

type Tab = "amigos" | "pending" | "sent" | "add"

export default function FriendsPage() {
  const { user, loading: authLoading } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = (searchParams.get("tab") as Tab) || "amigos"

  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [message, setMessage] = useState<{
    type: "success" | "error"
    text: string
  } | null>(null)

  const friends = useAsyncData(() => getFriends())
  const pending = useAsyncData(() => getPendingRequests())
  const sent = useAsyncData(() => getSentRequests())

  function setTab(t: Tab) {
    setSearchParams({ tab: t }, { replace: true })
  }

  async function handleAction(
    id: string,
    action: (id: string) => Promise<unknown>,
    successMessage: string
  ) {
    setActionLoading(id)
    setMessage(null)
    try {
      await action(id)
      setMessage({ type: "success", text: successMessage })
      friends.refresh()
      pending.refresh()
      sent.refresh()
    } catch (err) {
      setMessage({
        type: "error",
        text: getErrorMessage(err, "Erro. Tente novamente."),
      })
    } finally {
      setActionLoading(null)
    }
  }

  if (authLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-muted-foreground">
          Você precisa estar autenticado para acessar esta página.
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-svh">
      <Navbar />

      <main className="shell friends-page">
        <div className="page-header">
          <div>
            <div className="eyebrow">conexões</div>
            <h1>Amigos</h1>
            <p>Gerencie suas amizades e solicitações.</p>
          </div>
        </div>

        {message && (
          <div
            className={`rounded-md border px-4 py-3 text-sm ${
              message.type === "success"
                ? "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200"
                : "border-destructive/30 bg-destructive/10 text-destructive"
            }`}
          >
            {message.text}
          </div>
        )}

        <div
          className="profile-nav friends-tabs"
          role="tablist"
          aria-label="Seções de amizades"
        >
          {(
            [
              { key: "amigos", label: "Amigos" },
              { key: "pending", label: "Pendentes" },
              { key: "sent", label: "Enviadas" },
              { key: "add", label: "Adicionar" },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`tab ${tab === t.key ? "active" : ""}`}
            >
              {t.label}
              {t.key === "pending" &&
                pending.data &&
                pending.data.length > 0 && (
                  <span className="ml-1.5 inline-flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                    {pending.data.length}
                  </span>
                )}
            </button>
          ))}
        </div>

        {tab === "amigos" && (
          <FriendsTab
            loading={friends.loading}
            error={friends.error}
            items={friends.data}
            currentUserId={user.id}
            actionLoading={actionLoading}
            onRemove={(id) =>
              handleAction(id, removeFriendship, "Amizade removida.")
            }
            emptyMessage="Você ainda não tem amigos."
          />
        )}

        {tab === "pending" && (
          <PendingTab
            loading={pending.loading}
            error={pending.error}
            items={pending.data}
            actionLoading={actionLoading}
            onAccept={(id) =>
              handleAction(id, acceptFriendRequest, "Solicitação aceita!")
            }
            onReject={(id) =>
              handleAction(id, rejectFriendRequest, "Solicitação recusada.")
            }
          />
        )}

        {tab === "sent" && (
          <SentTab
            loading={sent.loading}
            error={sent.error}
            items={sent.data}
            emptyMessage="Nenhuma solicitação enviada."
          />
        )}

        {tab === "add" && (
          <AddFriendTab
            onSuccess={() => {
              setMessage({
                type: "success",
                text: "Solicitação enviada com sucesso!",
              })
              sent.refresh()
            }}
            onError={(text) => setMessage({ type: "error", text })}
          />
        )}
      </main>
    </div>
  )
}

function FriendsTab({
  loading,
  error,
  items,
  actionLoading,
  currentUserId,
  onRemove,
  emptyMessage,
}: {
  loading: boolean
  error: string | null
  items: FriendshipDto[] | null
  actionLoading: string | null
  currentUserId: string
  onRemove: (id: string) => void
  emptyMessage: string
}) {
  if (loading) return <LoadingMessage />
  if (error) return <ErrorMessage message={error} />
  if (!items || items.length === 0)
    return <EmptyMessage message={emptyMessage} />

  return (
    <div className="space-y-3">
      {items.map((f) => {
        const { name: friendName, username: friendUsername } = getFriendDisplay(
          f,
          currentUserId
        )

        return (
          <FriendCard
            key={f.id}
            name={friendName}
            username={friendUsername}
            href={friendUsername ? `/u/${friendUsername}` : undefined}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRemove(f.id)}
              disabled={actionLoading === f.id}
            >
              {actionLoading === f.id ? "..." : "Remover"}
            </Button>
          </FriendCard>
        )
      })}
    </div>
  )
}

function PendingTab({
  loading,
  error,
  items,
  actionLoading,
  onAccept,
  onReject,
}: {
  loading: boolean
  error: string | null
  items: FriendshipDto[] | null
  actionLoading: string | null
  onAccept: (id: string) => void
  onReject: (id: string) => void
}) {
  if (loading) return <LoadingMessage />
  if (error) return <ErrorMessage message={error} />
  if (!items || items.length === 0)
    return <EmptyMessage message="Nenhuma solicitação pendente." />

  return (
    <div className="space-y-3">
      {items.map((f) => (
        <FriendCard
          key={f.id}
          name={f.requesterName ?? "Usuário"}
          username={f.requesterUsername}
          badge="Pendente"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => onReject(f.id)}
            disabled={actionLoading === f.id}
          >
            Recusar
          </Button>
          <Button
            size="sm"
            onClick={() => onAccept(f.id)}
            disabled={actionLoading === f.id}
          >
            Aceitar
          </Button>
        </FriendCard>
      ))}
    </div>
  )
}

function SentTab({
  loading,
  error,
  items,
  emptyMessage,
}: {
  loading: boolean
  error: string | null
  items: FriendshipDto[] | null
  emptyMessage: string
}) {
  if (loading) return <LoadingMessage />
  if (error) return <ErrorMessage message={error} />
  if (!items || items.length === 0)
    return <EmptyMessage message={emptyMessage} />

  return (
    <div className="space-y-3">
      {items.map((f) => (
        <FriendCard
          key={f.id}
          name={f.addresseeName ?? "Usuário"}
          username={f.addresseeUsername}
          badge="Enviada"
        />
      ))}
    </div>
  )
}

function AddFriendTab({
  onSuccess,
  onError,
}: {
  onSuccess: () => void
  onError: (text: string) => void
}) {
  const [username, setUsername] = useState("")
  const [sending, setSending] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!username.trim()) return

    setSending(true)
    try {
      await sendFriendRequest({ addresseeUsername: username.trim() })
      setUsername("")
      onSuccess()
    } catch (err) {
      onError(getErrorMessage(err, "Erro ao enviar solicitação."))
    } finally {
      setSending(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Adicionar amigo</CardTitle>
        <CardDescription>
          Envie uma solicitação de amizade informando o nome de usuário.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="username">Nome de usuário</FieldLabel>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="@usuario"
                required
              />
            </Field>
            <Button type="submit" disabled={sending}>
              {sending ? "Enviando..." : "Enviar solicitação"}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}

function LoadingMessage() {
  return (
    <div className="py-12 text-center">
      <p className="text-muted-foreground">Carregando...</p>
    </div>
  )
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
      {message}
    </div>
  )
}

function EmptyMessage({ message }: { message: string }) {
  return (
    <div className="py-12 text-center">
      <p className="text-muted-foreground">{message}</p>
    </div>
  )
}
