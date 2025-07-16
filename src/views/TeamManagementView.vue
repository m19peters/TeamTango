<template>
  <div class="min-h-screen bg-gray-50 dark:bg-slate-900 pb-20 md:pb-0">
    <!-- Header -->
    <div class="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 md:mt-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">My Teams</h1>
            <p class="text-gray-600 dark:text-gray-300">Manage your sports teams</p>
          </div>
          <button 
            @click="showCreateModal = true"
            class="btn btn-primary shrink-0"
          >
            + Add Team
          </button>
        </div>
      </div>
    </div>

    <!-- Teams List -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div v-if="formattedTeams.length === 0" class="text-center py-12">
        <svg class="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 515.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No teams yet</h3>
        <p class="text-gray-600 dark:text-gray-300 mb-6">Create your first team to start finding matches</p>
        <button 
          @click="showCreateModal = true"
          class="btn btn-primary"
        >
          Create Your First Team
        </button>
      </div>

      <div v-else class="space-y-6">
        <div 
          v-for="team in formattedTeams" 
          :key="team.id"
          class="card"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center mb-3">
                <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mr-3">{{ team.name }}</h3>
                <span 
                  :class="[
                    'px-2 py-1 text-xs rounded-full',
                    team.status === 'Active' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  ]"
                >
                  {{ team.status }}
                </span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div>
                  <span class="font-medium text-gray-500 dark:text-gray-400">Sport:</span>
                  <span class="ml-1 text-gray-900 dark:text-gray-100">{{ team.sport }}</span>
                </div>
                <div>
                  <span class="font-medium text-gray-500 dark:text-gray-400">Age Group:</span>
                  <span class="ml-1 text-gray-900 dark:text-gray-100">{{ team.age_group }}</span>
                </div>
                <div>
                  <span class="font-medium text-gray-500 dark:text-gray-400">Skill Level:</span>
                  <span class="ml-1 text-gray-900 dark:text-gray-100">{{ team.skillLevel }}</span>
                </div>
                <div>
                  <span class="font-medium text-gray-500 dark:text-gray-400">Location:</span>
                  <span class="ml-1 text-gray-900 dark:text-gray-100">{{ team.city }}, {{ team.state }}</span>
                </div>
                <div>
                  <span class="font-medium text-gray-500 dark:text-gray-400">Home Venue:</span>
                  <span class="ml-1 text-gray-900 dark:text-gray-100">{{ team.homeVenue }}</span>
                </div>
                <div>
                  <span class="font-medium text-gray-500 dark:text-gray-400">Contact:</span>
                  <span class="ml-1 text-gray-900 dark:text-gray-100">{{ team.phone }}</span>
                </div>
                <div>
                  <span class="font-medium text-gray-500 dark:text-gray-400">Matches:</span>
                  <span class="ml-1 text-gray-900 dark:text-gray-100">{{ team.totalMatches || 0 }}</span>
                </div>
              </div>

              <div v-if="team.description" class="mt-3">
                <span class="font-medium text-gray-500 dark:text-gray-400">Description:</span>
                <p class="text-gray-900 dark:text-gray-100 mt-1">{{ team.description }}</p>
              </div>
            </div>

            <div class="flex space-x-2 ml-4 shrink-0">
              <button 
                @click="editTeam(team)"
                class="btn btn-secondary text-sm px-3 py-1"
              >
                Edit
              </button>
              <button 
                @click="confirmDelete(team)"
                class="btn text-sm px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Team Modal -->
    <div v-if="showCreateModal || editingTeam" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 pb-20 md:pb-4">
      <div class="bg-white dark:bg-slate-800 rounded-lg max-w-2xl w-full max-h-[calc(100vh-6rem)] md:max-h-[calc(100vh-2rem)] overflow-y-auto">
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">
              {{ editingTeam ? 'Edit Team' : 'Create New Team' }}
            </h3>
            <button 
              @click="closeModal"
              class="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            >
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form @submit.prevent="saveTeam" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Team Name</label>
                <input
                  v-model="teamForm.name"
                  type="text"
                  required
                  class="input-field"
                  placeholder="Lightning Bolts U12"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sport</label>
                <select v-model="teamForm.sport" required class="input-field">
                  <option value="">Select a sport</option>
                  <option v-for="sport in sports" :key="sport.id" :value="sport.name">{{ sport.name }}</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Age Group</label>
                <select v-model="teamForm.ageGroup" required class="input-field">
                  <option value="">Select age group</option>
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
                <select v-model="teamForm.skillLevel" required class="input-field">
                  <option value="">Select skill level</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Elite">Elite</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                <input
                  v-model="teamForm.phone"
                  type="tel"
                  required
                  class="input-field"
                  placeholder="(555) 123-4567"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">City</label>
                <input
                  v-model="teamForm.city"
                  type="text"
                  required
                  class="input-field"
                  placeholder="Denver"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">State</label>
                <input
                  v-model="teamForm.state"
                  type="text"
                  required
                  class="input-field"
                  placeholder="CO"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ZIP Code</label>
                <input
                  v-model="teamForm.zip"
                  type="text"
                  required
                  class="input-field"
                  placeholder="80202"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Home Venue</label>
                <input
                  v-model="teamForm.homeVenue"
                  type="text"
                  required
                  class="input-field"
                  placeholder="Denver Sports Complex"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Home Venue Address</label>
              <textarea
                v-model="teamForm.venueAddress"
                rows="3"
                class="input-field"
                placeholder="123 Sports Drive, Denver, CO 80202"
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Team Description (Optional)</label>
              <textarea
                v-model="teamForm.description"
                rows="3"
                class="input-field"
                placeholder="Tell other teams about your team..."
              ></textarea>
            </div>

            <div class="flex space-x-3 pt-6 pb-4">
              <button 
                type="button"
                @click="closeModal"
                class="btn btn-secondary flex-1"
              >
                Cancel
              </button>
              <button 
                type="submit"
                :disabled="loading"
                class="btn btn-primary flex-1"
              >
                {{ loading ? 'Saving...' : (editingTeam ? 'Update Team' : 'Create Team') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="teamToDelete" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 pb-20 md:pb-4">
      <div class="bg-white dark:bg-slate-800 rounded-lg max-w-md w-full p-6">
        <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Delete Team</h3>
        <p class="text-gray-600 dark:text-gray-300 mb-6">
          Are you sure you want to delete "{{ teamToDelete.name }}"? This action cannot be undone.
        </p>
        <div class="flex space-x-3">
          <button 
            @click="teamToDelete = null"
            class="btn btn-secondary flex-1"
          >
            Cancel
          </button>
          <button 
            @click="deleteTeam"
            class="btn flex-1 bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
          >
            Delete Team
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useTeamStore } from '../stores/teams.js'
import { useNotificationStore } from '../stores/notifications.js'

const teamStore = useTeamStore()
const notificationStore = useNotificationStore()

const showCreateModal = ref(false)
const editingTeam = ref(null)
const teamToDelete = ref(null)

// Use storeToRefs to maintain reactivity
const { loading, teams, sports } = storeToRefs(teamStore)

// Computed to format team data for display
const formattedTeams = computed(() => {
  return teams.value.map(team => ({
    ...team,
    sport: team.sport?.name || 'Unknown',
    totalMatches: team.totalMatches || 0,
    skillLevel: team.skill_level,
    homeVenue: team.home_venue,
    venueAddress: team.venue_address,
    // Explicitly preserve age_group field
    age_group: team.age_group
  }))
})

const teamForm = reactive({
  name: '',
  sport: '',
  ageGroup: '',
  skillLevel: '',
  phone: '',
  city: '',
  state: '',
  zip: '',
  homeVenue: '',
  venueAddress: '',
  description: ''
})

const resetForm = () => {
  Object.keys(teamForm).forEach(key => {
    teamForm[key] = ''
  })
}

const closeModal = () => {
  showCreateModal.value = false
  editingTeam.value = null
  resetForm()
}

const editTeam = (team) => {
  editingTeam.value = team
  
  // Debug: Log the team data to see what we're getting
  console.log('Editing team:', team)
  console.log('Team age_group:', team.age_group)
  
  // Map database fields to form fields
  Object.assign(teamForm, {
    name: team.name || '',
    sport: team.sport?.name || team.sport || '',
    ageGroup: team.age_group || '',
    skillLevel: team.skill_level || '',
    phone: team.phone || '',
    city: team.city || '',
    state: team.state || '',
    zip: team.zip || '',
    homeVenue: team.home_venue || '',
    venueAddress: team.venue_address || '',
    description: team.description || ''
  })
  
  // Debug: Log the form data after assignment
  console.log('Form after assignment:', { ...teamForm })
}

const confirmDelete = (team) => {
  teamToDelete.value = team
}

const saveTeam = async () => {
  try {
    if (editingTeam.value) {
      // Update existing team
      const result = await teamStore.updateTeam(editingTeam.value.id, teamForm)
      if (result.error) {
        throw new Error(result.error.message)
      }
    } else {
      // Create new team
      const result = await teamStore.createTeam(teamForm)
      if (result.error) {
        throw new Error(result.error.message)
      }
    }
    
    closeModal()
    // Force refresh teams after creation/update
    await teamStore.loadUserTeams()
  } catch (error) {
    console.error('Error saving team:', error)
    notificationStore.error('Save Failed', error.message)
  }
}

const deleteTeam = async () => {
  if (!teamToDelete.value) return
  
  try {
    const result = await teamStore.deleteTeam(teamToDelete.value.id)
    if (result.error) {
      throw new Error(result.error.message)
    }
    teamToDelete.value = null
    // Force refresh teams after deletion
    await teamStore.loadUserTeams()
  } catch (error) {
    console.error('Error deleting team:', error)
    notificationStore.error('Delete Failed', error.message)
  }
}

const loadTeams = async () => {
  try {
    await teamStore.loadUserTeams()
  } catch (error) {
    console.error('Error loading teams:', error)
    notificationStore.error('Loading Failed', 'Failed to load teams')
  }
}

onMounted(async () => {
  await loadTeams()
})
</script> 