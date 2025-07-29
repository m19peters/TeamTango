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

// Create router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'Home', component: HomeView },
    { path: '/login', name: 'Login', component: LoginView },
    { path: '/teams', name: 'Teams', component: TeamManagementView },
    { path: '/calendar', name: 'Calendar', component: CalendarView },
    { path: '/discovery', name: 'Discovery', component: DiscoveryView },
    { path: '/messages', name: 'Messages', component: MessageView },
    // Redirect old dashboard URLs to teams
    { path: '/dashboard', redirect: '/teams' },
    // Redirect old requests URLs to messages
    { path: '/requests', redirect: '/messages' },
  ]
})

// Create app
const app = createApp(App)

// Use plugins
app.use(createPinia())
app.use(router)

// Mount app
app.mount('#app')
