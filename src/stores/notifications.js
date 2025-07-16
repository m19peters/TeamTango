import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNotificationStore = defineStore('notifications', () => {
  const notifications = ref([])
  
  const addNotification = (notification) => {
    const id = Date.now() + Math.random()
    const toast = {
      id,
      type: notification.type || 'info',
      title: notification.title,
      message: notification.message || '',
      duration: notification.duration || 5000,
      persistent: notification.persistent || false
    }
    
    notifications.value.push(toast)
    return id
  }
  
  const removeNotification = (id) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }
  
  const clearAll = () => {
    notifications.value = []
  }
  
  // Convenience methods
  const success = (title, message, options = {}) => {
    return addNotification({ type: 'success', title, message, ...options })
  }
  
  const error = (title, message, options = {}) => {
    return addNotification({ type: 'error', title, message, ...options })
  }
  
  const warning = (title, message, options = {}) => {
    return addNotification({ type: 'warning', title, message, ...options })
  }
  
  const info = (title, message, options = {}) => {
    return addNotification({ type: 'info', title, message, ...options })
  }
  
  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    success,
    error,
    warning,
    info
  }
}) 