import { useState, useEffect, useCallback } from 'react'
import { notificationService } from '../services/notificationService'

export function useNotifications() {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount]     = useState(0)
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await notificationService.getAll()
      setNotifications(data.notifications ?? data)
      setUnreadCount(data.unreadCount ?? 0)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const markOneRead = useCallback(async (id) => {
    await notificationService.markOneRead(id)
    setNotifications((prev) =>
      prev.map((n) => n._id === id ? { ...n, read: true } : n)
    )
    setUnreadCount((c) => Math.max(0, c - 1))
  }, [])

  const markAllRead = useCallback(async () => {
    await notificationService.markAllRead()
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
  }, [])

  const deleteOne = useCallback(async (id) => {
    await notificationService.deleteOne(id)
    setNotifications((prev) => {
      const target = prev.find((n) => n._id === id)
      if (target && !target.read) setUnreadCount((c) => Math.max(0, c - 1))
      return prev.filter((n) => n._id !== id)
    })
  }, [])

  const clearAll = useCallback(async () => {
    await notificationService.clearAll()
    setNotifications([])
    setUnreadCount(0)
  }, [])

  return { notifications, unreadCount, loading, error, refetch: fetch, markOneRead, markAllRead, deleteOne, clearAll }
}