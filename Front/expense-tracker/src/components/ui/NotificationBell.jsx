import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useNotifications } from '../../hooks/useNotifications'
import { formatDate, getNotificationIcon, getNotificationColor } from '../../utils/formatters'
import styles from './NotificationBell.module.css'

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const { notifications, unreadCount, loading, markOneRead, markAllRead, deleteOne } = useNotifications()

  // close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleMarkOne = async (n) => {
    if (!n.read) await markOneRead(n._id)
  }

  const recent = notifications.slice(0, 5)

  return (
    <div className={styles.wrapper} ref={ref}>
      <button
        className={styles.bell}
        onClick={() => setOpen((o) => !o)}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        🔔
        {unreadCount > 0 && (
          <span className={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {open && (
        <div className={styles.dropdown}>
          <div className={styles.header}>
            <span className={styles.title}>Notifications</span>
            {unreadCount > 0 && (
              <button className={styles.markAll} onClick={markAllRead}>
                Mark all read
              </button>
            )}
          </div>

          <div className={styles.list}>
            {loading && <div className={styles.empty}>Loading…</div>}

            {!loading && recent.length === 0 && (
              <div className={styles.empty}>
                <span>🎉</span>
                <p>You're all caught up!</p>
              </div>
            )}

            {!loading && recent.map((n) => (
              <div
                key={n._id}
                className={[styles.item, n.read ? styles.read : styles.unread].join(' ')}
                onClick={() => handleMarkOne(n)}
              >
                <span className={styles.icon} style={{ color: getNotificationColor(n.type) }}>
                  {getNotificationIcon(n.type)}
                </span>
                <div className={styles.content}>
                  <p className={styles.message}>{n.message}</p>
                  <span className={styles.date}>{formatDate(n.createdAt)}</span>
                </div>
                <button
                  className={styles.delete}
                  onClick={(e) => { e.stopPropagation(); deleteOne(n._id) }}
                  title="Dismiss"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className={styles.footer}>
            <Link to="/dashboard/notifications" onClick={() => setOpen(false)} className={styles.viewAll}>
              View all notifications →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}