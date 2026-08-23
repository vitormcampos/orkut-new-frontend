export function CommunityErrorState({ message }: { message: string }) {
  return (
    <div
      className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
      role="alert"
    >
      {message}
    </div>
  )
}
