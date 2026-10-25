import { forwardRef } from 'react'
import styles from './Input.module.css'

const Input = forwardRef(function Input(
  { label, error, hint, icon, prefix, type = 'text', className = '', id, ...props },
  ref
) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className={[styles.wrapper, className].join(' ')}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}
      <div className={[styles.inputWrapper, error ? styles.hasError : ''].join(' ')}>
        {icon && <span className={styles.icon}>{icon}</span>}
        {prefix && <span className={styles.prefix}>{prefix}</span>}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={[styles.input, icon ? styles.withIcon : '', prefix ? styles.withPrefix : ''].join(' ')}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
      </div>
      {error && (
        <span id={`${inputId}-error`} className={styles.error} role="alert">
          {error}
        </span>
      )}
      {!error && hint && (
        <span id={`${inputId}-hint`} className={styles.hint}>
          {hint}
        </span>
      )}
    </div>
  )
})

export default Input
