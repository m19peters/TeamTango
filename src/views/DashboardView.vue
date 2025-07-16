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
          <div class="text-2xl font-bold text-green-600 dark:text-green-400">{{ stats.acceptedMatches }}</div>
          <div class="text-sm text-gray-600 dark:text-gray-400">Confirmed Matches</div>
        </div>
        <div class="card text-center">
          <div class="text-2xl font-bold text-orange-600 dark:text-orange-400">{{ stats.pendingRequests }}</div>
          <div class="text-sm text-gray-600 dark:text-gray-400">Pending Requests</div>
        </div>
        <div class="card text-center">
          <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ stats.totalRequests }}</div>
          <div class="text-sm text-gray-600 dark:text-gray-400">Total Activity</div>
        </div>
      </div>

      <!-- Content Grid -->
      <div class="space-y-8">
        <!-- Incoming Match Requests (Need Response) -->
        <div v-if="incomingRequests.length > 0">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
              🔔 Incoming Requests <span class="text-orange-600 dark:text-orange-400">({{ incomingRequests.length }})</span>
            </h2>
          </div>
          
          <div class="space-y-4">
            <div v-for="request in incomingRequests" :key="request.id" class="card border-l-4 border-orange-400">
              <div class="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
                <div class="flex-1">
                  <div class="flex items-center space-x-3 mb-2">
                    <h3 class="font-semibold text-gray-900 dark:text-gray-100">{{ request.requesting_team?.name }}</h3>
                    <span class="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                      Wants to play {{ request.target_team?.name }}
                    </span>
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p class="text-gray-600 dark:text-gray-400">
                        <strong>Sport:</strong> {{ request.requesting_team?.sport?.name || 'Unknown' }} • 
                        <strong>Age:</strong> {{ request.requesting_team?.age_group }} • 
                        <strong>Skill:</strong> {{ request.requesting_team?.skill_level }}
                      </p>
                      <p class="text-gray-600 dark:text-gray-400">
                        <strong>Location:</strong> {{ request.requesting_team?.city }}, {{ request.requesting_team?.state }}
                      </p>
                      <p class="text-gray-600 dark:text-gray-400" v-if="request.requesting_team?.phone">
                        <strong>Phone:</strong> 
                        <a :href="`tel:${request.requesting_team.phone}`" class="text-primary-600 hover:text-primary-700 dark:text-primary-400">
                          {{ request.requesting_team.phone }}
                        </a>
                      </p>
                    </div>
                    <div>
                      <p class="text-gray-600 dark:text-gray-400" v-if="request.requesting_team?.home_venue">
                        <strong>Home Venue:</strong> {{ request.requesting_team.home_venue }}
                      </p>
                      <p class="text-gray-600 dark:text-gray-400" v-if="request.preferred_dates">
                        <strong>Preferred Dates:</strong> {{ request.preferred_dates }}
                      </p>
                      <p class="text-gray-600 dark:text-gray-400 mt-2" v-if="request.message">
                        <strong>Message:</strong> "{{ request.message }}"
                      </p>
                    </div>
                  </div>
                  <p class="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    Received {{ getTimeAgo(request.created_at) }}
                  </p>
                </div>
                <div class="flex space-x-3 md:flex-col md:space-x-0 md:space-y-2">
                  <button 
                    @click="respondToRequest(request.id, 'accepted')"
                    :disabled="loading"
                    class="btn text-sm px-4 py-2 bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    Accept ✓
                  </button>
                  <button 
                    @click="respondToRequest(request.id, 'declined')"
                    :disabled="loading"
                    class="btn text-sm px-4 py-2 bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    Decline ✗
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Confirmed Matches -->
        <div v-if="confirmedMatches.length > 0">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
              🎉 Confirmed Matches <span class="text-green-600 dark:text-green-400">({{ confirmedMatches.length }})</span>
            </h2>
          </div>
          
          <div class="space-y-4">
            <div v-for="match in confirmedMatches" :key="match.id" class="card border-l-4 border-green-400">
              <div class="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
                <div class="flex-1">
                  <div class="flex items-center space-x-3 mb-2">
                    <h3 class="font-semibold text-gray-900 dark:text-gray-100">
                      {{ getOtherTeam(match)?.name }}
                    </h3>
                    <span class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Match Confirmed
                    </span>
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p class="text-gray-600 dark:text-gray-400">
                        <strong>Sport:</strong> {{ getOtherTeam(match)?.sport?.name || 'Unknown' }} • 
                        <strong>Age:</strong> {{ getOtherTeam(match)?.age_group }} • 
                        <strong>Skill:</strong> {{ getOtherTeam(match)?.skill_level }}
                      </p>
                      <p class="text-gray-600 dark:text-gray-400">
                        <strong>Location:</strong> {{ getOtherTeam(match)?.city }}, {{ getOtherTeam(match)?.state }}
                      </p>
                      <p class="text-gray-600 dark:text-gray-400" v-if="getOtherTeam(match)?.phone">
                        <strong>Phone:</strong> 
                        <a :href="`tel:${getOtherTeam(match).phone}`" class="text-primary-600 hover:text-primary-700 dark:text-primary-400">
                          {{ getOtherTeam(match).phone }}
                        </a>
                      </p>
                    </div>
                    <div>
                      <p class="text-gray-600 dark:text-gray-400" v-if="getOtherTeam(match)?.home_venue">
                        <strong>Home Venue:</strong> {{ getOtherTeam(match).home_venue }}
                      </p>
                      <p class="text-gray-600 dark:text-gray-400" v-if="getOtherTeam(match)?.venue_address">
                        <strong>Address:</strong> {{ getOtherTeam(match).venue_address }}
                      </p>
                      <p class="text-gray-600 dark:text-gray-400" v-if="match.preferred_dates">
                        <strong>Preferred Dates:</strong> {{ match.preferred_dates }}
                      </p>
                    </div>
                  </div>
                  <p class="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    Confirmed {{ getTimeAgo(match.updated_at) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Outgoing Requests -->
        <div v-if="outgoingRequests.length > 0">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
              📤 My Requests <span class="text-blue-600 dark:text-blue-400">({{ outgoingRequests.length }})</span>
            </h2>
          </div>
          
          <div class="space-y-4">
            <div v-for="request in outgoingRequests" :key="request.id" class="card">
              <div class="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
                <div class="flex-1">
                  <div class="flex items-center space-x-3 mb-2">
                    <h3 class="font-semibold text-gray-900 dark:text-gray-100">{{ request.target_team?.name }}</h3>
                    <span :class="getStatusClass(request.status)">
                      {{ getStatusText(request.status) }}
                    </span>
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p class="text-gray-600 dark:text-gray-400">
                        <strong>Your Team:</strong> {{ request.requesting_team?.name }}
                      </p>
                      <p class="text-gray-600 dark:text-gray-400">
                        <strong>Their Location:</strong> {{ request.target_team?.city }}, {{ request.target_team?.state }}
                      </p>
                    </div>
                    <div>
                      <p class="text-gray-600 dark:text-gray-400" v-if="request.preferred_dates">
                        <strong>Requested Dates:</strong> {{ request.preferred_dates }}
                      </p>
                      <p class="text-gray-600 dark:text-gray-400 mt-1" v-if="request.message">
                        <strong>Your Message:</strong> "{{ request.message }}"
                      </p>
                    </div>
                  </div>
                  <p class="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    Sent {{ getTimeAgo(request.created_at) }}
                  </p>
                </div>
                <div v-if="request.status === 'pending'">
                  <button 
                    @click="cancelRequest(request.id)"
                    :disabled="loading"
                    class="btn btn-secondary text-sm disabled:opacity-50"
                  >
                    Cancel Request
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="allMatchRequests.length === 0" class="card text-center py-12">
          <svg class="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 515.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
          </svg>
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No match activity yet</h3>
          <p class="text-gray-600 dark:text-gray-400 mb-6">Start discovering teams and sending match requests to see activity here</p>
          <div class="space-x-4">
            <router-link to="/discovery" class="btn btn-primary">
              Find Teams
            </router-link>
            <router-link to="/teams" class="btn btn-secondary">
              Manage Teams
            </router-link>
          </div>
        </div>

        <!-- My Teams Summary -->
        <div v-if="teams.length > 0">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">My Teams</h2>
            <router-link to="/teams" class="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
              Manage all →
            </router-link>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="team in teams.slice(0, 3)" :key="team.id" class="card">
              <div>
                <h3 class="font-medium text-gray-900 dark:text-gray-100">{{ team.name }}</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">{{ team.sport?.name || team.sport }} • {{ team.age_group }} • {{ team.city }}, {{ team.state }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-500 mt-1">{{ team.skill_level }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import { useTeamStore } from '../stores/teams.js'
import { storeToRefs } from 'pinia'

const authStore = useAuthStore()
const teamStore = useTeamStore()

const { loading } = storeToRefs(teamStore)
const allMatchRequests = ref([])

// Real stats computed from match requests
const stats = computed(() => ({
  teams: teamStore.userTeams.length,
  acceptedMatches: allMatchRequests.value.filter(req => req.status === 'accepted').length,
  pendingRequests: allMatchRequests.value.filter(req => 
    req.status === 'pending' && 
    teamStore.userTeams.some(team => team.id === req.target_team_id)
  ).length,
  totalRequests: allMatchRequests.value.length
}))

// Use teams from store
const teams = computed(() => teamStore.userTeams)

// Separate requests by type
const incomingRequests = computed(() => 
  allMatchRequests.value.filter(req => 
    req.status === 'pending' && 
    teamStore.userTeams.some(team => team.id === req.target_team_id)
  )
)

const outgoingRequests = computed(() => 
  allMatchRequests.value.filter(req => 
    teamStore.userTeams.some(team => team.id === req.requesting_team_id)
  )
)

const confirmedMatches = computed(() => 
  allMatchRequests.value.filter(req => req.status === 'accepted')
)

const currentDate = computed(() => {
  return new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
})

// Helper functions
const getOtherTeam = (request) => {
  const isMyRequestingTeam = teamStore.userTeams.some(team => team.id === request.requesting_team_id)
  return isMyRequestingTeam ? request.target_team : request.requesting_team
}

const getStatusClass = (status) => {
  const classes = {
    pending: 'px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    accepted: 'px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    declined: 'px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    cancelled: 'px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }
  return classes[status] || classes.pending
}

const getStatusText = (status) => {
  const texts = {
    pending: 'Pending',
    accepted: 'Accepted',
    declined: 'Declined',
    cancelled: 'Cancelled'
  }
  return texts[status] || 'Unknown'
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

// Actions
const respondToRequest = async (requestId, status) => {
  const result = await teamStore.updateMatchRequestStatus(requestId, status)
  if (result.data) {
    // Update local request
    const index = allMatchRequests.value.findIndex(req => req.id === requestId)
    if (index !== -1) {
      allMatchRequests.value[index] = result.data
    }
  }
}

const cancelRequest = async (requestId) => {
  if (confirm('Are you sure you want to cancel this match request?')) {
    await respondToRequest(requestId, 'cancelled')
  }
}

// Function to load dashboard data
const loadDashboardData = async () => {
  try {
    // Load user teams
    await teamStore.loadUserTeams()
    
    // Load all match requests
    const result = await teamStore.getMatchRequests('all')
    if (result.data) {
      allMatchRequests.value = result.data
    }
  } catch (error) {
    console.error('Error loading dashboard data:', error)
  }
}

onMounted(() => {
  loadDashboardData()
})
</script> 