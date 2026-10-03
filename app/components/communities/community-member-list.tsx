import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import type { CommunityMemberDto } from "~/lib/api/types"
import { CommunityEmptyState } from "~/components/communities/community-empty-state"
import styles from "./community-member-list.module.css"

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
    <div className={styles.list}>
      {members.map((member) => (
        <div key={member.userId} className={styles.member}>
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
