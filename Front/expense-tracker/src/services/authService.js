import api from './api'

const unwrap = (res) => res.data?.data ?? res.data

export const authService = {
  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials)
    return unwrap(res)
  },
  register: async (payload) => {
    const res = await api.post('/auth/register', payload)
    return unwrap(res)
  },
  getProfile: async () => {
    const res = await api.get('/auth/me')
    return unwrap(res).user
  },
  updateProfile: async (payload) => {
    const res = await api.put('/auth/me', payload)
    return unwrap(res).user
  },
}