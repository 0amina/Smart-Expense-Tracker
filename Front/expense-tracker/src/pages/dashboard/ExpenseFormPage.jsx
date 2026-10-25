import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import transactionService from '../../services/expenseService'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Button from '../../components/ui/Button'
import Alert from '../../components/ui/Alert'
import Card from '../../components/ui/Card'
import { PageSpinner } from '../../components/ui/Spinner'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../../utils/constants'
import styles from './ExpenseFormPage.module.css'

const TYPE_OPTIONS = [
  { value: 'expense', label: 'Expense' },
  { value: 'income',  label: 'Income'  },
]

export default function ExpenseFormPage() {
  const { id }   = useParams()
  const isEdit   = Boolean(id)
  const navigate = useNavigate()
  const [serverError, setServerError] = useState('')
  const [loading, setLoading]         = useState(isEdit)

  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      type: 'expense',
      description: '',
      amount: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
    },
  })

  const selectedType = watch('type')
  const categoryOptions = (selectedType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES)
    .map((c) => ({ value: c, label: c }))

  useEffect(() => {
    if (!isEdit) return
    transactionService.getById(id)
      .then((t) => reset({
        type:        t.type,
        description: t.description,
        amount:      t.amount,
        category:    t.category,
        date:        t.date?.split('T')[0] ?? '',
      }))
      .catch(() => setServerError('Failed to load transaction.'))
      .finally(() => setLoading(false))
  }, [id, isEdit, reset])

  const onSubmit = async (data) => {
    setServerError('')
    try {
      const payload = { ...data, amount: parseFloat(data.amount) }
      if (isEdit) {
        await transactionService.update(id, payload)
      } else {
        await transactionService.create(payload)
      }
      navigate('/dashboard/expenses')
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to save transaction.')
    }
  }

  if (loading) return <PageSpinner />

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>{isEdit ? 'Edit transaction' : 'Add transaction'}</h1>
          <p className={styles.subtitle}>{isEdit ? 'Update details' : 'Record a new transaction'}</p>
        </div>
        <Button variant="ghost" onClick={() => navigate(-1)}>← Back</Button>
      </div>

      <Card className={styles.formCard}>
        {serverError && <Alert type="error" message={serverError} className={styles.alert} />}

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
          <Select
            label="Type"
            options={TYPE_OPTIONS}
            error={errors.type?.message}
            {...register('type', { required: 'Type is required' })}
          />

          <div className={styles.row}>
            <Input
              label="Description"
              placeholder="e.g. Coffee and lunch"
              error={errors.description?.message}
              {...register('description', {
                required: 'Description is required',
                maxLength: { value: 100, message: 'Max 100 characters' },
              })}
            />
            <Input
              label="Amount"
              type="number"
              placeholder="0.00"
              prefix="$"
              error={errors.amount?.message}
              {...register('amount', {
                required: 'Amount is required',
                min: { value: 0.01, message: 'Must be greater than 0' },
              })}
            />
          </div>

          <div className={styles.row}>
            <Select
              label="Category"
              options={categoryOptions}
              placeholder="Select a category"
              error={errors.category?.message}
              {...register('category', { required: 'Category is required' })}
            />
            <Input
              label="Date"
              type="date"
              error={errors.date?.message}
              {...register('date', { required: 'Date is required' })}
            />
          </div>

          <div className={styles.formActions}>
            <Button variant="secondary" type="button" onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="submit" loading={isSubmitting}>
              {isEdit ? 'Save changes' : 'Add transaction'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}