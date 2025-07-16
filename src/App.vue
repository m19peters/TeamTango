<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth.js'
import { useThemeStore } from './stores/theme.js'
import { useNotificationStore } from './stores/notifications.js'
import Toast from './components/Toast.vue'

const authStore = useAuthStore()
const themeStore = useThemeStore()
const notificationStore = useNotificationStore()

onMounted(() => {
  authStore.initialize()
  themeStore.initializeTheme()
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
      <!-- Main Content -->
      <main class="pb-16 md:pb-0">
        <router-view />
      </main>

      <!-- Mobile Navigation (Bottom) -->
      <nav v-if="authStore.isAuthenticated" class="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 md:hidden z-50">
        <div class="grid grid-cols-5 h-16">
          <router-link 
            to="/dashboard" 
            class="nav-link"
            :class="$route.name === 'Dashboard' ? 'nav-link-active' : 'nav-link-inactive'"
          >
            <svg class="w-5 h-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5a2 2 0 012-2h2a2 2 0 012 2v0M8 5a2 2 0 012-2h2a2 2 0 012 2v0" />
            </svg>
            <span class="text-xs">Dashboard</span>
          </router-link>

          <router-link 
            to="/teams" 
            class="nav-link"
            :class="$route.name === 'Teams' ? 'nav-link-active' : 'nav-link-inactive'"
          >
            <svg class="w-5 h-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 515.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
            </svg>
            <span class="text-xs">Teams</span>
          </router-link>

          <router-link 
            to="/discovery" 
            class="nav-link"
            :class="$route.name === 'Discovery' ? 'nav-link-active' : 'nav-link-inactive'"
          >
            <div class="relative">
              <svg class="w-5 h-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span class="text-xs">Discover</span>
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

          <button 
            @click="themeStore.toggleTheme"
            class="nav-link nav-link-inactive"
          >
            <svg v-if="!themeStore.isDark" class="w-5 h-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
            <svg v-else class="w-5 h-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span class="text-xs">{{ themeStore.isDark ? 'Light' : 'Dark' }}</span>
          </button>
        </div>
      </nav>

      <!-- Desktop Navigation (Top) -->
      <nav v-if="authStore.isAuthenticated" class="hidden md:block fixed top-0 left-0 right-0 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">
            <!-- Logo/Brand -->
            <div class="flex items-center">
              <router-link to="/dashboard" class="flex items-center space-x-2">
                <div class="w-8 h-8 bg-primary-600 dark:bg-primary-500 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <span class="text-xl font-bold text-gray-900 dark:text-gray-100">TeamTango</span>
              </router-link>
            </div>

            <!-- Navigation Links -->
            <div class="flex items-center space-x-8">
              <router-link 
                to="/dashboard" 
                :class="$route.name === 'Dashboard' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'"
                class="px-3 py-2 text-sm font-medium transition-colors"
              >
                Dashboard
              </router-link>

              <router-link 
                to="/teams" 
                :class="$route.name === 'Teams' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'"
                class="px-3 py-2 text-sm font-medium transition-colors"
              >
                Teams
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

              <!-- User Menu -->
              <div class="flex items-center space-x-4">
                <button 
                  @click="themeStore.toggleTheme"
                  class="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  :title="themeStore.isDark ? 'Switch to light mode' : 'Switch to dark mode'"
                >
                  <svg v-if="!themeStore.isDark" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                  <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </button>

                <button 
                  @click="authStore.signOut"
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
