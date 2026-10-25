import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import NotificationBell from '../components/ui/NotificationBell'
import styles from './DashboardLayout.module.css'

const NAV_ITEMS = [
  { to: '/dashboard',               icon: '⬛', label: 'Overview',       end: true },
  { to: '/dashboard/expenses',      icon: '📋', label: 'Transactions' },
  { to: '/dashboard/add',           icon: '＋', label: 'Add Transaction' },
  { to: '/dashboard/notifications', icon: '🔔', label: 'Notifications' },
  { to: '/dashboard/profile',       icon: '👤', label: 'Profile' },
]

export default function DashboardLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className={styles.root}>
      {sidebarOpen && <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />}

      <aside className={[styles.sidebar, sidebarOpen ? styles.open : ''].join(' ')}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            <span className={styles.logoMark}>S</span>
            <span className={styles.logoText}>Spendly</span>
          </div>
        </div>

        <nav className={styles.nav}>
          {NAV_ITEMS.map(({ to, icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => [styles.navItem, isActive ? styles.active : ''].join(' ')}
              onClick={() => setSidebarOpen(false)}
            >
              <span className={styles.navIcon}>{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>{user?.name?.[0]?.toUpperCase() || 'U'}</div>
            <div className={styles.userDetails}>
              <div className={styles.userName}>{user?.name || 'User'}</div>
              <div className={styles.userEmail}>{user?.email}</div>
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout} title="Logout">⏻</button>
        </div>
      </aside>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <button className={styles.menuBtn} onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle menu">
            ☰
          </button>
          <div className={styles.topbarRight}>
            <NotificationBell />
            <div className={styles.topbarAvatar}>{user?.name?.[0]?.toUpperCase() || 'U'}</div>
          </div>
        </header>

        <div className={styles.content}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}