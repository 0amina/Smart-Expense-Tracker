import styles from './Card.module.css'

export default function Card({ children, className = '', padding = 'md', hover = false, ...props }) {
  return (
    <div
      className={[styles.card, styles[padding], hover ? styles.hover : '', className].join(' ')}
      {...props}
    >
      {children}
    </div>
  )
}
