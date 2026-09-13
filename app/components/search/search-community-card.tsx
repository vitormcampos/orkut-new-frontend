import { Link } from "react-router"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import type { CommunitySearchResultDto } from "~/lib/api/types"

export function SearchCommunityCard({
  community,
}: {
  community: CommunitySearchResultDto
}) {
  return (
    <Link
      to={`/communities/${community.id}`}
      className="search-card group block rounded-xl border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-card focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      <div className="flex items-center gap-3">
        <Avatar size="lg">
          <AvatarImage src={community.photo ?? undefined} alt="" />
          <AvatarFallback>
            {community.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h2 className="truncate font-semibold">{community.name}</h2>
          <p className="text-sm text-muted-foreground">
            {community.memberCount}{" "}
            {community.memberCount === 1 ? "membro" : "membros"}
          </p>
        </div>
      </div>
      {community.description && (
        <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
          {community.description}
        </p>
      )}
    </Link>
  )
}
