import styles from './Alert.module.css'

const ICONS = {
  error:   '✕',
  success: '✓',
  warning: '⚠',
  info:    'ℹ',
}

export default function Alert({ type = 'info', message, className = '' }) {
  if (!message) return null

  return (
    <div className={[styles.alert, styles[type], className].join(' ')} role="alert">
      <span className={styles.icon}>{ICONS[type]}</span>
      <span>{message}</span>
    </div>
  )
}
