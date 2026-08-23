export function CommunityEmptyState({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="empty-state">
      <div className="eyebrow">comunidades</div>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  )
}
