import styles from './Button.module.css'

const VARIANTS = { primary: 'primary', secondary: 'secondary', ghost: 'ghost', danger: 'danger' }
const SIZES    = { sm: 'sm', md: 'md', lg: 'lg' }

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  type = 'button',
  onClick,
  className = '',
  ...props
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={[
        styles.btn,
        styles[VARIANTS[variant] || 'primary'],
        styles[SIZES[size] || 'md'],
        fullWidth ? styles.fullWidth : '',
        loading ? styles.loading : '',
        className,
      ].join(' ')}
      {...props}
    >
      {loading && <span className={styles.spinner} aria-hidden="true" />}
      <span className={styles.label}>{children}</span>
    </button>
  )
}
