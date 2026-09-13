import { Link, useNavigate } from "react-router"
import type { Route } from "./+types/communities-new"
import { Navbar } from "~/components/navbar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { CommunityForm } from "~/components/communities/community-form"
import { useAuth } from "~/lib/auth-context"
import { createCommunity } from "~/lib/api/community"
import { getErrorMessage } from "~/lib/api/client"
import { useState } from "react"

export function meta({}: Route.MetaArgs) {
  return [{ title: "Criar comunidade | newkut" }]
}
export default function NewCommunityPage() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  async function handleSubmit(body: { name: string; description?: string }) {
    setError(null)
    try {
      const community = await createCommunity(body)
      await navigate(`/communities/${community.id}`)
    } catch (err) {
      setError(getErrorMessage(err, "Erro ao criar comunidade."))
    }
  }
  return (
    <div className="min-h-svh">
      <Navbar />
      <main className="shell community-form-page max-w-2xl">
        {authLoading ? (
          <p className="py-12 text-center text-muted-foreground">
            Carregando...
          </p>
        ) : !user ? (
          <div className="empty-state">
            <h2>Entre para criar uma comunidade</h2>
            <p className="mb-4">
              É preciso estar autenticado para criar seu espaço.
            </p>
            <Link to="/login" className="btn primary">
              Entrar
            </Link>
          </div>
        ) : (
          <>
            <div className="page-header">
              <div className="eyebrow">comunidades</div>
              <h1>Criar comunidade</h1>
              <p>Crie um espaço para reunir pessoas com interesses em comum.</p>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Criar comunidade</CardTitle>
                <CardDescription>
                  Dê um nome ao seu novo espaço e conte às pessoas do que ele
                  trata.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CommunityForm
                  submitLabel="Criar comunidade"
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
