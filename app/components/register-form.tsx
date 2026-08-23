import { useState } from "react"
import { useNavigate } from "react-router"
import { Button } from "~/components/ui/button"
import { Field, FieldError, FieldLabel } from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { cn } from "~/lib/utils"
import { register } from "~/lib/api/auth"
import { getErrorMessage } from "~/lib/api/client"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const USERNAME_RE = /^[a-zA-Z0-9._-]{3,}$/

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"section">) {
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string
    email?: string
    username?: string
    password?: string
  }>({})
  const [termsError, setTermsError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setTermsError(null)

    const nextErrors: typeof fieldErrors = {}
    if (!name.trim()) nextErrors.name = "Digite seu nome para continuar."
    if (!EMAIL_RE.test(email)) nextErrors.email = "Informe um e-mail válido."
    if (!USERNAME_RE.test(username)) {
      nextErrors.username = "Use pelo menos 3 caracteres, sem espaços."
    }
    if (password.length < 8) {
      nextErrors.password = "A senha precisa ter pelo menos 8 caracteres."
    }
    setFieldErrors(nextErrors)

    if (!acceptedTerms) setTermsError("Aceite os termos para continuar.")

    if (Object.keys(nextErrors).length > 0 || !acceptedTerms) return

    setLoading(true)
    try {
      await register({ name, email, username, password })
      navigate("/login")
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <section
      className={cn(
        "rounded-2xl border bg-card p-5 shadow-card sm:p-[clamp(24px,4vw,38px)]",
        className
      )}
      {...props}
    >
      <div className="mb-6">
        <p className="font-mono text-xs tracking-[0.08em] text-muted-foreground uppercase">
          comece agora
        </p>
        <h2 className="mt-2 font-display text-[26px] leading-[1.1] font-semibold tracking-[-0.025em]">
          Crie sua conta
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Leva menos de um minuto.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="grid gap-4">
        <Field className="gap-2">
          <FieldLabel htmlFor="name">Nome</FieldLabel>
          <Input
            id="name"
            type="text"
            autoComplete="name"
            placeholder="Como você quer ser chamado?"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={fieldErrors.name ? true : undefined}
            className="h-[46px] bg-background"
          />
          {fieldErrors.name && <FieldError>{fieldErrors.name}</FieldError>}
        </Field>

        <Field className="gap-2">
          <FieldLabel htmlFor="email">E-mail</FieldLabel>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="voce@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={fieldErrors.email ? true : undefined}
            className="h-[46px] bg-background"
          />
          {fieldErrors.email && <FieldError>{fieldErrors.email}</FieldError>}
        </Field>

        <Field className="gap-2">
          <FieldLabel htmlFor="username">Nome de usuário</FieldLabel>
          <Input
            id="username"
            type="text"
            autoComplete="username"
            placeholder="seu-nome"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            aria-invalid={fieldErrors.username ? true : undefined}
            className="h-[46px] bg-background"
          />
          {fieldErrors.username && (
            <FieldError>{fieldErrors.username}</FieldError>
          )}
        </Field>

        <Field className="gap-2">
          <FieldLabel htmlFor="password">Senha</FieldLabel>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Pelo menos 8 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={fieldErrors.password ? true : undefined}
              className="h-[46px] bg-background pr-[74px]"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              className="absolute top-1.5 right-2 h-8 rounded-md px-2 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {showPassword ? "Ocultar" : "Mostrar"}
            </button>
          </div>
          {fieldErrors.password && (
            <FieldError>{fieldErrors.password}</FieldError>
          )}
        </Field>

        <div className="my-0.5">
          <label className="flex items-start gap-2.5 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-0.5 size-4 flex-none accent-primary"
            />
            <span>
              Eu concordo com os{" "}
              <span className="text-foreground underline underline-offset-4">
                Termos de uso
              </span>{" "}
              e a{" "}
              <span className="text-foreground underline underline-offset-4">
                Política de privacidade
              </span>
              .
            </span>
          </label>
          {termsError && (
            <p className="mt-1 text-xs text-destructive">{termsError}</p>
          )}
        </div>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="h-[46px] w-full border-primary font-semibold tracking-[0.02em] hover:border-accent-deep hover:bg-accent-deep"
        >
          {loading ? "Criando conta..." : "Criar minha conta"}
        </Button>
      </form>

      <p className="mt-[18px] border-t pt-[17px] text-center text-sm text-muted-foreground">
        Ao entrar, você poderá completar seu perfil e encontrar suas
        comunidades.
      </p>
    </section>
  )
}
