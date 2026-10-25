import { useState, useEffect, useCallback } from 'react'
import transactionService from '../services/expenseService'

export function useTransactions(params = {}) {
  const [transactions, setTransactions] = useState([])
  const [pagination, setPagination]     = useState(null)
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)

  const fetchTransactions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await transactionService.getAll(params)
      setTransactions(data.transactions ?? [])
      setPagination(data.pagination ?? null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load transactions')
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(params)])

  useEffect(() => { fetchTransactions() }, [fetchTransactions])

  const createTransaction = useCallback(async (payload) => {
    const t = await transactionService.create(payload)
    setTransactions((prev) => [t, ...prev])
    return t
  }, [])

  const updateTransaction = useCallback(async (id, payload) => {
    const t = await transactionService.update(id, payload)
    setTransactions((prev) => prev.map((x) => (x._id === id ? t : x)))
    return t
  }, [])

  const deleteTransaction = useCallback(async (id) => {
    await transactionService.remove(id)
    setTransactions((prev) => prev.filter((x) => x._id !== id))
  }, [])

  return {
    transactions, pagination, loading, error,
    refetch: fetchTransactions,
    createTransaction, updateTransaction, deleteTransaction,
  }
}