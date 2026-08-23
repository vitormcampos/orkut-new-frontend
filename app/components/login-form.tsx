import { useState } from "react"
import { Link, useNavigate } from "react-router"
import { Button } from "~/components/ui/button"
import { Field, FieldError, FieldLabel } from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { cn } from "~/lib/utils"
import { useAuth } from "~/lib/auth-context"
import { ApiError } from "~/lib/api/client"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"section">) {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string
    password?: string
  }>({})
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const nextErrors: typeof fieldErrors = {}
    if (!email.trim()) nextErrors.email = "Digite seu e-mail."
    if (!password.trim()) {
      nextErrors.password = "Digite sua senha para continuar."
    }
    setFieldErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setLoading(true)
    try {
      await login({ email, password })
      navigate("/")
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Ocorreu um erro inesperado. Tente novamente."
      )
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
        <p className="font-mono text-xs uppercase tracking-[0.08em] text-muted-foreground">
          acesso à sua conta
        </p>
        <h2 className="mt-2 font-display text-[27px] leading-[1.1] font-semibold tracking-[-0.025em]">
          Entrar no newkut
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Use seu e-mail e senha.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="grid gap-[17px]">
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
          {fieldErrors.email && (
            <FieldError>{fieldErrors.email}</FieldError>
          )}
        </Field>

        <Field className="gap-2">
          <FieldLabel htmlFor="password">Senha</FieldLabel>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={fieldErrors.password ? true : undefined}
              className="h-[46px] bg-background pr-[74px]"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              className="absolute right-2 top-1.5 h-8 rounded-md px-2 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {showPassword ? "Ocultar" : "Mostrar"}
            </button>
          </div>
          {fieldErrors.password && (
            <FieldError>{fieldErrors.password}</FieldError>
          )}
        </Field>

        <div className="-my-0.5 flex items-center justify-between gap-4">
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="size-4 accent-primary"
            />
            <span>Lembrar de mim</span>
          </label>
          <Link
            to="/forgot-password"
            className="text-xs text-foreground underline underline-offset-4"
          >
            Esqueci minha senha
          </Link>
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
          {loading ? "Entrando..." : "Entrar"}
        </Button>
      </form>

      <p className="mt-[18px] border-t pt-[17px] text-center text-sm text-muted-foreground">
        Ainda não faz parte?{" "}
        <Link
          to="/register"
          className="font-semibold text-foreground underline underline-offset-4"
        >
          Crie sua conta
        </Link>
      </p>
    </section>
  )
}
