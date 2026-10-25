import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTransactions } from '../../hooks/useExpenses'
import transactionService from '../../services/expenseService'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Alert from '../../components/ui/Alert'
import Modal from '../../components/ui/Modal'
import Select from '../../components/ui/Select'
import Input from '../../components/ui/Input'
import { PageSpinner } from '../../components/ui/Spinner'
import { formatCurrency, formatDate, getCategoryIcon } from '../../utils/formatters'
import { EXPENSE_CATEGORIES } from '../../utils/constants'
import styles from './ExpensesPage.module.css'

const TYPE_OPTIONS = [
  { value: '',        label: 'All types' },
  { value: 'expense', label: 'Expenses' },
  { value: 'income',  label: 'Income' },
]

const CATEGORY_OPTIONS = [
  { value: '', label: 'All categories' },
  ...EXPENSE_CATEGORIES.map((c) => ({ value: c, label: c })),
]

export default function ExpensesPage() {
  const [typeFilter, setTypeFilter]         = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [search, setSearch]                 = useState('')
  const [deleteTarget, setDeleteTarget]     = useState(null)
  const [deleteLoading, setDeleteLoading]   = useState(false)
  const [actionError, setActionError]       = useState('')

  const params = {}
  if (typeFilter)     params.type     = typeFilter
  if (categoryFilter) params.category = categoryFilter
  if (search)         params.search   = search

  const { transactions, pagination, loading, error, deleteTransaction } = useTransactions(params)

  const handleDelete = async () => {
    setDeleteLoading(true)
    setActionError('')
    try {
      await deleteTransaction(deleteTarget._id)
      setDeleteTarget(null)
    } catch {
      setActionError('Failed to delete. Please try again.')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleExportCSV = async () => {
    try {
      const blob = await transactionService.exportCSV()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Export failed.')
    }
  }

  if (loading) return <PageSpinner />

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Transactions</h1>
          <p className={styles.subtitle}>
            {pagination?.total ?? transactions.length} total
          </p>
        </div>
        <div className={styles.headerActions}>
          <Button variant="secondary" onClick={handleExportCSV}>⬇ CSV</Button>
          <Link to="/dashboard/add"><Button>+ Add new</Button></Link>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.toolbar}>
        <Input
          placeholder="Search descriptions…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />
        <Select options={TYPE_OPTIONS}     value={typeFilter}     onChange={(e) => setTypeFilter(e.target.value)}     className={styles.filter} />
        <Select options={CATEGORY_OPTIONS} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className={styles.filter} />
      </div>

      {error       && <Alert type="error" message={error} />}
      {actionError && <Alert type="error" message={actionError} />}

      {transactions.length === 0 ? (
        <Card>
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>📭</span>
            <p>No transactions found</p>
            <Link to="/dashboard/add"><Button size="sm">Add one</Button></Link>
          </div>
        </Card>
      ) : (
        <div className={styles.list}>
          {transactions.map((t, i) => (
            <Card key={t._id} className={styles.expenseCard} style={{ animationDelay: `${i * 40}ms` }}>
              <div className={styles.expenseRow}>
                <span className={styles.icon}>{getCategoryIcon(t.category)}</span>
                <div className={styles.info}>
                  <div className={styles.description}>{t.description}</div>
                  <div className={styles.meta}>
                    <Badge category={t.category} />
                    <span className={[styles.typeBadge, t.type === 'income' ? styles.income : styles.expense].join(' ')}>
                      {t.type}
                    </span>
                    <span className={styles.date}>{formatDate(t.date)}</span>
                  </div>
                </div>
                <div className={styles.right}>
                  <div className={[styles.amount, t.type === 'income' ? styles.incomeAmt : styles.expenseAmt].join(' ')}>
                    {t.type === 'income' ? '+' : '−'}{formatCurrency(t.amount)}
                  </div>
                  <div className={styles.actions}>
                    <Link to={`/dashboard/expenses/${t._id}/edit`}>
                      <button className={styles.actionBtn} title="Edit">✏️</button>
                    </Link>
                    <button className={[styles.actionBtn, styles.deleteBtn].join(' ')} onClick={() => setDeleteTarget(t)} title="Delete">🗑️</button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete transaction?">
        <p className={styles.deleteText}>
          Delete <strong>"{deleteTarget?.description}"</strong> ({formatCurrency(deleteTarget?.amount)})? This cannot be undone.
        </p>
        <div className={styles.deleteActions}>
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete} loading={deleteLoading}>Delete</Button>
        </div>
      </Modal>
    </div>
  )
}