import { Link } from "react-router"
import { Button } from "~/components/ui/button"
import type { CommunityDto } from "~/lib/api/types"

interface Props {
  community: CommunityDto
  isOwner: boolean
  isMember: boolean
  membershipKnown: boolean
  loading: boolean
  onJoin: () => void
  onLeave: () => void
}
export function CommunityActions({
  community,
  isOwner,
  isMember,
  membershipKnown,
  loading,
  onJoin,
  onLeave,
}: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {isOwner ? (
        <Link to={`/communities/${community.id}/edit`} className="btn primary">
          Editar comunidade
        </Link>
      ) : isMember ? (
        <Button variant="outline" onClick={onLeave} disabled={loading}>
          {loading ? "Saindo..." : "Sair da comunidade"}
        </Button>
      ) : membershipKnown ? (
        <Button onClick={onJoin} disabled={loading}>
          {loading ? "Entrando..." : "Entrar na comunidade"}
        </Button>
      ) : (
        <p className="text-sm text-muted-foreground" role="status">
          Não foi possível verificar sua participação agora.
        </p>
      )}
    </div>
  )
}
