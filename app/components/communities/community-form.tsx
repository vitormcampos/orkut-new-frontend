import { useState } from "react"
import { Button } from "~/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import type {
  CreateCommunityRequest,
  UpdateCommunityRequest,
} from "~/lib/api/types"

interface Props {
  initial?: { name: string; description?: string | null }
  submitLabel: string
  onSubmit: (
    body: CreateCommunityRequest | UpdateCommunityRequest
  ) => Promise<void>
  error?: string | null
}
export function CommunityForm({
  initial,
  submitLabel,
  onSubmit,
  error,
}: Props) {
  const [name, setName] = useState(initial?.name ?? "")
  const [description, setDescription] = useState(initial?.description ?? "")
  const [validation, setValidation] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const cleanName = name.trim()
    if (!cleanName) {
      setValidation("Informe um nome para a comunidade.")
      return
    }
    if (cleanName.length > 200) {
      setValidation("O nome deve ter no máximo 200 caracteres.")
      return
    }
    if (description.length > 2000) {
      setValidation("A descrição deve ter no máximo 2.000 caracteres.")
      return
    }
    setValidation(null)
    setLoading(true)
    try {
      await onSubmit({ name: cleanName, description: description.trim() })
    } finally {
      setLoading(false)
    }
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="community-name">Nome</FieldLabel>
          <Input
            id="community-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={200}
            required
          />
          <FieldDescription>Até 200 caracteres.</FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="community-description">Descrição</FieldLabel>
          <textarea
            id="community-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            maxLength={2000}
            rows={6}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
          <FieldDescription>
            {description.length}/2.000 caracteres
          </FieldDescription>
        </Field>
      </FieldGroup>
      {validation && <FieldError>{validation}</FieldError>}
      {error && <FieldError>{error}</FieldError>}
      <Button type="submit" disabled={loading}>
        {loading ? "Salvando..." : submitLabel}
      </Button>
    </form>
  )
}
