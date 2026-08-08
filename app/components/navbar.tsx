import { Link, useNavigate } from "react-router"
import { Button } from "~/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { useAuth } from "~/lib/auth-context"

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function Navbar() {
  const navigate = useNavigate()
  const { user, loading, logout } = useAuth()

  async function handleLogout() {
    await logout()
    navigate("/login")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <span className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              O
            </span>
            <span className="hidden text-lg sm:inline">Orkut New</span>
          </Link>
          <nav className="hidden items-center gap-4 text-sm md:flex">
            <Link
              to="/"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Início
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {loading ? null : user ? (
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-muted-foreground sm:inline">
                {user.name}
              </span>
              <Link to="/me">
                <Avatar className="size-8">
                  {user.profilePicture ? (
                    <AvatarImage
                      src={user.profilePicture}
                      alt={user.name ?? ""}
                    />
                  ) : (
                    <AvatarFallback>
                      {user.name ? getInitials(user.name) : "U"}
                    </AvatarFallback>
                  )}
                </Avatar>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Sair
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="inline-flex h-8 items-center justify-center rounded-md px-2.5 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground"
              >
                Entrar
              </Link>
              <Link
                to="/register"
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-primary px-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
              >
                Cadastrar
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
