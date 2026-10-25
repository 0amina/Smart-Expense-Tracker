import api from './api'

const unwrap = (res) => res.data?.data ?? res.data

export const transactionService = {
  getAll: async (params = {}) => {
    const res = await api.get('/transactions', { params })
    return unwrap(res)  // { transactions, pagination }
  },

  getById: async (id) => {
    const res = await api.get(`/transactions/${id}`)
    return unwrap(res).transaction
  },

  create: async (payload) => {
    const res = await api.post('/transactions', payload)
    return unwrap(res).transaction
  },

  update: async (id, payload) => {
    const res = await api.put(`/transactions/${id}`, payload)
    return unwrap(res).transaction
  },

  remove: async (id) => {
    await api.delete(`/transactions/${id}`)
  },

  getDashboard: async (params = {}) => {
    const res = await api.get('/dashboard/summary', { params })
    return unwrap(res).summary
  },

  getCategories: async (params = {}) => {
    const res = await api.get('/stats/categories', { params })
    return unwrap(res)
  },

  getMonthly: async (params = {}) => {
    const res = await api.get('/stats/monthly', { params })
    return unwrap(res).monthly
  },

  exportCSV: async () => {
    const res = await api.get('/export/csv', { responseType: 'blob' })
    return res.data
  },
}

export default transactionService