import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../context/AuthContext'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Alert from '../../components/ui/Alert'
import styles from './Auth.module.css'

export default function RegisterPage() {
  const { register: authRegister } = useAuth()
  const navigate    = useNavigate()
  const [serverError, setServerError] = useState('')

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { name: '', email: '', password: '', confirmPassword: '', monthlyBudget: '' },
  })

  const password = watch('password')

  const onSubmit = async ({ confirmPassword: _, ...data }) => {
    setServerError('')
    try {
      await authRegister({
        ...data,
        monthlyBudget: data.monthlyBudget ? parseFloat(data.monthlyBudget) : 0,
      })
      navigate('/dashboard')
    } catch (err) {
      setServerError(err.response?.data?.message || 'Registration failed. Please try again.')
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Create account</h1>
        <p className={styles.subtitle}>Start tracking your expenses today</p>
      </div>

      {serverError && <Alert type="error" message={serverError} className={styles.alert} />}

      <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input
          label="Full name"
          type="text"
          placeholder="Jane Smith"
          autoComplete="name"
          error={errors.name?.message}
          {...register('name', {
            required: 'Name is required',
            minLength: { value: 2, message: 'Name must be at least 2 characters' },
          })}
        />
        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Please enter a valid email',
            },
          })}
        />
        <Input
          label="Password"
          type="password"
          placeholder="Min. 6 characters"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password', {
            required: 'Password is required',
            minLength: { value: 6, message: 'Password must be at least 6 characters' },
          })}
        />
        <Input
          label="Confirm password"
          type="password"
          placeholder="Repeat your password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword', {
            required: 'Please confirm your password',
            validate: (val) => val === password || 'Passwords do not match',
          })}
        />
        <Input
          label="Monthly budget (optional)"
          type="number"
          placeholder="e.g. 500"
          prefix="dt"
          hint="You can always change this later in your profile"
          error={errors.monthlyBudget?.message}
          {...register('monthlyBudget', {
            min: { value: 0, message: 'Budget cannot be negative' },
          })}
        />

        <Button type="submit" fullWidth loading={isSubmitting} size="lg">
          Create account
        </Button>
      </form>

      <p className={styles.footer}>
        Already have an account?{' '}
        <Link to="/login" className={styles.link}>Sign in</Link>
      </p>
    </div>
  )
}