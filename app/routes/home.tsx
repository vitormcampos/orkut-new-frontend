import type { Route } from "./+types/home"
import { Navbar } from "~/components/navbar"

export function meta({}: Route.MetaArgs) {
  return [
    { title: "newkut — A rede social que marcou uma geração" },
    {
      name: "description",
      content:
        "Conecte-se com amigos, compartilhe momentos e faça parte da comunidade newkut.",
    },
  ]
}

export default function Home() {
  return (
    <div className="min-h-svh">
      <Navbar />

      <main>
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="mx-auto max-w-2xl space-y-6">
            <div className="mx-auto flex size-20 items-center justify-center rounded-2xl bg-primary">
              <span className="text-4xl font-bold text-primary-foreground">
                n
              </span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              Bem-vindo ao <span className="text-primary">newkut</span>
            </h1>

            <p className="text-lg text-muted-foreground">
              Uma nova versão da rede social que marcou uma geração. Conecte-se
              com amigos, compartilhe momentos e faça parte dessa comunidade.
            </p>

            <div className="flex items-center justify-center gap-4 pt-4">
              <a
                href="/register"
                className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
              >
                Criar conta
              </a>
              <a
                href="/login"
                className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-6 text-sm font-medium shadow-xs transition-colors hover:bg-muted"
              >
                Entrar
              </a>
            </div>
          </div>
        </section>

        <section className="container mx-auto border-t px-4 py-20">
          <div className="mx-auto grid max-w-4xl gap-8 sm:grid-cols-3">
            <div className="space-y-3 rounded-xl border p-6">
              <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <title>Amigos</title>
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3 className="font-semibold">Amigos</h3>
              <p className="text-sm text-muted-foreground">
                Conecte-se com pessoas queridas e acompanhe o que elas
                compartilham.
              </p>
            </div>

            <div className="space-y-3 rounded-xl border p-6">
              <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <title>Comunidades</title>
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3 className="font-semibold">Comunidades</h3>
              <p className="text-sm text-muted-foreground">
                Participe de grupos sobre os temas que você mais gosta.
              </p>
            </div>

            <div className="space-y-3 rounded-xl border p-6">
              <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <title>Recados</title>
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h3 className="font-semibold">Recados</h3>
              <p className="text-sm text-muted-foreground">
                Deixe recados no perfil dos seus amigos como nos velhos tempos.
              </p>
            </div>
          </div>
        </section>

        <footer className="border-t">
          <div className="container mx-auto flex items-center justify-center px-4 py-8">
            <p className="text-sm text-muted-foreground">
              newkut &copy; {new Date().getFullYear()}
            </p>
          </div>
        </footer>
      </main>
    </div>
  )
}
