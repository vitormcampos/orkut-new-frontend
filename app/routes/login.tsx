import type { Route } from "./+types/login"
import { Link } from "react-router"
import { LoginForm } from "~/components/login-form"

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Entrar | newkut" },
    {
      name: "description",
      content:
        "Entre na sua conta newkut para acompanhar suas comunidades, conversas e conexões.",
    },
  ]
}

export default function LoginPage() {
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
            Ainda não tem uma conta?{" "}
            <Link
              to="/register"
              className="font-semibold text-foreground underline underline-offset-4"
            >
              Criar conta
            </Link>
          </p>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-[1080px] grid-cols-1 items-center gap-x-[clamp(52px,9vw,132px)] gap-y-12 px-4 py-10 sm:px-6 sm:py-[78px] lg:grid-cols-[minmax(0,1fr)_minmax(370px,470px)]">
        <section className="max-w-[470px]">
          <p className="font-mono text-xs tracking-[0.08em] text-muted-foreground uppercase">
            bom ter você de volta
          </p>
          <h1 className="mt-2.5 max-w-[10ch] font-display text-display font-semibold lg:max-w-[8ch]">
            Continue de onde parou.
          </h1>
          <p className="mt-4 max-w-[39ch] text-lg text-muted-foreground">
            Entre para acompanhar as conversas, revisitar suas comunidades e
            ficar perto das pessoas que importam.
          </p>

          <div
            aria-hidden="true"
            className="relative mt-14 hidden min-h-[180px] overflow-hidden border-t pt-4 md:block"
          >
            <p className="max-w-[24ch] text-sm text-muted-foreground">
              <strong className="font-semibold text-foreground">
                Seu lugar continua aqui.
              </strong>
              <br />
              As conexões e interesses que você construiu esperam por você.
            </p>
            <div className="absolute top-[116px] left-0 h-px w-[78%] origin-left -rotate-[13deg] bg-primary/25 after:absolute after:top-[30px] after:left-[16%] after:h-px after:w-full after:rotate-[25deg] after:bg-primary/15" />
            <span className="absolute top-[88px] left-[7%] grid size-[42px] place-items-center rounded-full bg-[oklch(70%_0.1_185)] text-[11px] font-semibold text-white ring-[6px] ring-background">
              RF
            </span>
            <span className="absolute top-[120px] left-[44%] grid size-[42px] place-items-center rounded-full bg-[oklch(68%_0.1_32)] text-[11px] font-semibold text-white ring-[6px] ring-background">
              BL
            </span>
            <span className="absolute top-[70px] right-[9%] grid size-[42px] place-items-center rounded-full bg-[oklch(62%_0.12_300)] text-[11px] font-semibold text-white ring-[6px] ring-background">
              GS
            </span>
          </div>
        </section>

        <LoginForm />
      </main>
    </div>
  )
}
