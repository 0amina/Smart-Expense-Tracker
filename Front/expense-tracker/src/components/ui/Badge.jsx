import styles from './Badge.module.css'

const COLORS = {
  food:          { bg: '#FFF3E0', color: '#E65100' },
  transport:     { bg: '#E3F2FD', color: '#1565C0' },
  housing:       { bg: '#E8F5E9', color: '#2E7D32' },
  health:        { bg: '#FCE4EC', color: '#AD1457' },
  entertainment: { bg: '#F3E5F5', color: '#6A1B9A' },
  shopping:      { bg: '#FFF8E1', color: '#F57F17' },
  education:     { bg: '#E0F7FA', color: '#006064' },
  utilities:     { bg: '#EFEBE9', color: '#4E342E' },
  other:         { bg: '#F5F5F5', color: '#424242' },
}

export default function Badge({ category, label, className = '' }) {
  const cat = category?.toLowerCase() || 'other'
  const style = COLORS[cat] || COLORS.other

  return (
    <span
      className={[styles.badge, className].join(' ')}
      style={{ background: style.bg, color: style.color }}
    >
      {label || category || 'Other'}
    </span>
  )
}
