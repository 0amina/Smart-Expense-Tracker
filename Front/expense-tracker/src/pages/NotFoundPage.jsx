import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'
import styles from './NotFoundPage.module.css'

export default function NotFoundPage() {
  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.code}>404</div>
        <h1 className={styles.title}>Page not found</h1>
        <p className={styles.desc}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/dashboard">
          <Button size="lg">Go to dashboard</Button>
        </Link>
      </div>
    </div>
  )
}
