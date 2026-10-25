import api from './api'

const unwrap = (res) => res.data?.data ?? res.data

export const notificationService = {
  getAll: async (params = {}) => {
    const res = await api.get('/notifications', { params })
    return unwrap(res)
  },

  markOneRead: async (id) => {
    const res = await api.patch(`/notifications/${id}/read`)
    return unwrap(res)
  },

  markAllRead: async () => {
    const res = await api.patch('/notifications/read-all')
    return unwrap(res)
  },

  deleteOne: async (id) => {
    await api.delete(`/notifications/${id}`)
  },

  clearAll: async () => {
    await api.delete('/notifications')
  },
}