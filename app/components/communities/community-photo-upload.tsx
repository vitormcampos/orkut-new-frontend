import { useEffect, useState } from "react"
import { Button } from "~/components/ui/button"
import { getErrorMessage } from "~/lib/api/client"
import { uploadCommunityPhoto } from "~/lib/api/community"
import { validateImage } from "~/lib/media-validation"
import type { CommunityDto } from "~/lib/api/types"

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
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="space-y-2">
      <label htmlFor="community-photo" className="text-sm font-medium">
        Foto da comunidade
      </label>
      <input
        id="community-photo"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleChange}
        className="block w-full text-sm"
        aria-describedby="community-photo-help"
        disabled={loading}
      />
      {preview && (
        <img
          src={preview}
          alt="Prévia da foto da comunidade"
          className="mt-2 size-24 rounded-xl object-cover"
        />
      )}
      {loading && (
        <p className="text-sm text-muted-foreground">Enviando foto...</p>
      )}
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <p id="community-photo-help" className="text-xs text-muted-foreground">
        JPG, PNG ou WebP, até 5 MB.
      </p>
      <p className="text-xs text-muted-foreground">
        A foto é atualizada assim que você seleciona um arquivo válido.
      </p>
    </div>
  )
}
