<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useAuthStore } from './stores/auth.js'
import { useThemeStore } from './stores/theme.js'
import { useNotificationStore } from './stores/notifications.js'
import { useMessagesStore } from './stores/messages.js'
import { useTeamStore } from './stores/teams.js'
import { useInteractionsStore } from './stores/interactions.js'
import { useDashboardStore } from './stores/dashboard.js'
import { useViewingAsTeamStore } from './stores/viewingAsTeam.js'
import { useRouter } from 'vue-router'
import Toast from './components/Toast.vue'
import ViewingAsTeamSelector from './components/ViewingAsTeamSelector.vue'

const authStore = useAuthStore()
const themeStore = useThemeStore()
const notificationStore = useNotificationStore()
const messagesStore = useMessagesStore()
const teamStore = useTeamStore()
const interactionsStore = useInteractionsStore()
const dashboardStore = useDashboardStore()
const viewingAsTeamStore = useViewingAsTeamStore()
const router = useRouter()

// Mobile logout confirmation
const showLogoutConfirmation = ref(false)

const confirmLogout = async () => {
  showLogoutConfirmation.value = false
  const result = await authStore.signOut()
  if (!result.error) {
    notificationStore.info('Signed Out', 'You have been successfully signed out.')
    router.push('/')
  }
}

const handleSignOut = async () => {
  const result = await authStore.signOut()
  if (!result.error) {
    notificationStore.info('Signed Out', 'You have been successfully signed out.')
    router.push('/')
  }
}

// Watch for auth state changes to initialize messages
watch(() => authStore.isAuthenticated, async (isAuthenticated) => {
  if (isAuthenticated) {
    // Load user teams first, then initialize all stores
    await teamStore.loadUserTeams()
    await themeStore.initializeTheme() // Re-initialize theme with user's database preference
    viewingAsTeamStore.initializeViewingAsTeam()
    messagesStore.initialize()
    interactionsStore.initialize()
    dashboardStore.initialize()
  } else {
    // Clear data when user logs out
    messagesStore.clearMessages()
    interactionsStore.clearInteractions()
    dashboardStore.clearDashboard()
    viewingAsTeamStore.clearViewingAsTeam()
    // Reset theme to system preference when logged out
    await themeStore.setTheme('system')
  }
}, { immediate: false })

// Watch for team changes and validate viewingAsTeam selection
watch(() => teamStore.userTeams, () => {
  viewingAsTeamStore.validateSelection()
}, { deep: true })

onMounted(async () => {
  authStore.initialize()
  await themeStore.initializeTheme()
})

onUnmounted(() => {
  messagesStore.cleanupSubscription()
})
</script>

