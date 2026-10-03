import { Users } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import type { CommunityDto } from "~/lib/api/types"
import styles from "./community-header.module.css"

export function CommunityHeader({ community }: { community: CommunityDto }) {
  return (
    <section className={styles.hero}>
      <div className={styles.art} aria-hidden="true" />
      <div className={styles.content}>
        <Avatar size="lg" className={styles.avatar}>
          <AvatarImage
            src={community.photo ?? undefined}
            alt={`Foto de ${community.name}`}
          />
          <AvatarFallback className="text-2xl">
            {community.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className={styles.copy}>
          <p className="eyebrow">espaço da comunidade</p>
          <h1>{community.name}</h1>
          <p className={styles.memberCount}>
            <Users size={16} aria-hidden="true" />
            <span>
              {community.memberCount}{" "}
              {community.memberCount === 1 ? "membro" : "membros"}
            </span>
          </p>
        </div>
      </div>
    </section>
  )
}
