import { Link } from "react-router"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import type { UserSearchResultDto } from "~/lib/api/types"

export function SearchUserCard({ user }: { user: UserSearchResultDto }) {
  return (
    <Link
      to={`/u/${encodeURIComponent(user.username)}`}
      className="search-card group flex items-center gap-3 rounded-xl border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-card focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      <Avatar size="lg">
        <AvatarImage src={user.profilePicture ?? undefined} alt="" />
        <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <h2 className="truncate font-semibold">{user.name}</h2>
        <p className="truncate text-sm text-muted-foreground">
          @{user.username}
        </p>
      </div>
    </Link>
  )
}
