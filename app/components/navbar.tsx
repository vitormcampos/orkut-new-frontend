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
  Plus,
  Search,
  Sun,
  X,
} from "lucide-react"
import { Input } from "~/components/ui/input"
import { CreatePostDialog } from "~/components/posts/create-post-dialog"
import { getUserCommunities } from "~/lib/api/community"
import { useAsyncData } from "~/lib/use-async-data"
import { useAuth } from "~/lib/auth-context"
import { useTheme } from "~/lib/theme-context"
import navbarStyles from "./navbar.module.css"
import sidebarStyles from "./sidebar.module.css"

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
  { label: "Comunidades", href: "/communities", icon: MessageCircle },
] as const

function Sidebar({
  userId,
  onClose,
  mobileOpen = false,
}: {
  userId: string
  onClose?: () => void
  mobileOpen?: boolean
}) {
  const location = useLocation()
  const { data: communities, loading: communitiesLoading } = useAsyncData(
    () => getUserCommunities(userId),
    [userId],
    { fallbackError: "Não foi possível carregar suas comunidades." }
  )

  return (
    <aside
      className={[
        "app-sidebar",
        sidebarStyles.sidebar,
        mobileOpen && sidebarStyles.open,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label="Navegação principal"
    >
      <div className={sidebarStyles.heading}>
        <span className="eyebrow">sua rede</span>
        {onClose && mobileOpen && (
          <button
            type="button"
            className={sidebarStyles.close}
            onClick={onClose}
            aria-label="Fechar menu"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        )}
      </div>

      <nav className={sidebarStyles.nav}>
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
              className={[sidebarStyles.link, active && sidebarStyles.active]
                .filter(Boolean)
                .join(" ")}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="size-[18px]" aria-hidden="true" />
              <span>{label}</span>
              {active && (
                <ChevronRight
                  className={`${sidebarStyles.current} size-4`}
                  aria-hidden="true"
                />
              )}
            </Link>
          )
        })}
      </nav>

      <div className={`${sidebarStyles.section} ${sidebarStyles.communities}`}>
        <span className="eyebrow">suas comunidades</span>
        {communitiesLoading ? (
          <span className={sidebarStyles.hint}>Carregando...</span>
        ) : communities?.length ? (
          communities.map((community) => {
            const active = location.pathname.startsWith(
              `/communities/${community.id}`
            )
            return (
              <Link
                key={community.id}
                to={`/communities/${community.id}`}
                onClick={onClose}
                className={[
                  sidebarStyles.link,
                  sidebarStyles.communityLink,
                  active && sidebarStyles.active,
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-current={active ? "page" : undefined}
              >
                <span
                  className={sidebarStyles.communityAvatar}
                  aria-hidden="true"
                >
                  {community.photo ? (
                    <img src={community.photo} alt="" />
                  ) : (
                    community.name.slice(0, 1).toUpperCase()
                  )}
                </span>
                <span className={sidebarStyles.communityName}>
                  {community.name}
                </span>
              </Link>
            )
          })
        ) : (
          <span className={sidebarStyles.hint}>
            Você ainda não participa de comunidades.
          </span>
        )}
      </div>

      <div className={sidebarStyles.section}>
        <span className="eyebrow">em breve</span>
        <div className={sidebarStyles.disabled} aria-disabled="true">
          <Bell className="size-[18px]" aria-hidden="true" />
          <span>Notificações</span>
        </div>
        <div className={sidebarStyles.disabled} aria-disabled="true">
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
  const [createPostOpen, setCreatePostOpen] = useState(false)

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
        <div className={navbarStyles.inner}>
          <div className={navbarStyles.leading}>
            {user && (
              <button
                type="button"
                className={navbarStyles.menuButton}
                onClick={() => setMenuOpen((open) => !open)}
                aria-label="Abrir menu"
                aria-expanded={menuOpen}
              >
                <Menu className="size-5" aria-hidden="true" />
              </button>
            )}
            <Link
              to="/"
              className={navbarStyles.brand}
              aria-label="newkut — início"
            >
              <img className={navbarStyles.logo} src="/newkut.png" alt="" />
              <span>newkut</span>
            </Link>
          </div>

          <form
            role="search"
            onSubmit={handleSearch}
            className={navbarStyles.search}
          >
            <label htmlFor="navbar-search" className="sr-only">
              Buscar pessoas e comunidades
            </label>
            <Search
              className={`${navbarStyles.searchIcon} size-[18px]`}
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

          <div className={navbarStyles.actions}>
            {user && (
              <button
                type="button"
                className="btn small primary"
                onClick={() => setCreatePostOpen(true)}
              >
                <Plus className="size-4" aria-hidden="true" />
                Criar
              </button>
            )}
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
                  className={`avatar-btn ${navbarStyles.avatar}`}
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
      {user && createPostOpen && (
        <CreatePostDialog
          open
          user={user}
          onClose={() => setCreatePostOpen(false)}
        />
      )}
      {user && (
        <Sidebar
          userId={user.id}
          onClose={() => setMenuOpen(false)}
          mobileOpen={menuOpen}
        />
      )}
      {user && menuOpen && (
        <button
          type="button"
          className={`sidebar-overlay ${sidebarStyles.overlay}`}
          aria-label="Fechar menu"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </>
  )
}
