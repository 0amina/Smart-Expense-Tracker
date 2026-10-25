import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import transactionService from '../../services/expenseService'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { PageSpinner } from '../../components/ui/Spinner'
import Alert from '../../components/ui/Alert'
import Button from '../../components/ui/Button'
import { formatCurrency, formatDate, getCategoryIcon } from '../../utils/formatters'
import styles from './OverviewPage.module.css'

export default function OverviewPage() {
  const { user } = useAuth()
  const [summary, setSummary]               = useState(null)
  const [recentTransactions, setRecent]     = useState([])
  const [loading, setLoading]               = useState(true)
  const [error, setError]                   = useState(null)

  useEffect(() => {
    const now = new Date()
    Promise.all([
      transactionService.getDashboard({ month: now.getMonth() + 1, year: now.getFullYear() }),
      transactionService.getAll({ limit: 5 }),
    ])
      .then(([sum, txData]) => {
        setSummary(sum)
        setRecent(txData.transactions ?? [])
      })
      .catch(() => setError('Failed to load dashboard data'))
      .finally(() => setLoading(false))
  }, [])

  const handleExportCSV = async () => {
    try {
      const blob = await transactionService.exportCSV()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `expenses-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Export failed. Please try again.')
    }
  }

  if (loading) return <PageSpinner />

  const budgetPct  = summary?.budgetUsedPercent ?? 0
  const statusColor = {
    on_track: 'var(--green)',
    warning:  'var(--amber)',
    exceeded: 'var(--red)',
    not_set:  'var(--text-muted)',
  }[summary?.budgetStatus ?? 'not_set']

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.greeting}>
            Good day, {user?.name?.split(' ')[0] || 'there'} 👋
          </h1>
          <p className={styles.subheading}>Here's your financial snapshot</p>
        </div>
        <div className={styles.headerActions}>
          <Button variant="secondary" size="md" onClick={handleExportCSV}>⬇ Export CSV</Button>
          <Link to="/dashboard/add"><Button size="md">+ Add Transaction</Button></Link>
        </div>
      </div>

      {error && <Alert type="error" message={error} />}

      {/* Stat cards */}
      <div className={styles.statsGrid}>
        <StatCard icon="💰" label="Income this month"   value={formatCurrency(summary?.totalIncome ?? 0)}    />
        <StatCard icon="💳" label="Expenses this month" value={formatCurrency(summary?.totalExpenses ?? 0)}  />
        <StatCard icon="⚖️" label="Balance"             value={formatCurrency(summary?.balance ?? 0)}        />
        <StatCard
          icon="📊"
          label="Budget used"
          value={`${budgetPct}%`}
          sub={summary?.monthlyBudget ? `of ${formatCurrency(summary.monthlyBudget)}` : 'No budget set'}
          valueStyle={{ color: statusColor }}
        />
      </div>

      {/* Budget bar */}
      {summary?.monthlyBudget > 0 && (
        <Card className={styles.budgetCard}>
          <div className={styles.budgetHeader}>
            <span className={styles.budgetLabel}>Monthly budget</span>
            <span className={styles.budgetStatus} style={{ color: statusColor }}>
              {summary.budgetStatus?.replace('_', ' ')}
            </span>
          </div>
          <div className={styles.budgetTrack}>
            <div
              className={styles.budgetFill}
              style={{
                width: `${Math.min(budgetPct, 100)}%`,
                background: statusColor,
              }}
            />
          </div>
          <div className={styles.budgetMeta}>
            <span>{formatCurrency(summary.totalExpenses)} spent</span>
            <span>{formatCurrency(summary.monthlyBudget)} budget</span>
          </div>
        </Card>
      )}

      {/* Recent transactions */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Recent transactions</h2>
          <Link to="/dashboard/expenses" className={styles.seeAll}>View all →</Link>
        </div>

        {recentTransactions.length === 0 ? (
          <Card>
            <div className={styles.empty}>
              <span className={styles.emptyIcon}>💸</span>
              <p>No transactions yet. <Link to="/dashboard/add" className={styles.emptyLink}>Add your first one!</Link></p>
            </div>
          </Card>
        ) : (
          <div className={styles.expenseList}>
            {recentTransactions.map((t, i) => (
              <Card key={t._id} className={styles.expenseCard} style={{ animationDelay: `${i * 60}ms` }}>
                <div className={styles.expenseRow}>
                  <span className={styles.expenseCategoryIcon}>{getCategoryIcon(t.category)}</span>
                  <div className={styles.expenseInfo}>
                    <div className={styles.expenseTitle}>{t.description}</div>
                    <div className={styles.expenseMeta}>
                      <Badge category={t.category} />
                      <span className={styles.expenseDate}>{formatDate(t.date)}</span>
                    </div>
                  </div>
                  <div className={[styles.expenseAmount, t.type === 'income' ? styles.income : styles.expense].join(' ')}>
                    {t.type === 'income' ? '+' : '−'}{formatCurrency(t.amount)}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, sub, valueStyle }) {
  return (
    <Card className={styles.statCard}>
      <span className={styles.statIcon}>{icon}</span>
      <div className={styles.statValue} style={valueStyle}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
      {sub && <div className={styles.statSub}>{sub}</div>}
    </Card>
  )
}