export function formatCurrency(amount, currency = 'USD') {
  if (amount == null) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(dateStr))
}

export function getCategoryIcon(category) {
  const icons = {
    food:          '🛒',
    transport:     '🚗',
    housing:       '🏠',
    health:        '💊',
    entertainment: '🎬',
    shopping:      '🛍️',
    education:     '📚',
    utilities:     '⚡',
    other:         '📦',
  }
  return icons[category?.toLowerCase()] ?? '📦'
}

export function truncate(str, maxLen = 40) {
  if (!str) return ''
  return str.length > maxLen ? str.slice(0, maxLen) + '…' : str
}

export function getNotificationIcon(type) {
  const icons = {
    budget_warning:    '⚠️',
    budget_exceeded:   '🚨',
    large_transaction: '💸',
  }
  return icons[type] ?? '🔔'
}

export function getNotificationColor(type) {
  const colors = {
    budget_warning:    'var(--amber)',
    budget_exceeded:   'var(--red)',
    large_transaction: 'var(--blue)',
  }
  return colors[type] ?? 'var(--text-muted)'
}
