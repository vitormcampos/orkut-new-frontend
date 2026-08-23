import { useEffect, useState } from "react"
import { useParams } from "react-router"
import type { Route } from "./+types/profile"
import { Navbar } from "~/components/navbar"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { ApiError } from "~/lib/api/client"
import { getPublicProfile } from "~/lib/api/profile"
import { relationshipStatusLabel } from "~/lib/relationship-status"
import type { PublicProfileDto } from "~/lib/api/types"

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

export default function ProfilePage() {
  const { username } = useParams()
  const [profile, setProfile] = useState<PublicProfileDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!username) return

    let cancelled = false
    setLoading(true)
    setError(null)
    setNotFound(false)

    getPublicProfile(username)
      .then((data) => {
        if (!cancelled) setProfile(data)
      })
      .catch((err) => {
        if (cancelled) return
        if (err instanceof ApiError && err.status === 404) {
          setNotFound(true)
        } else if (err instanceof ApiError && err.status === 401) {
          setError("Você precisa estar autenticado para ver este perfil.")
        } else {
          setError(
            err instanceof ApiError ? err.message : "Erro ao carregar perfil."
          )
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [username])

  useEffect(() => {
    if (profile?.name) {
      document.title = `${profile.name} | newkut`
    }
  }, [profile])

  const interests: Array<{ label: string; items: string[] }> = [
    { label: "Música", items: profile?.musicInterests ?? [] },
    { label: "Filmes", items: profile?.movieInterests ?? [] },
    { label: "Livros", items: profile?.bookInterests ?? [] },
    { label: "Hobbies", items: profile?.hobbies ?? [] },
  ].filter((section) => section.items.length > 0)

  const age = profile?.age ?? null
  const relationship = relationshipStatusLabel(profile?.relationshipStatus)

  return (
    <div className="min-h-svh">
      <Navbar />

      <div className="mx-auto max-w-2xl space-y-6 p-6">
        {loading ? (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        ) : notFound ? (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            Usuário não encontrado.
          </div>
        ) : error ? (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : profile ? (
          <>
            <Card>
              <CardHeader>
                <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
                  <Avatar className="size-24">
                    {profile.profilePicture ? (
                      <AvatarImage
                        src={profile.profilePicture}
                        alt={profile.name}
                      />
                    ) : (
                      <AvatarFallback className="text-2xl">
                        {getInitials(profile.name)}
                      </AvatarFallback>
                    )}
                  </Avatar>

                  <div className="text-center sm:text-left">
                    <CardTitle className="text-2xl">{profile.name}</CardTitle>
                    <p className="text-muted-foreground">@{profile.username}</p>
                    {profile.bio && (
                      <p className="mt-2 text-sm text-foreground">
                        {profile.bio}
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sobre</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2 text-sm">
                  {(profile.city || profile.state) && (
                    <div className="flex gap-2">
                      <dt className="text-muted-foreground">Localização:</dt>
                      <dd>
                        {[profile.city, profile.state]
                          .filter(Boolean)
                          .join(", ")}
                      </dd>
                    </div>
                  )}
                  {age != null && (
                    <div className="flex gap-2">
                      <dt className="text-muted-foreground">Idade:</dt>
                      <dd>{age} anos</dd>
                    </div>
                  )}
                  {relationship && (
                    <div className="flex gap-2">
                      <dt className="text-muted-foreground">Relacionamento:</dt>
                      <dd>{relationship}</dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>

            {interests.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Interesses</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {interests.map((section) => (
                    <div key={section.label}>
                      <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                        {section.label}
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {section.items.map((item) => (
                          <span
                            key={item}
                            className="rounded-full bg-muted px-2 py-0.5 text-sm"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Resumo social</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  <span className="font-medium">{profile.friendCount}</span>{" "}
                  {profile.friendCount === 1 ? "amigo" : "amigos"}
                </p>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>
    </div>
  )
}
