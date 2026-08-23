import { Link } from "react-router"
import type { Route } from "./+types/communities"
import { Navbar } from "~/components/navbar"
import { CommunityEmptyState } from "~/components/communities/community-empty-state"
import { useAuth } from "~/lib/auth-context"

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Comunidades | newkut" },
    { name: "description", content: "Encontre e crie comunidades no newkut." },
  ]
}
export default function CommunitiesPage() {
  const { user, loading } = useAuth()
  return (
    <div className="min-h-svh">
      <Navbar />
      <main className="shell">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="eyebrow">conexões</div>
            <h1>Comunidades</h1>
            <p className="mt-2 text-muted-foreground">
              Encontre pessoas que compartilham seus interesses.
            </p>
          </div>
          {!loading &&
            (user ? (
              <Link to="/communities/new" className="btn primary">
                Criar comunidade
              </Link>
            ) : (
              <Link to="/login" className="btn primary">
                Entrar para criar
              </Link>
            ))}
        </div>
        <CommunityEmptyState
          title="A listagem chega em breve"
          description="Você já pode criar comunidades e compartilhar seus espaços. A busca e a listagem global estarão disponíveis em breve."
        />
      </main>
    </div>
  )
}
