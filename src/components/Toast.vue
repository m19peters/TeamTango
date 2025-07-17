<template>
  <div class="fixed top-4 right-4 z-50 space-y-2">
    <transition-group
      name="toast"
      enter-active-class="transform ease-out duration-300 transition"
      enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
      leave-active-class="transition ease-in duration-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-for="notification in notificationStore.notifications"
        :key="notification.id"
        class="max-w-sm w-full"
      >
        <div
          :class="[
            'rounded-lg shadow-lg border backdrop-blur-sm p-4',
            getTypeClasses(notification.type)
          ]"
        >
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <!-- Success Icon -->
              <svg v-if="notification.type === 'success'" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <!-- Error Icon -->
              <svg v-else-if="notification.type === 'error'" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <!-- Warning Icon -->
              <svg v-else-if="notification.type === 'warning'" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <!-- Info Icon -->
              <svg v-else class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-3 w-0 flex-1">
              <p v-if="notification.title" class="text-sm font-medium">
                {{ notification.title }}
              </p>
              <p v-if="notification.message" class="mt-1 text-sm opacity-90">
                {{ notification.message }}
              </p>
            </div>
            <div class="ml-4 flex-shrink-0 flex">
              <button
                @click="removeNotification(notification.id)"
                class="rounded-md inline-flex text-current hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current transition-opacity"
              >
                <span class="sr-only">Close</span>
                <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fill-rule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useNotificationStore } from '../stores/notifications.js'

const notificationStore = useNotificationStore()

// Auto-remove notifications after their duration
const timers = new Map()

const removeNotification = (id) => {
  notificationStore.removeNotification(id)
  if (timers.has(id)) {
    clearTimeout(timers.get(id))
    timers.delete(id)
  }
}

const getTypeClasses = (type) => {
  const classes = {
    success: 'bg-green-50/90 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
    error: 'bg-red-50/90 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
    warning: 'bg-yellow-50/90 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200',
    info: 'bg-blue-50/90 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200'
  }
  return classes[type] || classes.info
}

// Watch for new notifications and set timers
const watchNotifications = () => {
  notificationStore.notifications.forEach(notification => {
    if (!timers.has(notification.id) && !notification.persistent && notification.duration > 0) {
      const timer = setTimeout(() => {
        removeNotification(notification.id)
      }, notification.duration)
      timers.set(notification.id, timer)
    }
  })
}

onMounted(() => {
  // Set up a watcher for new notifications
  const unwatchNotifications = notificationStore.$subscribe(() => {
    watchNotifications()
  })
  
  // Initial setup for existing notifications
  watchNotifications()
  
  onUnmounted(() => {
    unwatchNotifications()
    // Clear all timers
    timers.forEach(timer => clearTimeout(timer))
    timers.clear()
  })
})
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style> 