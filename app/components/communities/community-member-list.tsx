import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import type { CommunityMemberDto } from "~/lib/api/types"
import { CommunityEmptyState } from "~/components/communities/community-empty-state"

export function CommunityMemberList({
  members,
}: {
  members: CommunityMemberDto[]
}) {
  if (!members.length)
    return (
      <CommunityEmptyState
        title="Ainda não há membros"
        description="Seja a primeira pessoa a entrar nesta comunidade."
      />
    )
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {members.map((member) => (
        <div
          key={member.userId}
          className="flex items-center gap-3 rounded-xl border bg-card p-3 transition-colors hover:border-primary/50"
        >
          <Avatar>
            <AvatarImage src={member.userProfilePicture ?? undefined} alt="" />
            <AvatarFallback>
              {member.userName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="min-w-0 flex-1">
            <strong className="block truncate">{member.userName}</strong>
            <small className="text-muted-foreground">
              {member.role === "Owner"
                ? "Dono"
                : member.role === "Moderator"
                  ? "Moderador"
                  : "Membro"}
            </small>
          </span>
        </div>
      ))}
    </div>
  )
}
