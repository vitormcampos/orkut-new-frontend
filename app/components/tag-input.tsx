import { useState } from "react"
import { Input } from "~/components/ui/input"

interface TagInputProps {
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  id?: string
}

export function TagInput({ value, onChange, placeholder, id }: TagInputProps) {
  const [draft, setDraft] = useState("")

  function addItem(raw: string) {
    const item = raw.trim()
    if (!item) return
    if (
      value.some((existing) => existing.toLowerCase() === item.toLowerCase())
    ) {
      setDraft("")
      return
    }
    onChange([...value, item])
    setDraft("")
  }

  function removeItem(index: number) {
    onChange(value.filter((_, i) => i !== index))
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addItem(draft)
    } else if (e.key === "Backspace" && draft === "" && value.length > 0) {
      removeItem(value.length - 1)
    }
  }

  function handleBlur() {
    if (draft.trim()) {
      addItem(draft)
    }
  }

  return (
    <div className="flex w-full flex-wrap items-center gap-1.5 rounded-md border border-input bg-transparent px-2.5 py-1.5 shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 dark:bg-input/30">
      {value.map((item, index) => (
        <span
          key={`${item}-${index}`}
          className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-sm"
        >
          <span className="text-foreground">{item}</span>
          <button
            type="button"
            onClick={() => removeItem(index)}
            aria-label={`Remover ${item}`}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            ×
          </button>
        </span>
      ))}

      <Input
        id={id}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={value.length === 0 ? placeholder : undefined}
        className="h-auto min-w-24 flex-1 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 dark:bg-transparent"
      />
    </div>
  )
}
