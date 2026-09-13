import { useEffect, useState } from "react"
import type { FormEvent } from "react"
import { Link, useLocation, useNavigate } from "react-router"
import {
  Bell,
  ChevronRight,
  Home,
  Menu,
  MessageCircle,
  Moon,
  Search,
  Sun,
  Users,
  X,
} from "lucide-react"
import { Input } from "~/components/ui/input"
import { useAuth } from "~/lib/auth-context"
import { useTheme } from "~/lib/theme-context"

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

const navigationItems = [
  { label: "Feed", href: "/", icon: Home },
  { label: "Amigos", href: "/friends", icon: Users },
  { label: "Comunidades", href: "/communities", icon: MessageCircle },
] as const

function Sidebar({
  onClose,
  mobileOpen = false,
}: {
  onClose?: () => void
  mobileOpen?: boolean
}) {
  const location = useLocation()

  return (
    <aside
      className={["app-sidebar", mobileOpen && "is-open"]
        .filter(Boolean)
        .join(" ")}
      aria-label="Navegação principal"
    >
      <div className="sidebar-heading">
        <span className="eyebrow">sua rede</span>
        {onClose && mobileOpen && (
          <button
            type="button"
            className="sidebar-close"
            onClick={onClose}
            aria-label="Fechar menu"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        )}
      </div>

      <nav className="sidebar-nav">
        {navigationItems.map(({ label, href, icon: Icon }) => {
          const active =
            href === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(href)
          return (
            <Link
              key={href}
              to={href}
              onClick={onClose}
              className={["sidebar-link", active && "active"]
                .filter(Boolean)
                .join(" ")}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="size-[18px]" aria-hidden="true" />
              <span>{label}</span>
              {active && (
                <ChevronRight
                  className="sidebar-current size-4"
                  aria-hidden="true"
                />
              )}
            </Link>
          )
        })}
      </nav>

      <div className="sidebar-section">
        <span className="eyebrow">em breve</span>
        <div className="sidebar-disabled" aria-disabled="true">
          <Bell className="size-[18px]" aria-hidden="true" />
          <span>Notificações</span>
        </div>
        <div className="sidebar-disabled" aria-disabled="true">
          <MessageCircle className="size-[18px]" aria-hidden="true" />
          <span>Mensagens</span>
        </div>
      </div>
    </aside>
  )
}

export function Navbar() {
  const navigate = useNavigate()
  const { user, loading, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [searchTerm, setSearchTerm] = useState("")
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    document.body.classList.toggle("has-sidebar", !!user)
    return () => document.body.classList.remove("has-sidebar")
  }, [user])

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
    <>
      <header className="app-header">
        <div className="header-inner">
          <div className="header-leading">
            {user && (
              <button
                type="button"
                className="mobile-menu-btn"
                onClick={() => setMenuOpen((open) => !open)}
                aria-label="Abrir menu"
                aria-expanded={menuOpen}
              >
                <Menu className="size-5" aria-hidden="true" />
              </button>
            )}
            <Link to="/" className="brand">
              <span className="brand-mark">n</span>
              <span>newkut</span>
            </Link>
          </div>

          <form role="search" onSubmit={handleSearch} className="navbar-search">
            <label htmlFor="navbar-search" className="sr-only">
              Buscar pessoas e comunidades
            </label>
            <Search
              className="navbar-search-icon size-[18px]"
              aria-hidden="true"
            />
            <Input
              id="navbar-search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar pessoas, comunidades..."
              className="h-11 w-full rounded-full border-0 bg-transparent pr-4 pl-11 text-sm shadow-none focus-visible:ring-0"
              maxLength={100}
            />
          </form>

          <div className="header-actions">
            <button
              type="button"
              className="icon-btn"
              onClick={toggleTheme}
              aria-label={
                theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"
              }
              aria-pressed={theme === "dark"}
              title={theme === "dark" ? "Modo claro" : "Modo escuro"}
            >
              {theme === "dark" ? (
                <Sun className="size-[18px]" aria-hidden="true" />
              ) : (
                <Moon className="size-[18px]" aria-hidden="true" />
              )}
            </button>
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
      {user && (
        <Sidebar onClose={() => setMenuOpen(false)} mobileOpen={menuOpen} />
      )}
      {user && menuOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          aria-label="Fechar menu"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </>
  )
}
