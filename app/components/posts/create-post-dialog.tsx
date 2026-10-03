import { useEffect, useRef, useState, type FormEvent } from "react"
import { Button } from "~/components/ui/button"
import { createPost } from "~/lib/api/post"
import { getUserCommunities } from "~/lib/api/community"
import { getErrorMessage } from "~/lib/api/client"
import { useAsyncData } from "~/lib/use-async-data"
import type { UserDto } from "~/lib/api/types"
import styles from "./create-post-dialog.module.css"

export function CreatePostDialog({
  open,
  user,
  onClose,
}: {
  open: boolean
  user: UserDto
  onClose: () => void
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [content, setContent] = useState("")
  const [communityId, setCommunityId] = useState("")
  const [busy, setBusy] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const {
    data: communities,
    loading: communitiesLoading,
    error: communitiesError,
  } = useAsyncData(() => getUserCommunities(user.id), [user.id], {
    fallbackError: "Não foi possível carregar suas comunidades.",
  })

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedContent = content.trim()
    if (!trimmedContent || busy) return

    setBusy(true)
    setSubmitError(null)
    try {
      await createPost({
        communityId: communityId || null,
        content: trimmedContent,
      })
      setContent("")
      setCommunityId("")
      onClose()
    } catch (err) {
      setSubmitError(getErrorMessage(err, "Não foi possível publicar."))
    } finally {
      setBusy(false)
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby="create-post-title"
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose()
      }}
    >
      <div className={styles.header}>
        <h2 id="create-post-title">Criar publicação</h2>
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label="Fechar"
        >
          ×
        </button>
      </div>
      <form onSubmit={submit} className={styles.form}>
        <label htmlFor="post-community">Publicar em</label>
        <select
          id="post-community"
          value={communityId}
          onChange={(event) => setCommunityId(event.target.value)}
          disabled={communitiesLoading || busy}
        >
          <option value="">Próprio feed</option>
          {communities?.map((community) => (
            <option key={community.id} value={community.id}>
              {community.name}
            </option>
          ))}
        </select>
        {communitiesError && (
          <p className={styles.hint} role="status">
            {communitiesError} Você ainda pode publicar no próprio feed.
          </p>
        )}
        <label htmlFor="create-post-content">Sua publicação</label>
        <textarea
          id="create-post-content"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          maxLength={5000}
          rows={5}
          placeholder="O que você gostaria de compartilhar?"
          disabled={busy}
          autoFocus
        />
        {submitError && (
          <p className={styles.error} role="alert">
            {submitError}
          </p>
        )}
        <div className={styles.actions}>
          <span className={styles.count} aria-live="polite">
            {content.length}/5000
          </span>
          <Button type="submit" disabled={busy || !content.trim()}>
            {busy ? "Publicando..." : "Publicar"}
          </Button>
        </div>
      </form>
    </dialog>
  )
}
