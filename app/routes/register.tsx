import type { Route } from "./+types/register"
import { Link } from "react-router"
import { RegisterForm } from "~/components/register-form"

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Criar conta | newkut" },
    {
      name: "description",
      content:
        "Crie sua conta no newkut para acompanhar pessoas, participar de comunidades e compartilhar o que faz sentido para você.",
    },
  ]
}

export default function RegisterPage() {
  return (
    <div className="grid min-h-svh grid-rows-[62px_1fr] sm:grid-rows-[72px_1fr]">
      <header className="border-b bg-card/90 backdrop-blur-md">
        <div className="mx-auto flex h-full w-full max-w-[1180px] items-center justify-between gap-6 px-4 sm:px-6">
          <Link
            to="/"
            className="flex items-center gap-2.5 font-semibold tracking-[-0.02em]"
          >
            <span className="grid size-[30px] place-items-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
              n
            </span>
            <span>newkut</span>
          </Link>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Já tem uma conta?{" "}
            <Link
              to="/login"
              className="font-semibold text-foreground underline underline-offset-4"
            >
              Entrar
            </Link>
          </p>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-[1080px] grid-cols-1 items-center gap-x-[clamp(52px,9vw,132px)] gap-y-12 px-4 py-10 sm:px-6 sm:py-[72px] lg:grid-cols-[minmax(0,1fr)_minmax(370px,470px)]">
        <section className="max-w-[470px]">
          <p className="font-mono text-xs uppercase tracking-[0.08em] text-muted-foreground">
            um lugar para estar por perto
          </p>
          <h1 className="mt-2.5 max-w-[10ch] font-display text-display font-semibold lg:max-w-[8ch]">
            Chegue mais perto.
          </h1>
          <p className="mt-4 max-w-[39ch] text-lg text-muted-foreground">
            Crie seu espaço no newkut para acompanhar pessoas, participar de
            comunidades e compartilhar o que faz sentido para você.
          </p>

          <div
            aria-hidden="true"
            className="relative mt-14 hidden h-[294px] overflow-hidden border-t md:block"
          >
            <span className="absolute left-0 top-4 font-mono text-[11px] tracking-[0.06em] text-muted-foreground">
              conexões que continuam
            </span>
            <div className="absolute left-[16%] top-[74px] size-[250px] rounded-full border border-primary/25 before:absolute before:inset-[26px] before:rounded-full before:border before:border-primary/15 after:absolute after:inset-[52px] after:rounded-full after:border after:border-primary/15" />
            <span className="absolute left-[8%] top-[128px] grid size-[46px] place-items-center rounded-full bg-[oklch(70%_0.1_185)] text-xs font-semibold text-white ring-[6px] ring-background">
              RF
            </span>
            <span className="absolute left-[57%] top-[53px] grid size-[46px] place-items-center rounded-full bg-[oklch(68%_0.1_32)] text-xs font-semibold text-white ring-[6px] ring-background">
              BL
            </span>
            <span className="absolute left-[78%] top-[190px] grid size-[46px] place-items-center rounded-full bg-[oklch(62%_0.12_300)] text-xs font-semibold text-white ring-[6px] ring-background">
              GS
            </span>
            <p className="absolute right-0 bottom-0 w-[145px] text-xs text-muted-foreground">
              Uma rede feita de interesses em comum, não de métricas.
            </p>
          </div>
        </section>

        <RegisterForm />
      </main>
    </div>
  )
}
