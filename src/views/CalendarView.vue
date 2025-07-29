<template>
  <div class="min-h-screen bg-gray-50 dark:bg-slate-900 pb-20 md:pb-0">
    <!-- Header -->
    <div class="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 md:mt-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Calendar</h1>
            <p class="text-gray-600 dark:text-gray-300">Manage your team's availability</p>
          </div>
          
          <div class="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <!-- Viewing As Team Selector -->
            <div class="w-full sm:w-auto">
              <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">
                Calendar for
              </label>
              <ViewingAsTeamSelector />
            </div>
            
            <button 
              @click="showAddAvailabilityModal = true"
              class="btn btn-primary shrink-0 w-full sm:w-auto justify-center"
              :disabled="!viewingAsTeamStore.selectedTeam"
            >
              + Add Availability
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Calendar Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">

      <!-- Calendar Navigation -->
      <div class="bg-white dark:bg-slate-800 rounded-lg shadow border border-gray-200 dark:border-slate-700 mb-6">
        <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
          <button 
            @click="previousMonth"
            class="btn btn-ghost"
          >
            ← Previous
          </button>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {{ monthNames[currentMonth] }} {{ currentYear }}
          </h2>
          <button 
            @click="nextMonth"
            class="btn btn-ghost"
          >
            Next →
          </button>
        </div>

        <!-- Calendar Grid -->
        <div class="p-4">
          <!-- Days of week header -->
          <div class="grid grid-cols-7 gap-1 mb-2">
            <div 
              v-for="day in daysOfWeek" 
              :key="day"
              class="p-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400"
            >
              {{ day }}
            </div>
          </div>

          <!-- Calendar days -->
          <div class="grid grid-cols-7 gap-1">
            <div 
              v-for="(day, index) in calendarDays" 
              :key="index"
              :class="[
                'p-2 min-h-[80px] border border-gray-200 dark:border-slate-600 rounded',
                day.isCurrentMonth ? 'bg-white dark:bg-slate-700' : 'bg-gray-50 dark:bg-slate-800',
                day.isToday ? 'ring-2 ring-primary-500' : ''
              ]"
            >
              <div v-if="day.day" class="h-full">
                <div :class="[
                  'text-sm font-medium mb-1',
                  day.isToday ? 'text-primary-600 dark:text-primary-400' : 'text-gray-900 dark:text-gray-100'
                ]">
                  {{ day.day }}
                </div>
                <div class="space-y-1">
                  <div 
                    v-for="event in day.events.slice(0, 2)" 
                    :key="event.id"
                    :class="[
                      'text-xs p-1 rounded truncate cursor-pointer flex items-center justify-between group',
                      getEventTypeClass(event.type)
                    ]"
                  >
                    <span @click="editEvent(event)" class="flex-1 truncate">
                      {{ event.title || event.type }}
                    </span>
                    <button 
                      @click.stop="deleteEvent(event)"
                      class="opacity-0 group-hover:opacity-100 ml-1 text-red-600 hover:text-red-800 transition-opacity"
                      title="Delete"
                    >
                      ×
                    </button>
                  </div>
                  <div 
                    v-if="day.events.length > 2" 
                    class="text-xs text-gray-500 dark:text-gray-400"
                  >
                    +{{ day.events.length - 2 }} more
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Upcoming Events -->
      <div class="bg-white dark:bg-slate-800 rounded-lg shadow border border-gray-200 dark:border-slate-700">
        <div class="p-4 border-b border-gray-200 dark:border-slate-700">
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">Upcoming Events</h3>
        </div>
        <div class="p-4">
          <div v-if="upcomingEvents.length === 0" class="text-center py-8">
            <svg class="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p class="text-gray-500 dark:text-gray-400">No upcoming events</p>
            <button 
              @click="showAddAvailabilityModal = true"
              class="btn btn-primary mt-4"
            >
              Add First Event
            </button>
          </div>

          <div v-else class="space-y-3">
            <div 
              v-for="event in upcomingEvents.slice(0, 5)" 
              :key="event.id"
              class="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg"
            >
              <div class="flex-1">
                <h4 class="font-medium text-gray-900 dark:text-gray-100">{{ event.title }}</h4>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {{ event.formattedDate }}
                  <span v-if="event.time && event.time !== 'No time specified'"> at {{ event.time }}</span>
                  <span v-if="event.duration && event.time !== 'All Day'"> ({{ event.duration }}h)</span>
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-500">{{ event.team }}</p>
              </div>
              <div class="flex space-x-2">
                <button 
                  @click="editEvent(event)"
                  class="btn btn-secondary text-xs px-2 py-1"
                >
                  Edit
                </button>
                <button 
                  @click="deleteEvent(event)"
                  class="btn text-xs px-2 py-1 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Availability Modal -->
    <div v-if="showAddAvailabilityModal || editingEvent" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4">
              <div class="bg-white dark:bg-slate-800 rounded-lg max-w-md w-full max-h-[85vh] overflow-y-auto shadow-2xl">
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">
              {{ editingEvent ? 'Edit Event' : 'Add Availability' }}
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

          <form @submit.prevent="saveEvent" class="space-y-4">
            <!-- Team Display -->
            <div v-if="viewingAsTeamStore.selectedTeam" class="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Team</label>
              <div class="flex items-center space-x-3">
                <div class="flex-shrink-0">
                  <div v-if="viewingAsTeamStore.selectedTeam.logo_url" 
                       class="w-8 h-8 rounded-full overflow-hidden border border-gray-200 dark:border-slate-600">
                    <img :src="viewingAsTeamStore.selectedTeam.logo_url" 
                         :alt="`${viewingAsTeamStore.selectedTeam.name} logo`" 
                         class="w-full h-full object-cover">
                  </div>
                  <div v-else 
                       class="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-xs font-bold">
                    {{ viewingAsTeamStore.selectedTeam.name.charAt(0).toUpperCase() }}
                  </div>
                </div>
                <div>
                  <div class="font-medium text-gray-900 dark:text-gray-100">{{ viewingAsTeamStore.selectedTeam.name }}</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    {{ viewingAsTeamStore.selectedTeam.sport?.name }} • {{ viewingAsTeamStore.selectedTeam.age_group }}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
              <select v-model="eventForm.type" required class="input-field" @change="resetFormForType">
                <option value="available">Available to Host</option>
                <option value="travel">Available to Travel</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>

            <!-- Date Selection -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {{ eventForm.type === 'travel' ? 'Date(s)' : 'Date' }}
              </label>
              
              <!-- Quick Weekend Buttons for Travel -->
              <div v-if="eventForm.type === 'travel'" class="mb-3">
                <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">Quick Actions:</p>
                <div class="flex flex-wrap gap-2">
                  <button 
                    type="button"
                    @click="addEveryWeekendThisMonth"
                    class="btn btn-secondary text-xs px-3 py-1"
                  >
                    All Weekends This Month
                  </button>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Start Date</label>
                  <input
                    v-model="eventForm.startDate"
                    type="date"
                    required
                    class="input-field"
                  />
                </div>
                <div v-if="eventForm.type === 'travel' || eventForm.type === 'available'">
                  <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">End Date (Optional)</label>
                  <input
                    v-model="eventForm.endDate"
                    type="date"
                    class="input-field"
                    :min="eventForm.startDate"
                  />
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Creates individual entries for each date
                  </p>
                </div>
              </div>

              <!-- Selected Dates Preview -->
              <div v-if="selectedDatesPreview.length > 1" class="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p class="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                  Will create {{ selectedDatesPreview.length }} availability entries:
                </p>
                <div class="flex flex-wrap gap-1">
                  <span 
                    v-for="date in selectedDatesPreview.slice(0, 10)" 
                    :key="date"
                    class="text-xs bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-1 rounded"
                  >
                    {{ formatDateShort(date) }}
                  </span>
                  <span v-if="selectedDatesPreview.length > 10" class="text-xs text-blue-600 dark:text-blue-400">
                    +{{ selectedDatesPreview.length - 10 }} more
                  </span>
                </div>
              </div>
            </div>

            <!-- Time Selection - Only for Host Availability -->
            <div v-if="eventForm.type === 'available'">
              <div class="flex items-center space-x-3 mb-3">
                <input
                  v-model="eventForm.allDay"
                  type="checkbox"
                  id="allDay"
                  class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label for="allDay" class="text-sm font-medium text-gray-700 dark:text-gray-300">
                  All Day Availability
                </label>
              </div>

              <div v-if="!eventForm.allDay" class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Start Time</label>
                  <input
                    v-model="eventForm.time"
                    type="time"
                    :required="!eventForm.allDay"
                    class="input-field"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Duration (hours)</label>
                  <select v-model="eventForm.duration" :required="!eventForm.allDay" class="input-field">
                    <option value="1">1 hour</option>
                    <option value="1.5">1.5 hours</option>
                    <option value="2">2 hours</option>
                    <option value="2.5">2.5 hours</option>
                    <option value="3">3 hours</option>
                    <option value="4">4 hours</option>
                    <option value="6">6 hours</option>
                    <option value="8">8 hours</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes (Optional)</label>
              <textarea
                v-model="eventForm.notes"
                rows="3"
                class="input-field"
                placeholder="Additional information..."
              ></textarea>
            </div>

            <div class="flex space-x-3 pt-4 pb-4">
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
                {{ loading ? 'Saving...' : (editingEvent ? 'Update' : 'Add') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useTeamStore } from '../stores/teams.js'
import { useNotificationStore } from '../stores/notifications.js'
import { useViewingAsTeamStore } from '../stores/viewingAsTeam.js'
import ViewingAsTeamSelector from '../components/ViewingAsTeamSelector.vue'

const teamStore = useTeamStore()
const notificationStore = useNotificationStore()
const viewingAsTeamStore = useViewingAsTeamStore()

const showAddAvailabilityModal = ref(false)
const editingEvent = ref(null)
const currentDate = ref(new Date())
const events = ref([])
const loading = ref(false)

// Use teams from store
const teams = computed(() => teamStore.userTeams)

const eventForm = reactive({
  teamId: '',
  type: 'available',
  startDate: '',
  endDate: '',
  time: '',
  duration: '2',
  allDay: false,
  notes: ''
})

// Watch for team changes and update form
watch(() => viewingAsTeamStore.selectedTeamId, (newTeamId) => {
  eventForm.teamId = newTeamId || ''
}, { immediate: true })

// Calendar related computed properties
const currentMonth = computed(() => currentDate.value.getMonth())
const currentYear = computed(() => currentDate.value.getFullYear())

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const daysInMonth = computed(() => new Date(currentYear.value, currentMonth.value + 1, 0).getDate())
const firstDayOfMonth = computed(() => new Date(currentYear.value, currentMonth.value, 1).getDay())

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const calendarDays = computed(() => {
  const days = []
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth.value; i++) {
    days.push({ day: null, isCurrentMonth: false, events: [] })
  }
  
  // Add days of the current month
  for (let day = 1; day <= daysInMonth.value; day++) {
    const dateStr = `${currentYear.value}-${String(currentMonth.value + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const dayEvents = events.value.filter(event => event.date === dateStr)
    
    days.push({
      day,
      isCurrentMonth: true,
      date: dateStr,
      events: dayEvents,
      isToday: new Date().toDateString() === new Date(currentYear.value, currentMonth.value, day).toDateString()
    })
  }
  
  return days
})

// Since we're only loading one team's calendar now, no filtering needed
const filteredEvents = computed(() => events.value)

const upcomingEvents = computed(() => {
  const now = new Date()
  return events.value
    .filter(event => new Date(event.date) >= now)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map(event => ({
      ...event,
      formattedDate: new Date(event.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      }),
      time: event.time ? new Date('2000-01-01T' + event.time).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit'
      }) : (event.all_day ? 'All Day' : 'No time specified')
    }))
})

// Computed property for date range preview
const selectedDatesPreview = computed(() => {
  if (!eventForm.startDate) return []
  
  // Parse dates without timezone conversion
  const parseDate = (dateStr) => {
    const [year, month, day] = dateStr.split('-').map(Number)
    return new Date(year, month - 1, day)
  }
  
  const formatDate = (date) => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }
  
  const startDate = parseDate(eventForm.startDate)
  const endDate = eventForm.endDate ? parseDate(eventForm.endDate) : startDate
  
  const dates = []
  let current = new Date(startDate)
  
  // Special handling for weekend-only selections (when using quick weekend buttons)
  const isWeekendOnlySelection = eventForm.type === 'travel' && 
                                 eventForm.endDate && 
                                 eventForm.startDate !== eventForm.endDate &&
                                 isLikelyWeekendSelection(eventForm.startDate, eventForm.endDate)
  
  console.log('Preview - isWeekendOnlySelection:', isWeekendOnlySelection)
  console.log('Preview - start:', eventForm.startDate, 'end:', eventForm.endDate)
  
  while (current <= endDate) {
    const currentDateStr = formatDate(current)
    
    if (isWeekendOnlySelection) {
      const dayOfWeek = current.getDay()
      // Only include Friday (5), Saturday (6), and Sunday (0)
      if (dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0) {
        dates.push(currentDateStr)
      }
    } else {
      // For single dates or host availability, include all dates
      dates.push(currentDateStr)
    }
    current.setDate(current.getDate() + 1)
  }
  
  console.log('Preview - selected dates:', dates)
  return dates
})

// Helper function to detect if this is likely a weekend-only selection
const isLikelyWeekendSelection = (startDateStr, endDateStr) => {
  // Parse dates without timezone conversion
  const parseDate = (dateStr) => {
    const [year, month, day] = dateStr.split('-').map(Number)
    return new Date(year, month - 1, day)
  }
  
  const startDate = parseDate(startDateStr)
  const endDate = parseDate(endDateStr)
  const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
  
  // If the selection spans more than 7 days, it's likely a month-wide weekend selection
  // Or if it starts on a Friday, it's likely a weekend selection
  return daysDiff > 7 || startDate.getDay() === 5
}

const closeModal = () => {
  showAddAvailabilityModal.value = false
  editingEvent.value = null
  resetForm()
}

const resetForm = () => {
  Object.keys(eventForm).forEach(key => {
    if (key === 'type') {
      eventForm[key] = 'available'
    } else if (key === 'duration') {
      eventForm[key] = '2'
    } else if (key === 'allDay') {
      eventForm[key] = false
    } else {
      eventForm[key] = ''
    }
  })
}

const resetFormForType = () => {
  if (eventForm.type === 'travel') {
    eventForm.startDate = ''
    eventForm.endDate = ''
    eventForm.allDay = false
    eventForm.time = ''
    eventForm.duration = ''
  } else {
    eventForm.startDate = ''
    eventForm.endDate = ''
    eventForm.allDay = false
    eventForm.time = ''
    eventForm.duration = '2'
  }
}

const editEvent = (event) => {
  editingEvent.value = event
  Object.keys(eventForm).forEach(key => {
    if (key === 'startDate') {
      eventForm[key] = event.date || ''
    } else if (key === 'endDate') {
      eventForm[key] = '' // Clear end date for editing single events
    } else if (key === 'allDay') {
      eventForm[key] = event.all_day || false
    } else if (key === 'teamId') {
      eventForm[key] = event.team_id || ''
    } else {
      eventForm[key] = event[key] || (key === 'duration' ? '2' : (key === 'type' ? 'available' : ''))
    }
  })
}

const deleteEvent = async (event) => {
  if (confirm('Are you sure you want to delete this event?')) {
    try {
      const result = await teamStore.deleteTeamAvailability(event.id)
      if (result.error) throw result.error
      
      events.value = events.value.filter(e => e.id !== event.id)
    } catch (error) {
      console.error('Error deleting event:', error)
      notificationStore.error('Delete Failed', error.message)
    }
  }
}

const saveEvent = async () => {
  loading.value = true
  
  try {
    // Validate required fields based on type
    if (eventForm.type === 'available' && !eventForm.allDay && !eventForm.time) {
      throw new Error('Start time is required for hosting availability')
    }
    
    if (!eventForm.startDate) {
      throw new Error('Start date is required')
    }

    // Get all dates to create availability for
    const datesToCreate = selectedDatesPreview.value
    console.log('Dates to create:', datesToCreate)
    console.log('Form data:', { ...eventForm })

    if (editingEvent.value) {
      // Update existing availability (single date only)
      const formData = {
        teamId: eventForm.teamId,
        type: eventForm.type,
        date: eventForm.startDate,
        allDay: eventForm.allDay,
        time: eventForm.allDay ? null : eventForm.time,
        duration: eventForm.allDay ? null : eventForm.duration,
        notes: eventForm.notes
      }

      const result = await teamStore.updateTeamAvailability(editingEvent.value.id, formData)
      if (result.error) throw result.error
      
      // Update the event in local array
      const index = events.value.findIndex(e => e.id === editingEvent.value.id)
      if (index !== -1) {
        events.value[index] = {
          ...result.data,
          team: getTeamName(eventForm.teamId),
          title: getEventTitle(eventForm.type, getTeamName(eventForm.teamId))
        }
      }
    } else {
      // Create new availability entries (one for each date)
      const createdEvents = []
      
      for (const date of datesToCreate) {
        console.log('Creating availability for date:', date)
        const formData = {
          teamId: eventForm.teamId,
          type: eventForm.type,
          date: date,
          allDay: eventForm.allDay,
          time: eventForm.allDay ? null : eventForm.time,
          duration: eventForm.allDay ? null : eventForm.duration,
          notes: eventForm.notes
        }

        console.log('Sending form data:', formData)
        const result = await teamStore.addTeamAvailability(eventForm.teamId, formData)
        if (result.error) {
          console.error('Error creating availability:', result.error)
          throw result.error
        }
        
        console.log('Created availability:', result.data)
        const newEvent = {
          ...result.data,
          team: getTeamName(eventForm.teamId),
          title: getEventTitle(eventForm.type, getTeamName(eventForm.teamId))
        }
        createdEvents.push(newEvent)
      }
      
      console.log('Created', createdEvents.length, 'events')
      // Add all new events to the local array
      events.value.push(...createdEvents)
    }
    
    closeModal()
  } catch (error) {
    console.error('Error saving event:', error)
    notificationStore.error('Save Failed', error.message)
  } finally {
    loading.value = false
  }
}

const getTeamName = (teamId) => {
  const team = teams.value.find(t => t.id === teamId)
  return team?.name || ''
}

const getEventTitle = (type, teamName) => {
  switch (type) {
    case 'available': return `Available to Host - ${teamName}`
    case 'travel': return `Available to Travel - ${teamName}`
    case 'unavailable': return `Unavailable - ${teamName}`
    default: return teamName
  }
}

const loadTeamCalendar = async () => {
  try {
    loading.value = true
    events.value = []
    
    // Only load calendar for the selected viewing team
    if (!viewingAsTeamStore.selectedTeamId) {
      loading.value = false
      return
    }
    
    const result = await teamStore.getTeamAvailability(viewingAsTeamStore.selectedTeamId)
    if (result.error) {
      console.error('Error loading calendar for team:', viewingAsTeamStore.selectedTeamId, result.error)
      loading.value = false
      return
    }
    
    const teamEvents = result.data.map(availability => ({
      ...availability,
      team: viewingAsTeamStore.selectedTeam.name,
      title: getEventTitle(availability.type, viewingAsTeamStore.selectedTeam.name)
    }))
    
    events.value = teamEvents
  } catch (error) {
    console.error('Error loading team calendar:', error)
    notificationStore.error('Loading Failed', 'Failed to load calendar data')
  } finally {
    loading.value = false
  }
}

const previousMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1)
}

const goToToday = () => {
  currentDate.value = new Date()
}

const getEventTypeClass = (type) => {
  const classes = {
    available: 'bg-green-100 text-green-800 border-green-200',
    travel: 'bg-blue-100 text-blue-800 border-blue-200',
    unavailable: 'bg-red-100 text-red-800 border-red-200'
  }
  return classes[type] || classes.available
}

const addEveryWeekendThisMonth = () => {
  // Use the calendar's current displayed month, not today's month
  const year = currentYear.value
  const month = currentMonth.value
  
  console.log('Adding weekends for calendar month:', month + 1, 'year:', year)
  
  // Get first and last day of current displayed month
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  
  // Find all complete Friday-Sunday weekend ranges in the month
  const weekendRanges = []
  let current = new Date(firstDay)
  
  while (current <= lastDay) {
    const dayOfWeek = current.getDay()
    
    // If we find a Friday, create a weekend range
    if (dayOfWeek === 5) {
      const friday = new Date(current)
      const saturday = new Date(current)
      saturday.setDate(friday.getDate() + 1)
      const sunday = new Date(current)
      sunday.setDate(friday.getDate() + 2)
      
      // Make sure all three days are within the month
      if (sunday.getMonth() === month) {
        // Format dates without timezone conversion
        const formatDate = (date) => {
          const y = date.getFullYear()
          const m = String(date.getMonth() + 1).padStart(2, '0')
          const d = String(date.getDate()).padStart(2, '0')
          return `${y}-${m}-${d}`
        }
        
        weekendRanges.push({
          start: formatDate(friday),
          end: formatDate(sunday)
        })
      }
    }
    current.setDate(current.getDate() + 1)
  }
  
  console.log('Found weekend ranges:', weekendRanges)
  
  if (weekendRanges.length > 0) {
    // Use the first Friday and last Sunday across all weekend ranges
    eventForm.startDate = weekendRanges[0].start
    eventForm.endDate = weekendRanges[weekendRanges.length - 1].end
    console.log('Set date range:', eventForm.startDate, 'to', eventForm.endDate)
  }
}

const generateDates = (startDate, endDate) => {
  const dates = [];
  let current = new Date(startDate);
  while (current <= endDate) {
    dates.push(current.toISOString().slice(0, 10));
    current.setDate(current.getDate() + 1);
  }
  return dates;
};

const formatDateShort = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

onMounted(async () => {
  await teamStore.loadUserTeams()
  await loadTeamCalendar()
})

// Watch for viewing team changes and reload calendar
watch(() => viewingAsTeamStore.selectedTeamId, () => {
  loadTeamCalendar()
}, { immediate: false })
</script> 