<template>
  <div class="min-h-screen bg-gray-50 dark:bg-slate-900 pb-20 md:pb-0">
    <!-- Header -->
    <div class="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 md:mt-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
            <p class="text-gray-600 dark:text-gray-300">{{ currentDate }}</p>
          </div>
          <router-link to="/discovery" class="btn btn-primary shrink-0">
            Find Matches
          </router-link>
        </div>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div class="card text-center">
          <div class="text-2xl font-bold text-primary-600 dark:text-primary-400">{{ stats.teams }}</div>
          <div class="text-sm text-gray-600 dark:text-gray-400">Teams</div>
        </div>
        <div class="card text-center">
          <div class="text-2xl font-bold text-green-600 dark:text-green-400">{{ stats.matches }}</div>
          <div class="text-sm text-gray-600 dark:text-gray-400">Total Matches</div>
        </div>
        <div class="card text-center">
          <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ stats.upcoming }}</div>
          <div class="text-sm text-gray-600 dark:text-gray-400">Upcoming</div>
        </div>
        <div class="card text-center">
          <div class="text-2xl font-bold text-orange-600 dark:text-orange-400">{{ stats.requests }}</div>
          <div class="text-sm text-gray-600 dark:text-gray-400">Requests</div>
        </div>
      </div>

      <!-- Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Recent Activity -->
        <div>
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Activity</h2>
          </div>
          
          <div class="card space-y-4">
            <div v-if="recentActivity.length === 0" class="text-center py-8">
              <svg class="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No recent activity</h3>
              <p class="text-gray-600 dark:text-gray-400">Create a team to start seeing activity</p>
            </div>
            
            <div v-else>
              <div 
                v-for="activity in recentActivity" 
                :key="activity.id"
                class="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                <div class="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm text-gray-900 dark:text-gray-100">{{ activity.message }}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ activity.time }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- My Teams -->
        <div>
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">My Teams</h2>
            <router-link to="/teams" class="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
              View all →
            </router-link>
          </div>
          
          <div v-if="teams.length === 0" class="card text-center py-8">
            <svg class="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 515.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
            </svg>
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No teams yet</h3>
            <p class="text-gray-600 dark:text-gray-400 mb-4">Create your first team to start finding matches</p>
            <button 
              @click="showAddTeamModal = true"
              class="btn btn-primary"
            >
              Add Your First Team
            </button>
          </div>

          <div v-else class="space-y-4">
            <div 
              v-for="team in teams.slice(0, 3)" 
              :key="team.id"
              class="card"
            >
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="font-medium text-gray-900 dark:text-gray-100">{{ team.name }}</h3>
                  <p class="text-sm text-gray-600 dark:text-gray-400">{{ team.sport?.name || team.sport }} • {{ team.age_group }} • {{ team.city }}, {{ team.state }}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-500">Skill Level: {{ team.skill_level }}</p>
                </div>
                <div class="text-right">
                  <div class="text-sm font-medium text-green-600 dark:text-green-400">{{ team.totalMatches || 0 }} matches</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">{{ team.status }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Team Modal Placeholder -->
    <div v-if="showAddTeamModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 pb-20 md:pb-4">
      <div class="bg-white dark:bg-slate-800 rounded-lg max-w-md w-full p-6">
        <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Quick Team Creation</h3>
        <p class="text-gray-600 dark:text-gray-300 mb-4">Use the Teams section to create and manage your teams with full details.</p>
        <div class="flex space-x-3">
          <button 
            @click="showAddTeamModal = false"
            class="btn btn-secondary flex-1"
          >
            Cancel
          </button>
          <router-link 
            to="/teams"
            @click="showAddTeamModal = false"
            class="btn btn-primary flex-1 text-center"
          >
            Go to Teams
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import { useTeamStore } from '../stores/teams.js'

const authStore = useAuthStore()
const teamStore = useTeamStore()

const showAddTeamModal = ref(false)
const matchRequests = ref([])
const recentActivity = ref([])

// Real stats computed from team store data
const stats = computed(() => ({
  teams: teamStore.userTeams.length,
  matches: teamStore.userTeams.reduce((total, team) => total + (team.totalMatches || 0), 0),
  upcoming: 0, // This would come from team availability
  requests: matchRequests.value.filter(req => req.status === 'pending').length
}))

// Use teams from store
const teams = computed(() => teamStore.userTeams)

const currentDate = computed(() => {
  return new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
})

// Function to load dashboard data
const loadDashboardData = async () => {
  try {
    // Load user teams
    await teamStore.loadUserTeams()
    
    // Load match requests
    const result = await teamStore.getMatchRequests()
    if (result.data) {
      matchRequests.value = result.data
      
      // Create recent activity from match requests
      recentActivity.value = result.data
        .slice(0, 3)
        .map(request => {
          const isReceived = teamStore.userTeams.some(team => team.id === request.target_team_id)
          const otherTeam = isReceived ? request.requesting_team : request.target_team
          const timeAgo = getTimeAgo(request.created_at)
          
          if (isReceived) {
            return {
              id: request.id,
              message: `New match request from ${otherTeam?.name || 'Unknown Team'}`,
              time: timeAgo
            }
          } else {
            return {
              id: request.id,
              message: `Match request sent to ${otherTeam?.name || 'Unknown Team'}`,
              time: timeAgo
            }
          }
        })
    }
  } catch (error) {
    console.error('Error loading dashboard data:', error)
  }
}

const getTimeAgo = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMs = now - date
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
  
  if (diffInDays > 0) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
  } else if (diffInHours > 0) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
  } else {
    return 'Just now'
  }
}

onMounted(() => {
  loadDashboardData()
})
</script> 