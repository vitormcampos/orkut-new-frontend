import { useState } from "react"
import { SearchCommunityCard } from "~/components/search/search-community-card"
import { SearchUserCard } from "~/components/search/search-user-card"
import type {
  CommunitySearchResultDto,
  UserSearchResultDto,
} from "~/lib/api/types"

type SearchTab = "people" | "communities"

interface SearchResultsProps {
  users: UserSearchResultDto[]
  communities: CommunitySearchResultDto[]
  usersLoading: boolean
  communitiesLoading: boolean
  usersError: string | null
  communitiesError: string | null
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
      Nenhum resultado encontrado em {label.toLowerCase()}.
    </div>
  )
}

function LoadingState() {
  return (
    <div
      className="grid gap-3 sm:grid-cols-2"
      aria-label="Carregando resultados"
    >
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="h-20 animate-pulse rounded-xl bg-muted"
          aria-hidden="true"
        />
      ))}
    </div>
  )
}

export function SearchResults(props: SearchResultsProps) {
  const hasPeople = props.users.length > 0
  const hasCommunities = props.communities.length > 0
  const [tab, setTab] = useState<SearchTab>(
    hasPeople ? "people" : "communities"
  )
  const activeTab =
    tab === "people" && !hasPeople
      ? "communities"
      : tab === "communities" && !hasCommunities
        ? "people"
        : tab
  const isPeople = activeTab === "people"
  const loading = isPeople ? props.usersLoading : props.communitiesLoading
  const error = isPeople ? props.usersError : props.communitiesError

  return (
    <section aria-label="Resultados da busca">
      <div className="mb-6 flex gap-1 border-b" role="tablist">
        {hasPeople && (
          <button
            type="button"
            role="tab"
            id="search-tab-people"
            aria-controls="search-panel-people"
            aria-selected={isPeople}
            onClick={() => setTab("people")}
            className="border-b-2 px-4 py-3 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none aria-selected:border-primary aria-selected:text-foreground aria-[selected=false]:border-transparent aria-[selected=false]:text-muted-foreground"
          >
            Pessoas ({props.users.length})
          </button>
        )}
        {hasCommunities && (
          <button
            type="button"
            role="tab"
            id="search-tab-communities"
            aria-controls="search-panel-communities"
            aria-selected={!isPeople}
            onClick={() => setTab("communities")}
            className="border-b-2 px-4 py-3 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none aria-selected:border-primary aria-selected:text-foreground aria-[selected=false]:border-transparent aria-[selected=false]:text-muted-foreground"
          >
            Comunidades ({props.communities.length})
          </button>
        )}
      </div>

      <div
        id={isPeople ? "search-panel-people" : "search-panel-communities"}
        role="tabpanel"
        aria-labelledby={
          isPeople ? "search-tab-people" : "search-tab-communities"
        }
        tabIndex={0}
      >
        {loading ? (
          <LoadingState />
        ) : error ? (
          <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-6 text-sm text-destructive">
            {error}
          </div>
        ) : isPeople ? (
          props.users.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {props.users.map((user) => (
                <SearchUserCard key={user.id} user={user} />
              ))}
            </div>
          ) : (
            <EmptyState label="Pessoas" />
          )
        ) : props.communities.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {props.communities.map((community) => (
              <SearchCommunityCard key={community.id} community={community} />
            ))}
          </div>
        ) : (
          <EmptyState label="Comunidades" />
        )}
      </div>
    </section>
  )
}
