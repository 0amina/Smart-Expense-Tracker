import { useState } from 'react'
import { useNotifications } from '../../hooks/useNotifications'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Alert from '../../components/ui/Alert'
import Modal from '../../components/ui/Modal'
import { PageSpinner } from '../../components/ui/Spinner'
import { formatDate, getNotificationIcon, getNotificationColor } from '../../utils/formatters'
import styles from './NotificationsPage.module.css'

const TYPE_LABELS = {
  budget_warning:    'Budget Warning',
  budget_exceeded:   'Budget Exceeded',
  large_transaction: 'Large Transaction',
}

export default function NotificationsPage() {
  const { notifications, unreadCount, loading, error, markOneRead, markAllRead, deleteOne, clearAll } = useNotifications()
  const [clearModal, setClearModal] = useState(false)
  const [clearLoading, setClearLoading] = useState(false)
  const [filter, setFilter] = useState('all') // all | unread

  const handleClearAll = async () => {
    setClearLoading(true)
    await clearAll()
    setClearLoading(false)
    setClearModal(false)
  }

  const displayed = filter === 'unread'
    ? notifications.filter((n) => !n.read)
    : notifications

  if (loading) return <PageSpinner />

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Notifications</h1>
          <p className={styles.subtitle}>
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        <div className={styles.headerActions}>
          {unreadCount > 0 && (
            <Button variant="secondary" size="sm" onClick={markAllRead}>
              ✓ Mark all read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button variant="danger" size="sm" onClick={() => setClearModal(true)}>
              🗑 Clear all
            </Button>
          )}
        </div>
      </div>

      {error && <Alert type="error" message={error} />}

      {/* Filter tabs */}
      <div className={styles.tabs}>
        <button
          className={[styles.tab, filter === 'all' ? styles.activeTab : ''].join(' ')}
          onClick={() => setFilter('all')}
        >
          All ({notifications.length})
        </button>
        <button
          className={[styles.tab, filter === 'unread' ? styles.activeTab : ''].join(' ')}
          onClick={() => setFilter('unread')}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {displayed.length === 0 ? (
        <Card>
          <div className={styles.empty}>
            <span>🎉</span>
            <p>{filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}</p>
          </div>
        </Card>
      ) : (
        <div className={styles.list}>
          {displayed.map((n, i) => (
            <Card
              key={n._id}
              className={[styles.card, n.read ? styles.read : styles.unread].join(' ')}
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className={styles.row}>
                <div className={styles.iconWrap} style={{ background: getNotificationColor(n.type) + '22' }}>
                  <span style={{ color: getNotificationColor(n.type) }}>
                    {getNotificationIcon(n.type)}
                  </span>
                </div>

                <div className={styles.body}>
                  <div className={styles.typeLabel} style={{ color: getNotificationColor(n.type) }}>
                    {TYPE_LABELS[n.type] ?? n.type}
                  </div>
                  <p className={styles.message}>{n.message}</p>
                  <span className={styles.date}>{formatDate(n.createdAt)}</span>
                </div>

                <div className={styles.actions}>
                  {!n.read && (
                    <button className={styles.readBtn} onClick={() => markOneRead(n._id)} title="Mark as read">
                      ✓
                    </button>
                  )}
                  <button className={styles.deleteBtn} onClick={() => deleteOne(n._id)} title="Delete">
                    🗑️
                  </button>
                </div>
              </div>

              {!n.read && <span className={styles.dot} />}
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={clearModal} onClose={() => setClearModal(false)} title="Clear all notifications?">
        <p className={styles.modalText}>
          This will permanently delete all {notifications.length} notifications. This cannot be undone.
        </p>
        <div className={styles.modalActions}>
          <Button variant="secondary" onClick={() => setClearModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleClearAll} loading={clearLoading}>Clear all</Button>
        </div>
      </Modal>
    </div>
  )
}