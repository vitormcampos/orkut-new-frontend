import { useState } from "react"
import type { FormEvent } from "react"
import { Link, useNavigate } from "react-router"
import { Search } from "lucide-react"
import { Input } from "~/components/ui/input"
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
  const [searchTerm, setSearchTerm] = useState("")

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const term = searchTerm.trim()
    if (term) navigate(`/search?term=${encodeURIComponent(term)}`)
  }

  async function handleLogout() {
    await logout()
    navigate("/login")
  }

  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="flex items-center gap-6">
          <Link to="/" className="brand">
            <span className="brand-mark">n</span>
            <span>newkut</span>
          </Link>
          <nav className="header-nav">
            <Link to="/">Início</Link>
            <Link to="/friends">Amigos</Link>
            <Link to="/communities">Comunidades</Link>
          </nav>
        </div>

        <div className="header-actions">
          <form role="search" onSubmit={handleSearch} className="relative">
            <label htmlFor="navbar-search" className="sr-only">
              Buscar pessoas e comunidades
            </label>
            <Input
              id="navbar-search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar"
              className="h-8 w-28 rounded-full pr-8 text-xs sm:w-40"
              maxLength={100}
            />
            <button
              type="submit"
              aria-label="Buscar"
              className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <Search className="size-4" aria-hidden="true" />
            </button>
          </form>
          {loading ? null : user ? (
            <>
              <Link
                to={user.username ? `/u/${user.username}` : "/me"}
                className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline"
              >
                {user.name}
              </Link>
              <Link
                to={user.username ? `/u/${user.username}` : "/me"}
                className="avatar-btn"
                aria-label="Abrir meu perfil"
                style={
                  user.profilePicture
                    ? {
                        backgroundImage: `url(${user.profilePicture})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }
                    : undefined
                }
              >
                {user.profilePicture
                  ? null
                  : user.name
                    ? getInitials(user.name)
                    : "U"}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Entrar
              </Link>
              <Link to="/register" className="btn small primary">
                Cadastrar
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
