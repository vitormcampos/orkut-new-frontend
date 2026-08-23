import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import type { CommunityDto } from "~/lib/api/types"

export function CommunityHeader({ community }: { community: CommunityDto }) {
  return (
    <section className="relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
      <div className="absolute inset-x-0 top-0 h-24 bg-primary/10" />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end">
        <Avatar size="lg" className="size-24 ring-4 ring-card sm:size-28">
          <AvatarImage
            src={community.photo ?? undefined}
            alt={`Foto de ${community.name}`}
          />
          <AvatarFallback className="text-2xl">
            {community.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="eyebrow">comunidade</div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            {community.name}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {community.memberCount}{" "}
            {community.memberCount === 1 ? "membro" : "membros"}
          </p>
        </div>
      </div>
    </section>
  )
}
