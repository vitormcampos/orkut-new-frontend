import { useEffect, useState } from "react"
import { ImagePlus, Upload } from "lucide-react"
import { getErrorMessage } from "~/lib/api/client"
import { uploadCommunityPhoto } from "~/lib/api/community"
import { validateImage } from "~/lib/media-validation"
import type { CommunityDto } from "~/lib/api/types"
import styles from "./community-photo-upload.module.css"

export function CommunityPhotoUpload({
  id,
  photo,
  onUploaded,
}: {
  id: string
  photo?: string | null
  onUploaded: (community: CommunityDto) => void
}) {
  const [preview, setPreview] = useState(photo ?? null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  useEffect(
    () => () => {
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview)
    },
    [preview]
  )

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    const validationError = validateImage(file)
    if (validationError) {
      setError(validationError)
      event.target.value = ""
      return
    }
    const localUrl = URL.createObjectURL(file)
    setPreview(localUrl)
    setError(null)
    setLoading(true)
    try {
      onUploaded(await uploadCommunityPhoto(id, file))
    } catch (err) {
      setError(getErrorMessage(err, "Erro ao enviar a foto."))
      setPreview(photo ?? null)
    } finally {
      setLoading(false)
      event.target.value = ""
    }
  }

  return (
    <div className={styles.control}>
      <div className={styles.heading}>
        <div className={styles.icon} aria-hidden="true">
          <ImagePlus size={17} />
        </div>
        <div>
          <h2>Imagem da comunidade</h2>
          <p>Uma imagem ajuda as pessoas a reconhecer seu espaço.</p>
        </div>
      </div>
      <div className={styles.preview}>
        {preview ? (
          <img src={preview} alt="Prévia da foto da comunidade" />
        ) : (
          <div className={styles.placeholder}>
            <ImagePlus size={25} aria-hidden="true" />
            <span>Sem imagem definida</span>
          </div>
        )}
        {loading && (
          <div className={styles.progress} role="status">
            Enviando imagem…
          </div>
        )}
      </div>
      <label className={styles.picker}>
        <Upload size={16} aria-hidden="true" />
        <span>{preview ? "Trocar imagem" : "Escolher imagem"}</span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleChange}
          aria-describedby="community-photo-help"
          disabled={loading}
        />
      </label>
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <p id="community-photo-help" className="text-xs text-muted-foreground">
        JPG, PNG ou WebP, até 5 MB.
      </p>
    </div>
  )
}
