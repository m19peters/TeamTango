<template>
  <div class="min-h-screen bg-gray-50 dark:bg-slate-900 pb-20 md:pb-0 transition-colors duration-300">
    <!-- Header with gradient background -->
    <div class="bg-pattern border-b border-gray-200 dark:border-slate-700 md:mt-16">
      <div class="glass">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div class="flex items-center justify-between">
            <div class="fade-in">
              <h1 class="text-3xl font-bold text-gradient mb-2">Find Your Match</h1>
              <p class="text-gray-600 dark:text-gray-400">Swipe through teams to find your perfect opponent</p>
            </div>
            <button 
              @click="showFilters = !showFilters"
              class="btn btn-secondary flex items-center space-x-2 slide-up shrink-0"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
              <span>Filters</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters Panel -->
    <div v-if="showFilters" class="glass border-b border-gray-200 dark:border-slate-700 slide-up">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sport</label>
            <select v-model="filters.sport" @change="loadTeams" class="input-field">
              <option value="">All Sports</option>
              <option v-for="sport in availableSports" :key="sport" :value="sport">{{ sport }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Age Group</label>
            <select v-model="filters.ageGroup" @change="loadTeams" class="input-field">
              <option value="">All Ages</option>
              <option value="6U">6U</option>
              <option value="7U">7U</option>
              <option value="8U">8U</option>
              <option value="9U">9U</option>
              <option value="10U">10U</option>
              <option value="11U">11U</option>
              <option value="12U">12U</option>
              <option value="13U">13U</option>
              <option value="14U">14U</option>
              <option value="15U">15U</option>
              <option value="16U">16U</option>
              <option value="17U">17U</option>
              <option value="18U">18U</option>
              <option value="18+">18+</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Skill Level</label>
            <select v-model="filters.skillLevel" @change="loadTeams" class="input-field">
              <option value="">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Elite">Elite</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Distance</label>
            <select v-model="filters.distance" @change="loadTeams" class="input-field">
              <option value="">Any Distance</option>
              <option value="10">Within 10 miles</option>
              <option value="25">Within 25 miles</option>
              <option value="50">Within 50 miles</option>
              <option value="100">Within 100 miles</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Availability</label>
            <select v-model="filters.availability" @change="loadTeams" class="input-field">
              <option value="">Any</option>
              <option value="host">Can Host</option>
              <option value="travel">Can Travel</option>
              <option value="both">Both Host & Travel</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-20">
        <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 dark:border-primary-400 mx-auto mb-4"></div>
        <p class="text-gray-600 dark:text-gray-400">Finding amazing teams for you...</p>
      </div>

      <!-- No Teams State -->
      <div v-else-if="teams.length === 0" class="text-center py-20">
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 card-hover">
          <svg class="w-20 h-20 mx-auto mb-6 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">No Teams Found</h3>
          <p class="text-gray-600 dark:text-gray-400 mb-6">We couldn't find any teams matching your criteria. Try adjusting your filters or check back later!</p>
          <button 
            @click="resetAndReload"
            class="btn btn-primary bounce-in"
          >
            <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Start Fresh
          </button>
        </div>
      </div>

      <!-- Team Cards Stack -->
      <div v-else class="relative">
        <!-- Background cards (for visual depth) -->
        <div 
          v-for="(team, index) in visibleTeams.slice(1, 3)" 
          :key="`bg-${team.id}`"
          class="absolute inset-0 team-card transform"
          :style="{ 
            transform: `scale(${0.95 - (index * 0.05)}) translateY(${(index + 1) * 8}px)`,
            zIndex: 10 - index 
          }"
        >
          <div class="w-full h-full bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 opacity-60"></div>
        </div>

        <!-- Main active card -->
        <div 
          v-if="currentTeam"
          ref="cardRef"
          class="team-card team-card-swipe relative z-20 transform transition-all duration-300"
          :style="{ 
            transform: `translateX(${dragOffset.x}px) translateY(${dragOffset.y}px) rotate(${dragOffset.x * 0.1}deg)`,
            opacity: Math.max(0.3, 1 - Math.abs(dragOffset.x) / 400)
          }"
          @mousedown="startDrag"
          @touchstart="startDrag"
        >
          <!-- Swipe Indicators -->
          <div 
            v-if="Math.abs(dragOffset.x) > 50"
            class="swipe-indicator"
            :class="dragOffset.x > 0 ? 'swipe-match' : 'swipe-pass'"
          >
            <span v-if="dragOffset.x > 0">MATCH! 💖</span>
            <span v-else>PASS 👋</span>
          </div>

          <div class="p-8">
            <!-- Team Header -->
            <div class="text-center mb-6">
              <h2 class="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{{ currentTeam.name }}</h2>
              <div class="flex items-center justify-center space-x-3">
                <span class="status-badge" :class="getSkillLevelClass(currentTeam.skill_level)">
                  {{ currentTeam.skill_level }}
                </span>
                <span class="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-full text-sm font-medium">
                  {{ currentTeam.sport_name }}
                </span>
                <span class="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                  {{ currentTeam.age_group }}
                </span>
              </div>
            </div>

            <!-- Team Details -->
            <div class="space-y-4 mb-6">
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span class="font-medium text-gray-500 dark:text-gray-400">Location:</span>
                  <p class="text-gray-900 dark:text-gray-100">{{ currentTeam.city }}, {{ currentTeam.state }}</p>
                </div>
                <div>
                  <span class="font-medium text-gray-500 dark:text-gray-400">Home Venue:</span>
                  <p class="text-gray-900 dark:text-gray-100">{{ currentTeam.home_venue }}</p>
                </div>
              </div>

              <div v-if="currentTeam.description" class="pt-2">
                <span class="font-medium text-gray-500 dark:text-gray-400">About:</span>
                <p class="text-gray-900 dark:text-gray-100 mt-1">{{ currentTeam.description }}</p>
              </div>
            </div>

            <!-- Availability Indicators -->
            <div class="flex justify-center space-x-4 mb-6">
              <div v-if="currentTeam.can_host" class="flex items-center text-green-600 dark:text-green-400">
                <svg class="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span class="text-sm font-medium">Can Host</span>
              </div>
              <div v-if="currentTeam.can_travel" class="flex items-center text-blue-600 dark:text-blue-400">
                <svg class="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <span class="text-sm font-medium">Can Travel</span>
              </div>
            </div>

            <!-- Upcoming Availability -->
            <div v-if="currentTeam.upcoming_availability && currentTeam.upcoming_availability.length > 0" class="mb-6">
              <h4 class="font-medium text-gray-700 dark:text-gray-300 mb-2">Upcoming Availability:</h4>
              <div class="space-y-1">
                <div 
                  v-for="slot in currentTeam.upcoming_availability.slice(0, 2)" 
                  :key="slot.id"
                  class="text-sm text-gray-600 dark:text-gray-400 flex items-center"
                >
                  <svg class="w-4 h-4 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4" />
                  </svg>
                  {{ formatDate(slot.date) }} at {{ slot.time }}
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex space-x-4">
              <button 
                @click="passTeam"
                class="btn flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Pass
              </button>
              <button 
                @click="likeTeam"
                class="btn btn-primary flex-1"
              >
                <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Like
              </button>
            </div>
          </div>
        </div>

        <!-- Progress indicator -->
        <div class="text-center mt-6">
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ currentTeamIndex + 1 }} of {{ teams.length }} teams
          </p>
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
            <div 
              class="bg-primary-600 dark:bg-primary-500 h-2 rounded-full transition-all duration-300"
              :style="{ width: `${((currentTeamIndex + 1) / teams.length) * 100}%` }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Match Request Modal -->
    <div v-if="showMatchModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 pb-20 md:pb-4">
      <div class="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full max-h-[calc(100vh-6rem)] md:max-h-[calc(100vh-2rem)] overflow-y-auto">
        <div class="p-6">
          <div class="text-center mb-6">
            <div class="w-16 h-16 bg-gradient-to-br from-pink-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">It's a Match! 🎉</h3>
            <p class="text-gray-600 dark:text-gray-400">Send a match request to <strong>{{ selectedTeam?.name }}</strong></p>
          </div>

          <form @submit.prevent="sendMatchRequest" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your Team</label>
              <select v-model="matchRequest.yourTeam" required class="input-field">
                <option value="">Select your team</option>
                <option v-for="team in yourTeams" :key="team.id" :value="team.id">
                  {{ team.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preferred Dates</label>
              <input
                v-model="matchRequest.preferredDates"
                type="text"
                class="input-field"
                placeholder="e.g., Weekend of March 15th, Any Saturday"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message</label>
              <textarea
                v-model="matchRequest.message"
                rows="3"
                class="input-field"
                placeholder="Tell them why you'd like to play..."
              ></textarea>
            </div>

            <div class="flex space-x-3 pt-4 pb-4">
              <button 
                type="button"
                @click="closeMatchModal"
                class="btn btn-secondary flex-1"
              >
                Skip
              </button>
              <button 
                type="submit"
                class="btn btn-primary flex-1"
                :disabled="sending"
              >
                <svg v-if="sending" class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ sending ? 'Sending...' : 'Send Request' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import { useTeamStore } from '../stores/teams.js'
import { useNotificationStore } from '../stores/notifications.js'
import { supabase } from '../config/supabase.js'

const authStore = useAuthStore()
const teamStore = useTeamStore()
const notificationStore = useNotificationStore()

// State
const loading = ref(true)
const teams = ref([])
const currentTeamIndex = ref(0)
const yourTeams = ref([])
const showFilters = ref(false)
const showMatchModal = ref(false)
const selectedTeam = ref(null)
const sending = ref(false)

// Get sports from team store
const availableSports = computed(() => teamStore.sports.map(sport => sport.name))

// Filters
const filters = ref({
  sport: '',
  skillLevel: '',
  distance: '',
  availability: '',
  ageGroup: ''
})

// Drag state
const isDragging = ref(false)
const dragOffset = ref({ x: 0, y: 0 })
const cardRef = ref(null)

// Match request
const matchRequest = ref({
  yourTeam: '',
  targetTeam: null,
  preferredDates: '',
  message: ''
})

// Computed
const currentTeam = computed(() => teams.value[currentTeamIndex.value])
const visibleTeams = computed(() => teams.value.slice(currentTeamIndex.value, currentTeamIndex.value + 3))

// Methods
const loadTeams = async () => {
  try {
    loading.value = true
    
    const result = await teamStore.searchTeams(filters.value)
    
    if (result.error) throw result.error
    
    teams.value = result.data.map(team => ({
      ...team,
      sport_name: team.sport?.name || 'Unknown',
      skill_level: team.skill_level,
      // Add mock availability data for demo (this would come from team_availability table)
      can_host: Math.random() > 0.3,
      can_travel: Math.random() > 0.3,
      upcoming_availability: Math.random() > 0.5 ? [
        { id: 1, date: '2024-01-15', time: '10:00 AM' },
        { id: 2, date: '2024-01-20', time: '2:00 PM' }
      ] : []
    }))
    
    currentTeamIndex.value = 0
  } catch (error) {
    console.error('Error loading teams:', error)
    notificationStore.error('Loading Error', 'Failed to load teams. Please try again.')
  } finally {
    loading.value = false
  }
}

const loadYourTeams = async () => {
  try {
    await teamStore.loadUserTeams()
    yourTeams.value = teamStore.activeTeams
  } catch (error) {
    console.error('Error loading your teams:', error)
    notificationStore.error('Loading Error', 'Failed to load your teams.')
  }
}

const startDrag = (e) => {
  if (!currentTeam.value) return
  
  isDragging.value = true
  const clientX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX
  const clientY = e.type === 'mousedown' ? e.clientY : e.touches[0].clientY
  
  const rect = cardRef.value.getBoundingClientRect()
  const startX = clientX - rect.left
  const startY = clientY - rect.top
  
  const onMove = (moveEvent) => {
    if (!isDragging.value) return
    
    const currentX = moveEvent.type === 'mousemove' ? moveEvent.clientX : moveEvent.touches[0].clientX
    const currentY = moveEvent.type === 'mousemove' ? moveEvent.clientY : moveEvent.touches[0].clientY
    
    dragOffset.value.x = currentX - rect.left - startX
    dragOffset.value.y = currentY - rect.top - startY
  }
  
  const onEnd = () => {
    if (!isDragging.value) return
    
    const threshold = 100
    if (Math.abs(dragOffset.value.x) > threshold) {
      if (dragOffset.value.x > 0) {
        likeTeam()
      } else {
        passTeam()
      }
    } else {
      // Snap back
      dragOffset.value = { x: 0, y: 0 }
    }
    
    isDragging.value = false
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onEnd)
    document.removeEventListener('touchmove', onMove)
    document.removeEventListener('touchend', onEnd)
  }
  
  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onEnd)
  document.addEventListener('touchmove', onMove)
  document.addEventListener('touchend', onEnd)
}

