import type { ReactNode } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

interface FriendCardProps {
  name: string
  username?: string | null
  profilePicture?: string | null
  badge?: string
  children?: ReactNode
}

export function FriendCard({
  name,
  username,
  profilePicture,
  badge,
  children,
}: FriendCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-lg border p-4">
      <Avatar className="size-12 shrink-0">
        {profilePicture ? (
          <AvatarImage src={profilePicture} alt={name} />
        ) : (
          <AvatarFallback>{getInitials(name)}</AvatarFallback>
        )}
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium">{name}</span>
          {badge && (
            <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {badge}
            </span>
          )}
        </div>
        {username && (
          <p className="truncate text-sm text-muted-foreground">
            @{username}
          </p>
        )}
      </div>

      {children && (
        <div className="flex shrink-0 items-center gap-2">{children}</div>
      )}
    </div>
  )
}
