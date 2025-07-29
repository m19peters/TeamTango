<template>
  <div class="availability-picker">
    <!-- See Availability Button -->
    <button
      v-if="!showPicker"
      @click="loadAndShowAvailability"
      :disabled="loading"
      class="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
    >
      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <span>{{ loading ? 'Loading...' : (selectedDates.length > 0 ? `See Availability (${selectedDates.length} selected)` : 'See Availability') }}</span>
    </button>

    <!-- Full Screen Overlay -->
    <div v-if="showPicker" class="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-[10001] p-4" @click="showPicker = false">
      <!-- Availability Picker Modal -->
      <div @click.stop class="bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-gray-200 dark:border-slate-600 w-full max-w-md max-h-[80vh] flex flex-col">
      <!-- Header -->
      <div class="flex items-center justify-between p-3 border-b border-gray-200 dark:border-slate-600">
        <div class="flex items-center space-x-2">
          <svg class="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Select Available Dates</span>
        </div>
        <button
          @click="showPicker = false"
          class="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Available Dates List -->
      <div class="flex-1 overflow-y-auto">
        <div v-if="loading" class="p-4 text-center text-gray-500 dark:text-gray-400">
          <div class="animate-spin inline-block w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
          <span class="ml-2">Loading availability...</span>
        </div>

        <div v-else-if="availableDates.length === 0" class="p-4 text-center text-gray-500 dark:text-gray-400">
          <svg class="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p class="text-sm">No upcoming availability found for both teams</p>
        </div>

        <div v-else class="relative">
          <div class="p-2 space-y-1">
            <div
              v-for="dateOption in availableDates"
              :key="dateOption.date"
              @click="toggleDate(dateOption)"
              class="flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors"
              :class="selectedDates.includes(dateOption.date) 
                ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700' 
                : 'hover:bg-gray-50 dark:hover:bg-slate-700'"
            >
            <div class="flex-1">
              <div class="flex items-center space-x-2">
                <!-- Checkbox -->
                <div 
                  class="w-4 h-4 rounded border-2 flex items-center justify-center transition-colors"
                  :class="selectedDates.includes(dateOption.date) 
                    ? 'bg-blue-600 border-blue-600' 
                    : 'border-gray-300 dark:border-slate-500'"
                >
                  <svg v-if="selectedDates.includes(dateOption.date)" class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </div>

                <!-- Date -->
                <div>
                  <div class="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {{ dateOption.formatted }}
                  </div>
                  
                  <!-- Teams Available -->
                  <div class="flex flex-wrap gap-1 mt-1">
                    <div
                      v-for="team in dateOption.teams"
                      :key="`${dateOption.date}-${team.team_id}`"
                      class="inline-flex items-center px-2 py-0.5 rounded text-xs"
                      :class="getTeamBadgeClass(team)"
                    >
                      <span class="font-medium">{{ team.team_name }}</span>
                      <span v-if="team.time" class="ml-1 opacity-75">
                        @ {{ formatTime(team.time) }}
                      </span>
                      <span v-if="team.type === 'travel'" class="ml-1 opacity-75">(Travel)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>
          
          <!-- Scroll indicator when there are many dates -->
          <div v-if="availableDates.length > 5" class="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white dark:from-slate-800 to-transparent pointer-events-none flex items-end justify-center pb-1">
            <div class="text-xs text-gray-400 dark:text-gray-500">
              {{ availableDates.length }} dates available
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>

    <!-- Selected Dates Preview -->
    <div v-if="selectedDates.length > 0" class="mt-3">
      <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
        Dates to include in message
      </label>
      <div class="flex flex-wrap gap-2">
        <div
          v-for="date in selectedDates"
          :key="date"
          class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700"
        >
          <svg class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{{ formatDateForPreview(date) }}</span>
          <button
            @click="removeDate(date)"
            class="ml-2 text-blue-600 dark:text-blue-300 hover:text-blue-700 dark:hover:text-blue-200"
          >
            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useTeamStore } from '../stores/teams.js'
import { useNotificationStore } from '../stores/notifications.js'

// Props
const props = defineProps({
  teamIds: {
    type: Array,
    required: true,
    validator: (value) => value.length === 2
  },
  modelValue: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['update:modelValue'])

// Stores
const teamStore = useTeamStore()
const notificationStore = useNotificationStore()

// State
const loading = ref(false)
const showPicker = ref(false)
const availableDates = ref([])
const selectedDates = ref([...props.modelValue])

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue) => {
  selectedDates.value = [...newValue]
}, { deep: true })

// Watch for changes to selectedDates and emit
watch(selectedDates, (newValue) => {
  emit('update:modelValue', [...newValue])
}, { deep: true })

// Methods
const loadAndShowAvailability = async () => {
  if (props.teamIds.length !== 2) {
    notificationStore.error('Invalid Teams', 'Need exactly two teams to load availability')
    return
  }

  loading.value = true
  showPicker.value = true

  try {
    // Get combined availability for both teams for the next 60 days
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + 60)

    const result = await teamStore.getCombinedAvailability(
      props.teamIds,
      new Date().toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    )

    if (result.error) throw result.error

    availableDates.value = result.data || []
  } catch (error) {
    console.error('Error loading availability:', error)
    notificationStore.error('Failed to Load Availability', error.message)
    showPicker.value = false
  } finally {
    loading.value = false
  }
}

const toggleDate = (dateOption) => {
  const date = dateOption.date
  const index = selectedDates.value.indexOf(date)
  
  if (index > -1) {
    selectedDates.value.splice(index, 1)
  } else {
    selectedDates.value.push(date)
  }
}

const removeDate = (date) => {
  const index = selectedDates.value.indexOf(date)
  if (index > -1) {
    selectedDates.value.splice(index, 1)
  }
}

const getTeamBadgeClass = (team) => {
  if (team.type === 'travel') {
    return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200'
  }
  return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
}

const formatTime = (timeString) => {
  if (!timeString) return ''
  
  try {
    const [hours, minutes] = timeString.split(':')
    const date = new Date()
    date.setHours(parseInt(hours), parseInt(minutes))
    
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  } catch (error) {
    return timeString
  }
}

const formatDateForPreview = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  if (date.toDateString() === now.toDateString()) {
    return 'Today'
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow'
  } else {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }
}
</script>

<style scoped>
.availability-picker {
  /* Any additional styles if needed */
}
</style> 