const passTeam = () => {
  if (!currentTeam.value) return
  
  dragOffset.value = { x: -300, y: 0 }
  setTimeout(() => {
    currentTeamIndex.value++
    dragOffset.value = { x: 0, y: 0 }
  }, 300)
}

const likeTeam = () => {
  if (!currentTeam.value) return
  
  selectedTeam.value = currentTeam.value
  showMatchModal.value = true
  
  dragOffset.value = { x: 300, y: 0 }
  setTimeout(() => {
    currentTeamIndex.value++
    dragOffset.value = { x: 0, y: 0 }
  }, 300)
}

const closeMatchModal = () => {
  showMatchModal.value = false
  selectedTeam.value = null
  matchRequest.value = {
    yourTeam: '',
    targetTeam: null,
    preferredDates: '',
    message: ''
  }
}

const sendMatchRequest = async () => {
  try {
    sending.value = true
    
    const result = await teamStore.sendMatchRequest({
      requestingTeamId: matchRequest.value.yourTeam,
      targetTeamId: selectedTeam.value.id,
      preferredDates: matchRequest.value.preferredDates,
      message: matchRequest.value.message
    })
    
    if (result.error) throw result.error
    
    closeMatchModal()
    notificationStore.success(
      'Match Request Sent! 🎉', 
      `Your request has been sent to ${selectedTeam.value.name}. They'll receive your message and get back to you soon!`
    )
  } catch (error) {
    console.error('Error sending match request:', error)
    notificationStore.error(
      'Failed to Send Request',
      'There was an issue sending your match request. Please try again.'
    )
  } finally {
    sending.value = false
  }
}

