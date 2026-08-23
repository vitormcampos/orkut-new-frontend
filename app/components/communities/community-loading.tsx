export function CommunityLoading({
  label = "Carregando...",
}: {
  label?: string
}) {
  return <div className="py-12 text-center text-muted-foreground">{label}</div>
}
