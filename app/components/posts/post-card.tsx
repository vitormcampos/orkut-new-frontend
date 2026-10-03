import { Link } from "react-router"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Button } from "~/components/ui/button"
import type { PostDto } from "~/lib/api/types"

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

export function PostCard({
  post,
  canDelete,
  deleting,
  onDelete,
}: {
  post: PostDto
  canDelete: boolean
  deleting: boolean
  onDelete: () => void
}) {
  return (
    <article className="post-card rounded-xl border bg-card p-4 shadow-card sm:p-5">
      <header className="flex items-start gap-3">
        <Avatar size="lg">
          <AvatarImage
            src={post.authorProfilePicture ?? undefined}
            alt={post.authorName}
          />
          <AvatarFallback>
            {post.authorName.slice(0, 1).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1 pt-0.5">
          <Link
            to={`/u/${post.authorUsername}`}
            className="font-semibold transition-colors hover:text-primary hover:underline"
          >
            {post.authorName}
          </Link>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground">
            <span>@{post.authorUsername}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
          </div>
        </div>
        {canDelete && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive"
            onClick={onDelete}
            disabled={deleting}
            aria-label={`Excluir publicação de ${post.authorName}`}
          >
            {deleting ? "Excluindo..." : "Excluir"}
          </Button>
        )}
      </header>
      <p className="post-content mt-4 text-sm leading-6 break-words whitespace-pre-wrap">
        {post.content}
      </p>
    </article>
  )
}