const resetAndReload = () => {
  currentTeamIndex.value = 0
  loadTeams()
  notificationStore.info('Starting Fresh', 'Loading new teams for you to discover!')
}

const getSkillLevelClass = (level) => {
  const classes = {
    'Beginner': 'status-beginner',
    'Intermediate': 'status-intermediate',
    'Advanced': 'status-advanced',
    'Elite': 'status-elite'
  }
  return classes[level] || 'status-beginner'
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    loadYourTeams(),
    loadTeams()
  ])
  
  // Add keyboard listeners
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.input-field {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-700 dark:text-gray-200;
}

.btn {
  @apply px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2;
}

.btn-primary {
  @apply bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500 dark:bg-primary-500 dark:hover:bg-primary-600 dark:focus:ring-primary-400;
}

.btn-secondary {
  @apply bg-gray-200 hover:bg-gray-300 text-gray-900 focus:ring-gray-500 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-gray-200 dark:focus:ring-slate-500;
}

.status-badge {
  @apply px-3 py-1 text-sm rounded-full font-medium;
}

.status-available {
  @apply bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200;
}

.status-travel {
  @apply bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200;
}

.status-beginner {
  @apply bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200;
}

.status-intermediate {
  @apply bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200;
}

.status-advanced {
  @apply bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200;
}

.status-elite {
  @apply bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200;
}

.swipe-indicator {
  @apply absolute top-4 px-4 py-2 rounded-full font-bold text-sm transform transition-opacity;
}

.swipe-pass {
  left: 0;
  background-color: rgba(239, 68, 68, 0.9); /* Red */
  transform: rotate(-12deg);
}

.swipe-match {
  right: 0;
  background-color: rgba(34, 197, 94, 0.9); /* Green */
  transform: rotate(12deg);
}

.team-card {
  @apply bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700;
  transition: transform 0.3s ease-in-out, opacity 0.3s ease-in-out;
}

.team-card-swipe {
  cursor: grab;
  cursor: -moz-grab;
  cursor: -webkit-grab;
  transition: transform 0.3s ease-in-out, opacity 0.3s ease-in-out;
}

.team-card-swipe:active {
  cursor: grabbing;
  cursor: -moz-grabbing;
  cursor: -webkit-grabbing;
}

.glass {
  @apply backdrop-blur-sm bg-white/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700;
}

.fade-in {
  animation: fadeIn 0.5s ease-out;
}

.slide-up {
  animation: slideUp 0.5s ease-out;
}

.bounce-in {
  animation: bounceIn 0.6s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes bounceIn {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style> 