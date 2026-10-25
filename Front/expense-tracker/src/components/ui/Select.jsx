import { forwardRef } from 'react'
import styles from './Select.module.css'

const Select = forwardRef(function Select(
  { label, error, options = [], placeholder, id, className = '', ...props },
  ref
) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className={[styles.wrapper, className].join(' ')}>
      {label && <label htmlFor={selectId} className={styles.label}>{label}</label>}
      <div className={[styles.selectWrapper, error ? styles.hasError : ''].join(' ')}>
        <select ref={ref} id={selectId} className={styles.select} {...props}>
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <span className={styles.arrow}>▾</span>
      </div>
      {error && <span className={styles.error} role="alert">{error}</span>}
    </div>
  )
})

export default Select
