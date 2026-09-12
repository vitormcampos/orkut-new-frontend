import { CommunityCard } from "~/components/communities/community-card"
import { getUserCommunities } from "~/lib/api/community"
import { useAsyncData } from "~/lib/use-async-data"
import type { PublicProfileDto } from "~/lib/api/types"

export function ProfileCommunities({ profile }: { profile: PublicProfileDto }) {
  const { data, loading, error, refresh } = useAsyncData(
    () => getUserCommunities(profile.id),
    [profile.id],
    { fallbackError: "Erro ao carregar comunidades." }
  )

  if (loading) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Carregando comunidades...
      </p>
    )
  }

  if (error) {
    return (
      <div className="empty-state">
        <h2>Não foi possível carregar</h2>
        <p>{error}</p>
        <button type="button" className="btn mt-4" onClick={refresh}>
          Tentar novamente
        </button>
      </div>
    )
  }

  if (!data?.length) {
    return (
      <div className="empty-state">
        <div className="eyebrow">comunidades</div>
        <h2>Nenhuma comunidade ainda</h2>
        <p>{profile.name} ainda não participa de nenhuma comunidade.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {data.map((community) => (
        <CommunityCard key={community.id} community={community} />
      ))}
    </div>
  )
}
