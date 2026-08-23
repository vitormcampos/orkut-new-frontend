import { Link, useNavigate } from "react-router"
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
          </nav>
        </div>

        <div className="header-actions">
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
                    ? { backgroundImage: `url(${user.profilePicture})`, backgroundSize: "cover", backgroundPosition: "center" }
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
