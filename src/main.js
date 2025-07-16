import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './assets/main.css'

// Import views
import HomeView from './views/HomeView.vue'
import LoginView from './views/LoginView.vue'
import DashboardView from './views/DashboardView.vue'
import TeamManagementView from './views/TeamManagementView.vue'
import CalendarView from './views/CalendarView.vue'
import DiscoveryView from './views/DiscoveryView.vue'

// Create router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'Home', component: HomeView },
    { path: '/login', name: 'Login', component: LoginView },
    { path: '/dashboard', name: 'Dashboard', component: DashboardView },
    { path: '/teams', name: 'Teams', component: TeamManagementView },
    { path: '/calendar', name: 'Calendar', component: CalendarView },
    { path: '/discovery', name: 'Discovery', component: DiscoveryView },
  ]
})

// Create app
const app = createApp(App)

// Use plugins
app.use(createPinia())
app.use(router)

// Mount app
app.mount('#app')
