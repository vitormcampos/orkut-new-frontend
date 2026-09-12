import { useState } from "react"
import { Navbar } from "~/components/navbar"
import { SearchResults } from "~/components/search/search-results"
import { searchCommunities, searchUsers } from "~/lib/api/search"
import { getErrorMessage } from "~/lib/api/client"
import { useAsyncData } from "~/lib/use-async-data"
import { useAuth } from "~/lib/auth-context"
import { useSearchParams } from "react-router"
import type { Route } from "./+types/search"

const MIN_TERM_LENGTH = 2
const MAX_TERM_LENGTH = 100

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Busca | newkut" },
    {
      name: "description",
      content: "Encontre pessoas e comunidades no newkut.",
    },
  ]
}

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const { user, loading: authLoading } = useAuth()
  const term = searchParams.get("term")?.trim() ?? ""
  const validTerm =
    term.length >= MIN_TERM_LENGTH && term.length <= MAX_TERM_LENGTH
  const [loadingMore, setLoadingMore] = useState<"users" | "communities" | null>(null)
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null)

  const emptyPage = {
    items: [],
    page: 1,
    pageSize: 10,
    totalItems: 0,
    hasNextPage: false,
  }

  const users = useAsyncData(
    () => (user && validTerm ? searchUsers(term) : Promise.resolve(emptyPage)),
    [term, validTerm, user],
    {
      resetOnFetch: true,
      fallbackError: "Não foi possível buscar pessoas.",
      mapError: (error) => ({
        message: getErrorMessage(error, "Não foi possível buscar pessoas."),
      }),
    }
  )
  const communities = useAsyncData(
    () => (user && validTerm ? searchCommunities(term) : Promise.resolve(emptyPage)),
    [term, validTerm, user],
    {
      resetOnFetch: true,
      fallbackError: "Não foi possível buscar comunidades.",
      mapError: (error) => ({
        message: getErrorMessage(error, "Não foi possível buscar comunidades."),
      }),
    }
  )

  async function loadMore(kind: "users" | "communities") {
    const current = kind === "users" ? users.data : communities.data
    if (!current?.hasNextPage || loadingMore) return

    setLoadingMore(kind)
    setLoadMoreError(null)
    try {
      if (kind === "users") {
        const nextPage = await searchUsers(
          term,
          current.page + 1,
          current.pageSize
        )
        users.setData((previous) =>
          previous
            ? {
                ...nextPage,
                items: [
                  ...previous.items,
                  ...nextPage.items.filter(
                    (item) => !previous.items.some((old) => old.id === item.id)
                  ),
                ],
              }
            : nextPage
        )
      } else {
        const nextPage = await searchCommunities(
          term,
          current.page + 1,
          current.pageSize
        )
        communities.setData((previous) =>
          previous
            ? {
                ...nextPage,
                items: [
                  ...previous.items,
                  ...nextPage.items.filter(
                    (item) => !previous.items.some((old) => old.id === item.id)
                  ),
                ],
              }
            : nextPage
        )
      }
    } catch (error) {
      setLoadMoreError(
        getErrorMessage(error, "Não foi possível carregar mais resultados.")
      )
    } finally {
      setLoadingMore(null)
    }
  }

  return (
    <div className="min-h-svh">
      <Navbar />
      <main className="shell">
        {authLoading ? (
          <div className="rounded-xl border border-dashed p-8 text-center">
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        ) : !user ? (
          <div className="rounded-xl border border-dashed p-8 text-center">
            <h1>Entre para buscar</h1>
            <p className="mt-2 text-muted-foreground">
              Faça login para encontrar pessoas e comunidades.
            </p>
          </div>
        ) : !term ? (
          <div className="rounded-xl border border-dashed p-8 text-center">
            <h1>Busca</h1>
            <p className="mt-2 text-muted-foreground">
              Digite um termo para encontrar pessoas ou comunidades.
            </p>
          </div>
        ) : !validTerm ? (
          <div className="rounded-xl border border-dashed p-8 text-center">
            <h1>Termo inválido</h1>
            <p className="mt-2 text-muted-foreground">
              Informe um termo com pelo menos 2 e no máximo 100 caracteres.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <div className="eyebrow">explorar</div>
              <h1>Resultados para “{term}”</h1>
              <p className="mt-2 text-muted-foreground">
                Encontre novas conexões no newkut.
              </p>
            </div>
            <SearchResults
              users={users.data?.items ?? []}
              communities={communities.data?.items ?? []}
              usersLoading={users.loading}
              communitiesLoading={communities.loading}
              usersError={users.error}
              communitiesError={communities.error}
              usersHasNextPage={users.data?.hasNextPage ?? false}
              communitiesHasNextPage={communities.data?.hasNextPage ?? false}
              loadingMore={loadingMore}
              loadMoreError={loadMoreError}
              onLoadMore={loadMore}
            />
          </>
        )}
      </main>
    </div>
  )
}
