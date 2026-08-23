import { Link } from "react-router"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import type { CommunityDto } from "~/lib/api/types"

export function CommunityCard({ community }: { community: CommunityDto }) {
  return (
    <Link
      to={`/communities/${community.id}`}
      className="block rounded-xl border bg-card p-4 transition-colors hover:border-primary/50"
    >
      <div className="flex items-center gap-3">
        <Avatar size="lg">
          <AvatarImage src={community.photo ?? undefined} alt="" />
          <AvatarFallback>
            {community.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-semibold">{community.name}</h2>
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
