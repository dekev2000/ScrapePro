import { ref, reactive } from 'vue'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: number
  message: string
  type: ToastType
  duration: number
  timestamp: Date
  read: boolean
  action?: {
    text: string
    callback: () => void
  }
}

// Create a reactive state that will be shared across all instances
const toasts = reactive<Toast[]>([])
const notificationHistory = reactive<Toast[]>([])
const unreadCount = ref(0)
let nextId = 1

export function useToast() {
  const defaultDuration = 5000 // 5 seconds

  // Add a new toast
  const add = (message: string, type: ToastType = 'info', duration: number = defaultDuration, action?: { text: string, callback: () => void }) => {
    const id = nextId++
    const timestamp = new Date()
    const toast: Toast = {
      id,
      message,
      type,
      duration,
      timestamp,
      read: false,
      action
    }

    // Add to active toasts
    toasts.push(toast)

    // Add to notification history (limited to last 50)
    notificationHistory.unshift({ ...toast })
    if (notificationHistory.length > 50) {
      notificationHistory.pop()
    }

    // Increment unread count
    unreadCount.value++

    // Auto-remove toast after duration
    if (duration > 0) {
      setTimeout(() => {
        remove(id)
      }, duration)
    }

    return id
  }

  // Shorthand methods for different toast types
  const success = (message: string, duration?: number, action?: { text: string, callback: () => void }) => {
    return add(message, 'success', duration, action)
  }

  const error = (message: string, duration?: number, action?: { text: string, callback: () => void }) => {
    return add(message, 'error', duration, action)
  }

  const info = (message: string, duration?: number, action?: { text: string, callback: () => void }) => {
    return add(message, 'info', duration, action)
  }

  const warning = (message: string, duration?: number, action?: { text: string, callback: () => void }) => {
    return add(message, 'warning', duration, action)
  }

  // Remove a toast by id
  const remove = (id: number) => {
    const index = toasts.findIndex(toast => toast.id === id)
    if (index !== -1) {
      toasts.splice(index, 1)
    }
  }

  // Clear all toasts
  const clear = () => {
    toasts.splice(0, toasts.length)
  }

  // Mark all notifications as read
  const markAllAsRead = () => {
    notificationHistory.forEach(notification => {
      notification.read = true
    })
    unreadCount.value = 0
  }

  // Mark a specific notification as read
  const markAsRead = (id: number) => {
    const notification = notificationHistory.find(n => n.id === id)
    if (notification && !notification.read) {
      notification.read = true
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    }
  }

  // Clear notification history
  const clearHistory = () => {
    notificationHistory.splice(0, notificationHistory.length)
    unreadCount.value = 0
  }

  return {
    toasts,
    notificationHistory,
    unreadCount,
    add,
    success,
    error,
    info,
    warning,
    remove,
    clear,
    markAllAsRead,
    markAsRead,
    clearHistory
  }
}
