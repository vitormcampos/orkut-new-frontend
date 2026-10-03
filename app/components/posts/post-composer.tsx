import { useState, type FormEvent } from "react"
import { Button } from "~/components/ui/button"

export function PostComposer({
  busy,
  onPublish,
}: {
  busy: boolean
  onPublish: (content: string) => Promise<boolean>
}) {
  const [content, setContent] = useState("")

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!content.trim() || busy) return
    if (await onPublish(content.trim())) setContent("")
  }

  return (
    <form
      onSubmit={submit}
      className="post-composer space-y-3"
    >
      <div>
        <label htmlFor="post-content" className="sr-only">
          Escreva uma publicação
        </label>
        <textarea
          id="post-content"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          maxLength={5000}
          rows={3}
          placeholder="O que você gostaria de compartilhar?"
          className="post-composer-input min-h-24 w-full resize-y rounded-lg border bg-background px-3 py-2.5 text-sm transition outline-none focus-visible:ring-2 focus-visible:ring-ring"
          disabled={busy}
        />
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="text-xs tabular-nums text-muted-foreground" aria-live="polite">
          {content.length}/5000
        </span>
        <Button type="submit" disabled={busy || !content.trim()}>
          {busy ? "Publicando..." : "Publicar"}
        </Button>
      </div>
    </form>
  )
}
