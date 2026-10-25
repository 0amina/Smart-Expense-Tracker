import { useEffect } from 'react'
import styles from './Modal.module.css'
import Button from './Button'

export default function Modal({ isOpen, onClose, title, children, maxWidth = '500px' }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose() }
    if (isOpen) document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true" aria-label={title}>
      <div
        className={styles.modal}
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close modal">✕</Button>
        </div>
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  )
}
