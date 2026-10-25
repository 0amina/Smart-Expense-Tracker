import styles from './Spinner.module.css'

export default function Spinner({ size = 'md', label = 'Loading…' }) {
  return (
    <div className={styles.wrapper} role="status" aria-label={label}>
      <div className={[styles.spinner, styles[size]].join(' ')} />
      <span className="sr-only">{label}</span>
    </div>
  )
}

export function PageSpinner() {
  return (
    <div className={styles.page}>
      <Spinner size="lg" />
    </div>
  )
}
