<template>
  <div class="notification-center">
    <div
      class="notification-icon"
      @click="toggleNotificationPanel"
    >
      <i class="fas fa-bell"></i>
      <span
        v-if="unreadCount > 0"
        class="notification-badge"
      >{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
    </div>

    <div
      v-if="showNotifications"
      class="notification-panel"
    >
      <div class="notification-header">
        <h3>Notifications</h3>
        <div class="notification-actions">
          <button
            v-if="unreadCount > 0"
            class="action-btn"
            @click="markAllAsRead"
          >
            <i class="fas fa-check-double"></i> Mark all as read
          </button>
          <button
            v-if="notificationHistory.length > 0"
            class="action-btn"
            @click="clearHistory"
          >
            <i class="fas fa-trash"></i> Clear all
          </button>
        </div>
      </div>

      <div
        v-if="notificationHistory.length === 0"
        class="empty-notifications"
      >
        <i class="fas fa-bell-slash"></i>
        <p>No notifications</p>
      </div>

      <div
        v-else
        class="notification-list"
      >
        <div
          v-for="notification in notificationHistory"
          :key="notification.id"
          :class="['notification-item', { unread: !notification.read }, `type-${notification.type}`]"
          @click="markAsRead(notification.id)"
        >
          <div class="notification-icon">
            <i :class="getIconClass(notification.type)"></i>
          </div>
          <div class="notification-content">
            <div class="notification-message">{{ notification.message }}</div>
            <div class="notification-time">{{ formatTime(notification.timestamp) }}</div>
          </div>
          <div
            v-if="!notification.read"
            class="unread-indicator"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useToast } from '@/composables/useToast'

const toast = useToast()
const showNotifications = ref(false)

// Computed properties
const notificationHistory = computed(() => toast.notificationHistory)
const unreadCount = computed(() => toast.unreadCount)

// Methods
const toggleNotificationPanel = () => {
  showNotifications.value = !showNotifications.value
}

const markAllAsRead = () => {
  toast.markAllAsRead()
}

const markAsRead = (id: number) => {
  toast.markAsRead(id)
}

const clearHistory = () => {
  toast.clearHistory()
}

const getIconClass = (type: string) => {
  switch (type) {
    case 'success':
      return 'fas fa-check-circle'
    case 'error':
      return 'fas fa-exclamation-circle'
    case 'warning':
      return 'fas fa-exclamation-triangle'
    case 'info':
    default:
      return 'fas fa-info-circle'
  }
}

const formatTime = (timestamp: Date) => {
  if (!timestamp) return ''
  
  const now = new Date()
  const diff = now.getTime() - new Date(timestamp).getTime()
  
  // Less than a minute
  if (diff < 60 * 1000) {
    return 'Just now'
  }
  
  // Less than an hour
  if (diff < 60 * 60 * 1000) {
    const minutes = Math.floor(diff / (60 * 1000))
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`
  }
  
  // Less than a day
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000))
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`
  }
  
  // Less than a week
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000))
    return `${days} ${days === 1 ? 'day' : 'days'} ago`
  }
  
  // Format as date
  return new Date(timestamp).toLocaleDateString()
}

// Close notification panel when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (showNotifications.value && !target.closest('.notification-center')) {
    showNotifications.value = false
  }
}

// Lifecycle hooks
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.notification-center {
  position: relative;
}

.notification-icon {
  position: relative;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #6b7280;
  transition: color 0.2s;
}

.notification-icon:hover {
  color: #4b5563;
}

.notification-badge {
  position: absolute;
  top: 0;
  right: 0;
  background-color: #ef4444;
  color: white;
  font-size: 10px;
  font-weight: 600;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}

.notification-panel {
  position: absolute;
  top: 100%;
  right: 0;
  width: 350px;
  max-height: 500px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  margin-top: 8px;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.notification-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.notification-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  background: none;
  border: none;
  font-size: 12px;
  color: #6b7280;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;
}

.action-btn:hover {
  background-color: #f3f4f6;
  color: #4b5563;
}

.action-btn i {
  font-size: 12px;
}

.empty-notifications {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  color: #9ca3af;
  text-align: center;
}

.empty-notifications i {
  font-size: 32px;
  margin-bottom: 12px;
}

.empty-notifications p {
  margin: 0;
  font-size: 14px;
}

.notification-list {
  overflow-y: auto;
  max-height: 400px;
}

.notification-item {
  display: flex;
  padding: 12px 16px;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  transition: background-color 0.2s;
  position: relative;
}

.notification-item:hover {
  background-color: #f9fafb;
}

.notification-item.unread {
  background-color: #f3f4f6;
}

.notification-item .notification-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  flex-shrink: 0;
}

.notification-item.type-success .notification-icon {
  color: #10b981;
  background-color: #d1fae5;
}

.notification-item.type-error .notification-icon {
  color: #ef4444;
  background-color: #fee2e2;
}

.notification-item.type-warning .notification-icon {
  color: #f59e0b;
  background-color: #fef3c7;
}

.notification-item.type-info .notification-icon {
  color: #3b82f6;
  background-color: #dbeafe;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-message {
  font-size: 14px;
  color: #1f2937;
  margin-bottom: 4px;
  word-break: break-word;
}

.notification-time {
  font-size: 12px;
  color: #6b7280;
}

.unread-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #3b82f6;
  position: absolute;
  top: 12px;
  right: 12px;
}
</style>
