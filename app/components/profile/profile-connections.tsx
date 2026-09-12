import { FriendCard } from "~/components/friend-card"
import { getFriends } from "~/lib/api/friendship"
import { getFriendDisplay } from "~/lib/friendship-utils"
import { useAsyncData } from "~/lib/use-async-data"

export function ProfileConnections({ userId }: { userId: string }) {
  const { data, loading, error, refresh } = useAsyncData(
    getFriends,
    [userId],
    { fallbackError: "Erro ao carregar conexões." }
  )

  if (loading) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Carregando conexões...
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
        <div className="eyebrow">conexões</div>
        <h2>Nenhuma conexão ainda</h2>
        <p>Adicione amigos para vê-los aparecerem aqui.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {data.map((friendship) => {
        const friend = getFriendDisplay(friendship, userId)
        return (
          <FriendCard
            key={friendship.id}
            name={friend.name}
            username={friend.username}
            profilePicture={friend.profilePicture}
            href={friend.username ? `/u/${friend.username}` : undefined}
          />
        )
      })}
    </div>
  )
}
