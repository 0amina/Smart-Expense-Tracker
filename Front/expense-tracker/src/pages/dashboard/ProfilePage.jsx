import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../context/AuthContext'
import { authService } from '../../services/authService'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Alert from '../../components/ui/Alert'
import styles from './ProfilePage.module.css'

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuth()
  const [success, setSuccess]        = useState('')
  const [error, setError]            = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      name:          user?.name          || '',
      email:         user?.email         || '',
      monthlyBudget: user?.monthlyBudget || '',
    },
  })

  const onSubmit = async (data) => {
    setSuccess('')
    setError('')
    try {
      const updated = await authService.updateProfile({
        ...data,
        monthlyBudget: data.monthlyBudget ? parseFloat(data.monthlyBudget) : 0,
      })
      updateUser(updated)
      setSuccess('Profile updated successfully!')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.')
    }
  }

  const initial = user?.name?.[0]?.toUpperCase() || 'U'

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Profile</h1>

      <div className={styles.grid}>
        <Card className={styles.avatarCard}>
          <div className={styles.avatar}>{initial}</div>
          <div className={styles.avatarName}>{user?.name}</div>
          <div className={styles.avatarEmail}>{user?.email}</div>
          {user?.monthlyBudget > 0 && (
            <div className={styles.budgetBadge}>
              Budget: ${user.monthlyBudget}/mo
            </div>
          )}
          <Button variant="danger" fullWidth size="sm" onClick={logout} className={styles.logoutBtn}>
            Sign out
          </Button>
        </Card>

        <Card>
          <h2 className={styles.sectionTitle}>Account details</h2>

          {success && <Alert type="success" message={success} className={styles.alert} />}
          {error   && <Alert type="error"   message={error}   className={styles.alert} />}

          <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
            <Input
              label="Full name"
              error={errors.name?.message}
              {...register('name', {
                required: 'Name is required',
                minLength: { value: 2, message: 'Minimum 2 characters' },
              })}
            />
            <Input
              label="Email address"
              type="email"
              error={errors.email?.message}
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Invalid email address',
                },
              })}
            />
            <Input
              label="Monthly budget"
              type="number"
              placeholder="e.g. 500"
              prefix="$"
              hint="Set to 0 to disable budget tracking"
              error={errors.monthlyBudget?.message}
              {...register('monthlyBudget', {
                min: { value: 0, message: 'Budget cannot be negative' },
              })}
            />
            <Button type="submit" loading={isSubmitting}>Save changes</Button>
          </form>
        </Card>
      </div>
    </div>
  )
}