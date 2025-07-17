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
                <!-- Team Logo -->
                <div class="w-10 h-10 mr-3 shrink-0">
                  <img 
                    v-if="team.logo_url" 
                    :src="team.logo_url" 
                    :alt="`${team.name} logo`"
                    class="w-full h-full rounded-full object-cover border border-gray-200 dark:border-gray-600"
                    @error="$event.target.style.display = 'none'"
                  />
                  <div 
                    v-else
                    class="w-full h-full bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-sm font-bold"
                  >
                    {{ team.name.charAt(0).toUpperCase() }}
                  </div>
                </div>
                
                <div class="flex-1">
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
            <!-- Team Logo Section -->
            <div class="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Team Logo</label>
              
              <!-- Current Logo Display -->
              <div class="flex items-center space-x-4 mb-4">
                <div class="w-16 h-16 relative">
                  <img 
                    v-if="currentLogoUrl && !logoToRemove" 
                    :src="currentLogoUrl" 
                    :alt="`${teamForm.name || 'Team'} logo`"
                    class="w-full h-full rounded-full object-cover border-2 border-primary-200 dark:border-primary-700 shadow-lg"
                    @error="onLogoError"
                  />
                  <div 
                    v-else-if="logoPreview && !logoToRemove"
                    class="w-full h-full rounded-full overflow-hidden border-2 border-primary-200 dark:border-primary-700 shadow-lg"
                  >
                    <img 
                      :src="logoPreview" 
                      :alt="'New logo preview'"
                      class="w-full h-full object-cover"
                    />
                  </div>
                  <div 
                    v-else
                    class="w-full h-full bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg"
                  >
                    {{ (teamForm.name || 'T').charAt(0).toUpperCase() }}
                  </div>
                </div>
                
                <div class="flex-1">
                  <div class="flex space-x-2">
                    <label class="btn btn-secondary cursor-pointer text-sm">
                      <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {{ currentLogoUrl ? 'Change Logo' : 'Upload Logo' }}
                      <input 
                        ref="logoInput"
                        type="file" 
                        class="hidden" 
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        @change="onLogoSelected"
                      />
                    </label>
                    
                    <button 
                      v-if="currentLogoUrl || logoPreview"
                      type="button"
                      @click="removeLogo"
                      class="btn text-sm bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800"
                    >
                      <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Remove
                    </button>
                  </div>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    JPEG, PNG, GIF, or WebP. Max 5MB.
                  </p>
                </div>
              </div>
            </div>

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

// Logo handling
const logoInput = ref(null)
const selectedLogo = ref(null)
const logoPreview = ref(null)
const currentLogoUrl = ref(null)
const logoToRemove = ref(false)

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
  description: '',
  logo: null
})

const resetForm = () => {
  Object.keys(teamForm).forEach(key => {
    teamForm[key] = key === 'logo' ? null : ''
  })
  
  // Reset logo state
  selectedLogo.value = null
  logoPreview.value = null
  currentLogoUrl.value = null
  logoToRemove.value = false
  
  // Clear file input
  if (logoInput.value) {
    logoInput.value.value = ''
  }
}

// Logo handling functions
const onLogoSelected = (event) => {
  const file = event.target.files[0]
  if (!file) return

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    notificationStore.error('Invalid File Type', 'Please upload a JPEG, PNG, GIF, or WebP image.')
    event.target.value = ''
    return
  }

  // Validate file size (5MB)
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    notificationStore.error('File Too Large', 'Logo must be less than 5MB.')
    event.target.value = ''
    return
  }

  selectedLogo.value = file
  teamForm.logo = file
  logoToRemove.value = false

  // Create preview
  const reader = new FileReader()
  reader.onload = (e) => {
    logoPreview.value = e.target.result
  }
  reader.readAsDataURL(file)
}

const removeLogo = () => {
  selectedLogo.value = null
  logoPreview.value = null
  logoToRemove.value = true
  teamForm.logo = null
  teamForm.deleteLogo = true
  
  // Clear file input
  if (logoInput.value) {
    logoInput.value.value = ''
  }
}

const onLogoError = (event) => {
  // Hide broken image and show fallback
  event.target.style.display = 'none'
  currentLogoUrl.value = null
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
    description: team.description || '',
    logo: null // Reset logo form field
  })
  
  // Set current logo URL for display
  currentLogoUrl.value = team.logo_url || null
  logoPreview.value = null
  selectedLogo.value = null
  logoToRemove.value = false
  
  // Clear file input
  if (logoInput.value) {
    logoInput.value.value = ''
  }
  
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