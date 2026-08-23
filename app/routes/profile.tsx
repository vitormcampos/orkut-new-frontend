import { useEffect, useState } from "react"
import { Link, useParams } from "react-router"
import type { Route } from "./+types/profile"
import { Navbar } from "~/components/navbar"
import { useAuth } from "~/lib/auth-context"
import { ApiError, getErrorMessage } from "~/lib/api/client"
import { useAsyncData } from "~/lib/use-async-data"
import { getPublicProfile } from "~/lib/api/profile"
import {
  acceptFriendRequest,
  getFriends,
  getFriendsInCommon,
  getPendingRequests,
  getSentRequests,
  rejectFriendRequest,
  removeFriendship,
  sendFriendRequest,
} from "~/lib/api/friendship"
import { relationshipStatusLabel } from "~/lib/relationship-status"
import type {
  FriendshipDto,
  UserSummaryDto,
} from "~/lib/api/types"

export function meta({}: Route.MetaArgs) {
  return [{ title: "Perfil | newkut" }]
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

function memberSince(createdAt: string | undefined): string {
  if (!createdAt) return ""
  const year = new Date(createdAt).getFullYear()
  return Number.isNaN(year) ? "" : String(year)
}

function firstName(name: string): string {
  return name.split(" ")[0]
}

type TabKey = "publicacoes" | "sobre" | "comunidades" | "conexoes"

type FriendState =
  | { kind: "none" }
  | { kind: "sent"; id: string }
  | { kind: "received"; id: string }
  | { kind: "friends"; id: string }

function deriveFriendState(
  friends: FriendshipDto[],
  pending: FriendshipDto[],
  sent: FriendshipDto[],
  profileId: string
): FriendState {
  const accepted = friends.find(
    (f) => f.requesterId === profileId || f.addresseeId === profileId
  )
  if (accepted) return { kind: "friends", id: accepted.id }

  const received = pending.find((f) => f.requesterId === profileId)
  if (received) return { kind: "received", id: received.id }

  const sentRequest = sent.find((f) => f.addresseeId === profileId)
  if (sentRequest) return { kind: "sent", id: sentRequest.id }

  return { kind: "none" }
}

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, oklch(70% .1 185), oklch(50% .1 220))",
  "linear-gradient(135deg, oklch(76% .11 80), oklch(58% .12 45))",
  "linear-gradient(135deg, oklch(70% .1 300), oklch(50% .12 280))",
  "linear-gradient(135deg, oklch(72% .1 150), oklch(52% .12 180))",
  "linear-gradient(135deg, oklch(76% .11 28), oklch(59% .13 349))",
]

function MiniAvatar({ name, picture }: { name: string; picture?: string | null }) {
  const idx = (name.length ?? 0) % AVATAR_GRADIENTS.length
  if (picture) {
    return (
      <span className="mini-avatar">
        <img src={picture} alt={name} />
      </span>
    )
  }
  return (
    <span className="mini-avatar" style={{ background: AVATAR_GRADIENTS[idx] }}>
      {getInitials(name) || "?"}
    </span>
  )
}

