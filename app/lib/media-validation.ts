const COMMUNITY_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024

export function validateImage(file: File): string | null {
  if (
    !COMMUNITY_IMAGE_TYPES.includes(
      file.type as (typeof COMMUNITY_IMAGE_TYPES)[number]
    )
  ) {
    return "Escolha uma imagem JPG, PNG ou WebP."
  }
  if (file.size > MAX_IMAGE_SIZE) return "A imagem deve ter no máximo 5 MB."
  return null
}