<template>
  <div id="app" class="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
    <!-- Loading Screen -->
    <div v-if="authStore.loading" class="flex items-center justify-center min-h-screen">
      <div class="text-center space-y-4">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400 mx-auto"></div>
        <p class="text-gray-600 dark:text-gray-400">Loading TeamTango...</p>
      </div>
    </div>

    <!-- Main App -->
    <div v-else>
      <!-- Mobile Header (Top) -->
      <header v-if="authStore.isAuthenticated" class="fixed top-0 left-0 right-0 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 md:hidden z-50">
        <div class="flex items-center justify-between h-20 px-4 py-2">
          <!-- Logo/Brand -->
          <div class="flex items-center">
            <div class="w-14 h-14 rounded-lg overflow-hidden">
              <img src="@/assets/team_tango_logo.png" alt="TeamTango Logo" class="w-full h-full object-contain">
            </div>
          </div>
          
          <!-- Logout Button -->
          <button
            @click="showLogoutConfirmation = true"
            class="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </header>

      <!-- Main Content -->
      <main class="pb-16 pt-20 md:pt-0 md:pb-0">
        <router-view />
      </main>

      <!-- Mobile Navigation (Bottom) -->
      <nav v-if="authStore.isAuthenticated" class="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 md:hidden z-50">
        <div class="grid grid-cols-4 h-16">
          <router-link 
            to="/teams" 
            class="nav-link"
            :class="$route.name === 'Teams' ? 'nav-link-active' : 'nav-link-inactive'"
          >
            <svg class="w-5 h-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span class="text-xs">Home</span>
          </router-link>

          <router-link 
            to="/discovery" 
            class="nav-link"
            :class="$route.name === 'Discovery' ? 'nav-link-active' : 'nav-link-inactive'"
          >
            <svg class="w-5 h-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span class="text-xs">Discover</span>
          </router-link>

          <router-link 
            to="/messages" 
            class="nav-link"
            :class="$route.name === 'Messages' ? 'nav-link-active' : 'nav-link-inactive'"
          >
            <div class="relative">
              <svg class="w-5 h-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.962 8.962 0 01-4.5-1.207L3 21l2.207-5.5A8.962 8.962 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
              </svg>
              <span v-if="messagesStore.unreadCount > 0" 
                    class="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-500 rounded-full min-w-[16px] h-4">
                {{ messagesStore.unreadCount > 99 ? '99+' : messagesStore.unreadCount }}
              </span>
            </div>
            <span class="text-xs">Messages</span>
          </router-link>

          <router-link 
            to="/calendar" 
            class="nav-link"
            :class="$route.name === 'Calendar' ? 'nav-link-active' : 'nav-link-inactive'"
          >
            <svg class="w-5 h-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span class="text-xs">Calendar</span>
          </router-link>
        </div>
      </nav>

      <!-- Desktop Navigation (Top) -->
      <nav v-if="authStore.isAuthenticated" class="hidden md:block fixed top-0 left-0 right-0 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-20">
            <!-- Logo/Brand -->
            <div class="flex items-center">
              <router-link to="/teams" class="flex items-center">
                <div class="w-16 h-16 rounded-lg overflow-hidden">
                  <img src="@/assets/team_tango_logo.png" alt="TeamTango Logo" class="w-full h-full object-contain">
                </div>
              </router-link>
            </div>

            <!-- Navigation Links -->
            <div class="flex items-center space-x-8">
              <router-link 
                to="/teams" 
                :class="$route.name === 'Teams' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'"
                class="px-3 py-2 text-sm font-medium transition-colors"
              >
                Home
              </router-link>

              <router-link 
                to="/discovery" 
                :class="$route.name === 'Discovery' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'"
                class="px-3 py-2 text-sm font-medium transition-colors"
              >
                Discover
              </router-link>

              <router-link 
                to="/calendar" 
                :class="$route.name === 'Calendar' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'"
                class="px-3 py-2 text-sm font-medium transition-colors"
              >
                Calendar
              </router-link>

              <router-link 
                to="/messages" 
                :class="$route.name === 'Messages' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'"
                class="px-3 py-2 text-sm font-medium transition-colors relative"
              >
                Messages
                <span v-if="messagesStore.unreadCount > 0" 
                      class="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-500 rounded-full min-w-[16px] h-4">
                  {{ messagesStore.unreadCount > 99 ? '99+' : messagesStore.unreadCount }}
                </span>
              </router-link>

              <!-- User Menu -->
              <div class="flex items-center space-x-4">
                <button 
                  @click="handleSignOut"
                  class="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </div>

    <!-- Mobile Logout Confirmation Modal -->
    <div v-if="showLogoutConfirmation" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4">
      <div class="bg-white dark:bg-slate-800 rounded-lg max-w-sm w-full p-6 shadow-2xl">
        <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Confirm Logout</h3>
        <p class="text-gray-600 dark:text-gray-300 mb-6">
          Are you sure you want to log out? You'll need to sign in again to access your teams.
        </p>
        <div class="flex space-x-3">
          <button 
            @click="showLogoutConfirmation = false"
            class="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button 
            @click="confirmLogout"
            class="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 rounded-md transition-colors"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>

    <!-- Toast Notifications -->
    <Toast />
  </div>
</template>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
