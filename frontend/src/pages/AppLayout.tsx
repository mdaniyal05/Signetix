import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom"
import { MessageSquare, Phone, Settings, Wifi, WifiOff } from "lucide-react"
import { useAppContext } from "../context/AppContext"
import { getStorageValue } from "../context/storage"
import { useEffect } from "react"
import type { User } from "../api/user/login-user-mutation"
import styles from "./AppLayout.module.css"

const NAV_ITEMS = [
  { to: "/app/calls", label: "Calls", Icon: Phone },
  { to: "/app/chats", label: "Chats", Icon: MessageSquare },
  { to: "/app/settings", label: "Settings", Icon: Settings },
]

const AppLayout = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { setPhoneNumber, setUser, user, isConnected } = useAppContext()

  // Rehydrate context from localStorage on hard reload
  useEffect(() => {
    if (!user) {
      const raw = getStorageValue("user")
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as User
          setUser(parsed)
          setPhoneNumber(parsed.phoneNumber)
        } catch {
          navigate("/", { replace: true })
        }
      } else {
        navigate("/", { replace: true })
      }
    }
  }, [user, setUser, setPhoneNumber, navigate])

  // Hide sidebar on mobile when inside a specific chat room
  const isChatRoom = /^\/app\/chats\/[^/]+$/.test(location.pathname)

  const initial = user?.name?.charAt(0)?.toUpperCase() ?? "?"

  return (
    <div className={styles.shell}>
      {/* Sidebar */}
      <aside
        className={`${styles.sidebar} ${isChatRoom ? styles.hiddenOnMobile : ""}`}
      >
        {/* Brand */}
        <div className={styles.sidebarBrand}>
          <span className={styles.brandName}>Signetix</span>
          <span
            className={styles.connectionDot}
            title={isConnected ? "Connected" : "Disconnected"}
          >
            {isConnected ? (
              <Wifi size={14} color="var(--green)" />
            ) : (
              <WifiOff size={14} color="var(--gray)" />
            )}
          </span>
        </div>

        {/* Nav */}
        <nav className={styles.nav}>
          {NAV_ITEMS.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
              }
            >
              <Icon size={20} />
              <span className={styles.navLabel}>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User chip at the bottom */}
        <div className={styles.userChip}>
          <div className={styles.userAvatar}>
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.name}
                className={styles.avatarImg}
              />
            ) : (
              <span className={styles.avatarInitial}>{initial}</span>
            )}
          </div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user?.name ?? "…"}</span>
            <span className={styles.userPhone}>{user?.phoneNumber ?? ""}</span>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main
        className={`${styles.content} ${isChatRoom ? styles.fullWidthOnMobile : ""}`}
      >
        <Outlet />
      </main>
    </div>
  )
}

export default AppLayout
