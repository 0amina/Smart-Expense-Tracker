import { Link, Outlet } from 'react-router-dom'
import styles from './AuthLayout.module.css'

const FEATURES = [
  { icon: '📊', text: 'Track income & expenses in one place' },
  { icon: '🎯', text: 'Set monthly budgets and get alerts' },
  { icon: '📈', text: 'Visualize spending by category' },
  { icon: '📥', text: 'Export your data anytime as CSV' },
]

export default function AuthLayout() {
  return (
    <div className={styles.root}>
      <div className={styles.brand}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoMark}>S</span>
          <span className={styles.logoText}>Spendly</span>
        </Link>

        <div className={styles.tagline}>Control your expenses.</div>

        <p className={styles.description}>
          Spendly helps you understand where your money goes.
          Log transactions, track budgets, and get notified
          before you overspend — all in one clean dashboard.
        </p>

        <ul className={styles.features}>
          {FEATURES.map(({ icon, text }) => (
            <li key={text} className={styles.feature}>
              <span className={styles.featureIcon}>{icon}</span>
              <span>{text}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.form}>
        <Outlet />
      </div>
    </div>
  )
}