export default function ProfilePage() {
  const { username } = useParams()
  const { user: me, loading: authLoading } = useAuth()

  const {
    data: profile,
    setData: setProfile,
    loading,
    error,
    notFound,
  } = useAsyncData(
    async () => {
      if (!username) throw new Error("Username ausente")
      return getPublicProfile(username)
    },
    [username],
    {
      resetOnFetch: true,
      fallbackError: "Erro ao carregar perfil.",
      mapError: (err) => {
        if (err instanceof ApiError && err.status === 404) {
          return { message: "Usuário não encontrado.", notFound: true }
        }
        if (err instanceof ApiError && err.status === 401) {
          return {
            message: "Você precisa estar autenticado para ver este perfil.",
          }
        }
        return null
      },
    }
  )

  const [tab, setTab] = useState<TabKey>("sobre")
  const [friendState, setFriendState] = useState<FriendState | null>(null)
  const [commonFriends, setCommonFriends] = useState<UserSummaryDto[]>([])
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const isSelf = !!me && !!profile && me.id === profile.id

  useEffect(() => {
    setFriendState(null)
    setCommonFriends([])
  }, [username])

  useEffect(() => {
    if (profile?.name) {
      document.title = `${profile.name} | newkut`
    }
  }, [profile])

  useEffect(() => {
    if (!profile || !me || me.id === profile.id) return

    const profileId = profile.id
    let cancelled = false

    async function load() {
      try {
        const [friends, pending, sent] = await Promise.all([
          getFriends(),
          getPendingRequests(),
          getSentRequests(),
        ])
        if (!cancelled) setFriendState(deriveFriendState(friends, pending, sent, profileId))
      } catch {
        if (!cancelled) setFriendState(null)
      }

      try {
        const common = await getFriendsInCommon(profileId)
        if (!cancelled) setCommonFriends(common)
      } catch {
        if (!cancelled) setCommonFriends([])
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [profile, me])

  async function handleFriendAction(action: "send" | "accept" | "reject" | "remove", id?: string) {
    if (!profile) return
    setActionLoading(true)
    setActionError(null)
    try {
      if (action === "send") {
        await sendFriendRequest({ addresseeUsername: profile.username })
      } else if (action === "accept" && id) {
        await acceptFriendRequest(id)
      } else if (action === "reject" && id) {
        await rejectFriendRequest(id)
      } else if (action === "remove" && id) {
        await removeFriendship(id)
      }

      // Atualização otimista da contagem de amigos (aceitar +1 / remover -1).
      if (action === "accept") {
        setProfile((p) => (p ? { ...p, friendCount: p.friendCount + 1 } : p))
      } else if (action === "remove") {
        setProfile((p) =>
          p ? { ...p, friendCount: Math.max(0, p.friendCount - 1) } : p
        )
      }

      const [friends, pending, sent] = await Promise.all([
        getFriends(),
        getPendingRequests(),
        getSentRequests(),
      ])
      setFriendState(deriveFriendState(friends, pending, sent, profile.id))

      const common = await getFriendsInCommon(profile.id).catch(() => [])
      setCommonFriends(common)
    } catch (err) {
      setActionError(getErrorMessage(err, "Erro. Tente novamente."))
    } finally {
      setActionLoading(false)
    }
  }

  const interests: Array<{ label: string; items: string[] }> = [
    { label: "Música", items: profile?.musicInterests ?? [] },
    { label: "Filmes", items: profile?.movieInterests ?? [] },
    { label: "Livros", items: profile?.bookInterests ?? [] },
    { label: "Hobbies", items: profile?.hobbies ?? [] },
  ].filter((section) => section.items.length > 0)

  const relationship = relationshipStatusLabel(profile?.relationshipStatus)

  const tabs: Array<{ key: TabKey; label: string }> = [
    { key: "publicacoes", label: "Publicações" },
    { key: "sobre", label: "Sobre" },
    { key: "comunidades", label: "Comunidades" },
    { key: "conexoes", label: "Conexões" },
  ]

  return (
    <div className="min-h-svh">
      <Navbar />

      <main className="shell">
        {loading || authLoading ? (
          <div className="py-16 text-center">
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        ) : notFound ? (
          <div className="empty-state mt-8">
            <div className="eyebrow">perfil</div>
            <h2>Usuário não encontrado</h2>
            <p>Este perfil não existe ou foi desativado.</p>
          </div>
        ) : error ? (
          <div className="empty-state mt-8">
            <div className="eyebrow">perfil</div>
            <h2>Não foi possível carregar</h2>
            <p>{error}</p>
          </div>
        ) : profile ? (
          <>
            <section className="profile-hero">
              <div className="profile-photo" aria-label={`Avatar de ${profile.name}`}>
                {profile.profilePicture ? (
                  <img src={profile.profilePicture} alt={profile.name} />
                ) : (
                  getInitials(profile.name)
                )}
              </div>

              <div className="profile-intro">
                <div className="eyebrow">
                  {memberSince(profile.createdAt)
                    ? `membro desde ${memberSince(profile.createdAt)}`
                    : "conexão"}
                </div>
                <h1>{profile.name}</h1>
                <div className="handle">
                  @{profile.username}
                  {profile.city || profile.state
                    ? ` · ${[profile.city, profile.state].filter(Boolean).join(", ")}`
                    : ""}
                </div>
                <div className="stats">
                  <div className="stat">
                    <strong>{profile.friendCount}</strong>
                    <span>{profile.friendCount === 1 ? "amigo" : "amigos"}</span>
                  </div>
                </div>
              </div>

              <div className="hero-actions">
                {isSelf ? (
                  <Link to="/me" className="btn primary">
                    Editar perfil
                  </Link>
                ) : friendState?.kind === "none" ? (
                  <button
                    type="button"
                    className="btn primary"
                    onClick={() => handleFriendAction("send")}
                    disabled={actionLoading}
                  >
                    {actionLoading ? "..." : "Adicionar amigo"}
                  </button>
                ) : friendState?.kind === "sent" ? (
                  <button type="button" className="btn" disabled>
                    Pendente
                  </button>
                ) : friendState?.kind === "received" ? (
                  <>
                    <button
                      type="button"
                      className="btn"
                      onClick={() => handleFriendAction("reject", friendState.id)}
                      disabled={actionLoading}
                    >
                      Recusar
                    </button>
                    <button
                      type="button"
                      className="btn primary"
                      onClick={() => handleFriendAction("accept", friendState.id)}
                      disabled={actionLoading}
                    >
                      Aceitar
                    </button>
                  </>
                ) : friendState?.kind === "friends" ? (
                  <>
                    <button type="button" className="btn" disabled>
                      Amigos ✓
                    </button>
                    <button
                      type="button"
                      className="btn danger"
                      onClick={() => handleFriendAction("remove", friendState.id)}
                      disabled={actionLoading}
                    >
                      Remover
                    </button>
                  </>
                ) : null}
              </div>

              {profile.bio && <p className="bio">{profile.bio}</p>}
            </section>

            {actionError && (
              <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {actionError}
              </div>
            )}

            <nav className="profile-nav" aria-label="Seções do perfil">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  className={`tab${tab === t.key ? " active" : ""}`}
                  onClick={() => setTab(t.key)}
                >
                  {t.label}
                </button>
              ))}
            </nav>

            <div className="layout">
              <section className="main-column">
                {tab === "publicacoes" && (
                  <div className="empty-state">
                    <div className="eyebrow">publicações</div>
                    <h2>Em breve</h2>
                    <p>
                      Este espaço vai reunir o que {firstName(profile.name)}{" "}
                      compartilha.
                    </p>
                  </div>
                )}

                {tab === "sobre" &&
                  (interests.length > 0 ? (
                    <div className="space-y-6">
                      {interests.map((section) => (
                        <div key={section.label}>
                          <div className="section-title">{section.label}</div>
                          <div className="flex flex-wrap gap-1.5">
                            {section.items.map((item) => (
                              <span key={item} className="chip">
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <div className="eyebrow">sobre</div>
                      <h2>Nada por aqui ainda</h2>
                      <p>
                        {firstName(profile.name)} ainda não adicionou interesses
                        ao perfil.
                      </p>
                    </div>
                  ))}

                {tab === "comunidades" && (
                  <div className="empty-state">
                    <div className="eyebrow">comunidades</div>
                    <h2>Em breve</h2>
                    <p>
                      As comunidades de {firstName(profile.name)} aparecerão
                      aqui.
                    </p>
                  </div>
                )}

                {tab === "conexoes" && (
                  <div className="empty-state">
                    <div className="eyebrow">conexões</div>
                    <h2>Em breve</h2>
                    <p>
                      {isSelf
                        ? "Gerencie suas conexões na página de amigos."
                        : "Veja os amigos em comum na barra lateral."}
                    </p>
                  </div>
                )}
              </section>

              <aside className="side-stack">
                <section className="side-card">
                  <h2>Sobre {firstName(profile.name)}</h2>
                  <div className="detail-list">
                    {(profile.city || profile.state) && (
                      <div className="detail">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                          <path d="M12 21s7-6.2 7-12A7 7 0 0 0 5 9c0 5.8 7 12 7 12Z" />
                          <circle cx="12" cy="9" r="2.2" />
                        </svg>
                        <span>
                          <strong>
                            {[profile.city, profile.state].filter(Boolean).join(", ")}
                          </strong>
                          <br />
                          Localização
                        </span>
                      </div>
                    )}
                    {profile.age != null && (
                      <div className="detail">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                          <rect x="3" y="5" width="18" height="16" rx="2" />
                          <path d="M8 3v4M16 3v4M3 10h18" />
                        </svg>
                        <span>
                          <strong>{profile.age} anos</strong>
                          <br />
                          Idade
                        </span>
                      </div>
                    )}
                    {relationship && (
                      <div className="detail">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                          <path d="M12 21s-7-4.35-9.5-8.5C.5 8 2 5 5.5 5 8 5 10 7 12 9c2-2 4-4 6.5-4C22 5 23.5 8 21.5 12.5 19 16.65 12 21 12 21Z" />
                        </svg>
                        <span>
                          <strong>{relationship}</strong>
                          <br />
                          Relacionamento
                        </span>
                      </div>
                    )}
                    {!profile.city && !profile.state && profile.age == null && !relationship && (
                      <p className="text-muted-foreground">
                        Nenhuma informação adicional.
                      </p>
                    )}
                  </div>
                </section>

                {!isSelf && (
                  <section className="side-card">
                    <h2>
                      Amigos em comum{" "}
                      <span style={{ color: "var(--muted-foreground)", fontWeight: 400 }}>
                        · {commonFriends.length}
                      </span>
                    </h2>
                    {commonFriends.length > 0 ? (
                      <div className="friend-list">
                        {commonFriends.map((friend) => (
                          <Link
                            key={friend.id}
                            to={`/u/${friend.username}`}
                            className="friend"
                          >
                            <MiniAvatar
                              name={friend.name}
                              picture={friend.profilePicture}
                            />
                            <div className="friend-info">
                              <span className="friend-name">{friend.name}</span>
                              <span className="friend-role">
                                @{friend.username}
                              </span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Nenhum amigo em comum.
                      </p>
                    )}
                  </section>
                )}
              </aside>
            </div>
          </>
        ) : null}
      </main>
    </div>
  )
}
