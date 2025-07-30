import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './assets/main.css'

// Import views
import HomeView from './views/HomeView.vue'
import LoginView from './views/LoginView.vue'
import TeamManagementView from './views/TeamManagementView.vue'
import CalendarView from './views/CalendarView.vue'
import DiscoveryView from './views/DiscoveryView.vue'
import MessageView from './views/MessageView.vue'

// Import auth store for route guards
import { useAuthStore } from './stores/auth.js'

// Create router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'Home', component: HomeView },
    { path: '/login', name: 'Login', component: LoginView },
    { path: '/teams', name: 'Teams', component: TeamManagementView, meta: { requiresAuth: true } },
    { path: '/calendar', name: 'Calendar', component: CalendarView, meta: { requiresAuth: true } },
    { path: '/discovery', name: 'Discovery', component: DiscoveryView, meta: { requiresAuth: true } },
    { path: '/messages', name: 'Messages', component: MessageView, meta: { requiresAuth: true } },
    // Redirect old dashboard URLs to teams (requires auth)
    { path: '/dashboard', redirect: '/teams', meta: { requiresAuth: true } },
    // Redirect old requests URLs to messages (requires auth)
    { path: '/requests', redirect: '/messages', meta: { requiresAuth: true } },
    // Catch-all route for 404s - redirect to home
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ]
})

// Create app and pinia instance
const app = createApp(App)
const pinia = createPinia()

// Use pinia first
app.use(pinia)

// Authentication guard (after pinia is available)
router.beforeEach((to, from, next) => {
  // Check if the route requires authentication
  if (to.meta.requiresAuth) {
    // Get the auth store
    const authStore = useAuthStore()
    
    // Check if user is authenticated
    if (!authStore.isAuthenticated) {
      // Store the intended destination for redirect after login
      const redirectPath = to.fullPath
      next(`/login?redirect=${encodeURIComponent(redirectPath)}`)
      return
    }
  }
  
  // If route doesn't require auth or user is authenticated, proceed
  next()
})

// Use router
app.use(router)

// Mount app
app.mount('#app')
