export const RELATIONSHIP_STATUS_OPTIONS: Array<{
  value: string
  label: string
}> = [
  { value: "Single", label: "Solteiro(a)" },
  { value: "Dating", label: "Namorando" },
  { value: "Engaged", label: "Noivo(a)" },
  { value: "Married", label: "Casado(a)" },
  { value: "SeriousRelationship", label: "Relacionamento sério" },
  { value: "Complicated", label: "Enrolado(a)" },
  { value: "Divorced", label: "Divorciado(a)" },
  { value: "Widowed", label: "Viúvo(a)" },
]

export function relationshipStatusLabel(value?: string | null): string | null {
  if (!value) return null
  const option = RELATIONSHIP_STATUS_OPTIONS.find((o) => o.value === value)
  return option ? option.label : null
}
