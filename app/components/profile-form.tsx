import { useEffect, useRef, useState } from "react"
import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Field, FieldGroup, FieldLabel } from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { TagInput } from "~/components/tag-input"
import { useAuth } from "~/lib/auth-context"
import { getErrorMessage } from "~/lib/api/client"
import { RELATIONSHIP_STATUS_OPTIONS } from "~/lib/relationship-status"
import type { UpdateProfileRequest } from "~/lib/api/types"

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

function todayLocalISO(): string {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, "0")
  const dd = String(now.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

export function ProfileForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user, loading, updateProfile, uploadPhoto, deleteAccount } = useAuth()

  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [message, setMessage] = useState<{
    type: "success" | "error"
    text: string
  } | null>(null)

  const [name, setName] = useState(user?.name ?? "")
  const [username, setUsername] = useState(user?.username ?? "")
  const [bio, setBio] = useState(user?.bio ?? "")
  const [birthDate, setBirthDate] = useState(user?.birthDate ?? "")
  const [city, setCity] = useState(user?.city ?? "")
  const [state, setState] = useState(user?.state ?? "")
  const [relationshipStatus, setRelationshipStatus] = useState(
    user?.relationshipStatus ?? ""
  )
  const [musicInterests, setMusicInterests] = useState<string[]>(
    user?.musicInterests ?? []
  )
  const [movieInterests, setMovieInterests] = useState<string[]>(
    user?.movieInterests ?? []
  )
  const [bookInterests, setBookInterests] = useState<string[]>(
    user?.bookInterests ?? []
  )
  const [hobbies, setHobbies] = useState<string[]>(user?.hobbies ?? [])

  useEffect(() => {
    setName(user?.name ?? "")
    setUsername(user?.username ?? "")
    setBio(user?.bio ?? "")
    setBirthDate(user?.birthDate ?? "")
    setCity(user?.city ?? "")
    setState(user?.state ?? "")
    setRelationshipStatus(user?.relationshipStatus ?? "")
    setMusicInterests(user?.musicInterests ?? [])
    setMovieInterests(user?.movieInterests ?? [])
    setBookInterests(user?.bookInterests ?? [])
    setHobbies(user?.hobbies ?? [])
  }, [user])

  function handleAvatarClick() {
    fileInputRef.current?.click()
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setPreview(URL.createObjectURL(file))
    setMessage(null)
    setUploading(true)

    try {
      await uploadPhoto(file)
      setPreview(null)
      setMessage({ type: "success", text: "Foto atualizada com sucesso." })
    } catch (err) {
      setPreview(null)
      setMessage({
        type: "error",
        text: getErrorMessage(err, "Erro ao enviar foto. Tente novamente."),
      })
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    setSaving(true)

    try {
      const body: UpdateProfileRequest = {
        name,
        username,
        bio: bio || null,
        birthDate: birthDate || null,
        city: city || null,
        state: state || null,
        relationshipStatus: relationshipStatus || null,
        musicInterests,
        movieInterests,
        bookInterests,
        hobbies,
      }
      await updateProfile(body)
      setMessage({ type: "success", text: "Perfil atualizado com sucesso." })
    } catch (err) {
      setMessage({
        type: "error",
        text: getErrorMessage(err, "Erro ao salvar perfil. Tente novamente."),
      })
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteAccount() {
    if (
      !confirm(
        "Tem certeza que deseja desativar sua conta? Esta ação não pode ser desfeita."
      )
    )
      return

    setMessage(null)
    setDeleting(true)

    try {
      await deleteAccount()
      window.location.href = "/"
    } catch (err) {
      setMessage({
        type: "error",
        text: getErrorMessage(err, "Erro ao desativar conta. Tente novamente."),
      })
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
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

  const avatarSrc = preview ?? user.profilePicture ?? undefined

  return (
    <div className={className} {...props}>
      <div className="mx-auto max-w-2xl space-y-6 p-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <div className="relative">
            <button
              type="button"
              onClick={handleAvatarClick}
              disabled={uploading}
              className="group relative cursor-pointer rounded-full disabled:cursor-wait"
            >
              <Avatar className="size-24">
                {avatarSrc ? (
                  <AvatarImage src={avatarSrc} alt={user.name ?? ""} />
                ) : (
                  <AvatarFallback className="text-2xl">
                    {user.name ? getInitials(user.name) : "U"}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <title>Alterar foto</title>
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </div>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            {uploading && (
              <p className="mt-2 text-center text-xs text-muted-foreground">
                Enviando...
              </p>
            )}
          </div>

          <div>
            <h1 className="font-display text-2xl tracking-tight">
              {user.name}
            </h1>
            <p className="text-muted-foreground">@{user.username}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
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

        <Card>
          <CardHeader>
            <CardTitle>Editar perfil</CardTitle>
            <CardDescription>
              Atualize suas informações de perfil
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="name">Nome</FieldLabel>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="username">Nome de usuário</FieldLabel>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="bio">Bio</FieldLabel>
                  <Input
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Conte um pouco sobre você..."
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="birthDate">
                    Data de nascimento
                  </FieldLabel>
                  <Input
                    id="birthDate"
                    type="date"
                    value={birthDate}
                    max={todayLocalISO()}
                    onChange={(e) => setBirthDate(e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="city">Cidade</FieldLabel>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Sua cidade"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="state">Estado</FieldLabel>
                  <Input
                    id="state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Seu estado"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="relationshipStatus">
                    Status de relacionamento
                  </FieldLabel>
                  <select
                    id="relationshipStatus"
                    value={relationshipStatus}
                    onChange={(e) => setRelationshipStatus(e.target.value)}
                    className="h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-2.5 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30"
                  >
                    <option value="">Não informado</option>
                    {RELATIONSHIP_STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="musicInterests">Música</FieldLabel>
                  <TagInput
                    id="musicInterests"
                    value={musicInterests}
                    onChange={setMusicInterests}
                    placeholder="Digite e pressione Enter para adicionar..."
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="movieInterests">Filmes</FieldLabel>
                  <TagInput
                    id="movieInterests"
                    value={movieInterests}
                    onChange={setMovieInterests}
                    placeholder="Digite e pressione Enter para adicionar..."
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="bookInterests">Livros</FieldLabel>
                  <TagInput
                    id="bookInterests"
                    value={bookInterests}
                    onChange={setBookInterests}
                    placeholder="Digite e pressione Enter para adicionar..."
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="hobbies">Hobbies</FieldLabel>
                  <TagInput
                    id="hobbies"
                    value={hobbies}
                    onChange={setHobbies}
                    placeholder="Digite e pressione Enter para adicionar..."
                  />
                </Field>
                <Field>
                  <Button type="submit" disabled={saving}>
                    {saving ? "Salvando..." : "Salvar alterações"}
                  </Button>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>

        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="text-destructive">Desativar conta</CardTitle>
            <CardDescription>
              Ao desativar sua conta, ela ficará indisponível e você não poderá
              mais acessá-la. Esta ação é irreversível.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleting}
            >
              {deleting ? "Desativando..." : "Desativar minha conta"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
