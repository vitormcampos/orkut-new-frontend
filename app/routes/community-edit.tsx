import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router"
import type { Route } from "./+types/community-edit"
import { Navbar } from "~/components/navbar"
import { CommunityEmptyState } from "~/components/communities/community-empty-state"
import { CommunityErrorState } from "~/components/communities/community-error-state"
import { CommunityForm } from "~/components/communities/community-form"
import { CommunityLoading } from "~/components/communities/community-loading"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { useAuth } from "~/lib/auth-context"
import { ApiError, getErrorMessage } from "~/lib/api/client"
import { getCommunity, updateCommunity } from "~/lib/api/community"
import { useAsyncData } from "~/lib/use-async-data"

export function meta({}: Route.MetaArgs) {
  return [{ title: "Editar comunidade | newkut" }]
}
export default function CommunityEditPage() {
  const { id } = useParams()
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const result = useAsyncData(
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
  const community = result.data
  const owner = !!user && !!community && user.id === community.ownerId
  async function handleSubmit(body: { name: string; description?: string }) {
    if (!id) return
    setError(null)
    try {
      await updateCommunity(id, body)
      await navigate(`/communities/${id}`)
    } catch (err) {
      setError(getErrorMessage(err, "Erro ao atualizar comunidade."))
    }
  }
  return (
    <div className="min-h-svh">
      <Navbar />
      <main className="shell community-form-page max-w-2xl">
        {authLoading || result.loading ? (
          <CommunityLoading />
        ) : result.notFound ? (
          <CommunityEmptyState
            title="Comunidade não encontrada"
            description="Este espaço não existe ou foi removido."
          />
        ) : result.error || !community ? (
          <CommunityErrorState
            message={result.error ?? "Não foi possível carregar a comunidade."}
          />
        ) : !owner ? (
          <div className="empty-state">
            <h2>Sem permissão</h2>
            <p className="mb-4">Apenas o dono pode editar esta comunidade.</p>
            <Link to={`/communities/${id}`} className="btn">
              Voltar para a comunidade
            </Link>
          </div>
        ) : (
          <>
            <div className="page-header">
              <div className="eyebrow">comunidades</div>
              <h1>Editar comunidade</h1>
              <p>Atualize as informações e a identidade do seu espaço.</p>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Editar comunidade</CardTitle>
              </CardHeader>
              <CardContent>
                <CommunityForm
                  initial={community}
                  submitLabel="Salvar alterações"
                  onSubmit={handleSubmit}
                  error={error}
                />
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  )
}
