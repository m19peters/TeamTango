<template>
  <div class="viewing-as-team-selector">
    <!-- Single Team Display -->
    <div v-if="!viewingAsTeamStore.hasMultipleTeams && viewingAsTeamStore.selectedTeam" 
         class="single-team-display flex items-center space-x-3 px-4 py-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-600">
      
      <!-- Team Logo -->
      <div class="flex-shrink-0">
        <div v-if="viewingAsTeamStore.selectedTeam.logo_url" 
             class="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-200 dark:border-primary-600">
          <img :src="viewingAsTeamStore.selectedTeam.logo_url" 
               :alt="`${viewingAsTeamStore.selectedTeam.name} logo`" 
               class="w-full h-full object-cover">
        </div>
        <div v-else 
             class="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-sm font-bold border-2 border-primary-200 dark:border-primary-600">
          {{ viewingAsTeamStore.selectedTeam.name.charAt(0).toUpperCase() }}
        </div>
      </div>
      
      <!-- Team Info -->
      <div class="flex-1 min-w-0">
        <div class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
          {{ viewingAsTeamStore.selectedTeam.name }}
        </div>
        <div class="text-xs text-gray-500 dark:text-gray-400 truncate">
          {{ viewingAsTeamStore.selectedTeam.sport?.name }} • {{ viewingAsTeamStore.selectedTeam.age_group }}
        </div>
      </div>
    </div>

    <!-- Multiple Teams Selector -->
    <div v-else-if="viewingAsTeamStore.hasMultipleTeams" class="team-selector relative">
      <!-- Selected Team Button -->
      <button ref="selectorButton"
              @click="toggleDropdown"
              class="team-selector-button flex items-center space-x-3 px-4 py-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-600 hover:border-primary-300 dark:hover:border-primary-500 transition-all duration-200 min-w-[200px]">
        
        <!-- Team Logo -->
        <div class="flex-shrink-0">
          <div v-if="viewingAsTeamStore.selectedTeam?.logo_url" 
               class="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-200 dark:border-primary-600">
            <img :src="viewingAsTeamStore.selectedTeam.logo_url" 
                 :alt="`${viewingAsTeamStore.selectedTeam.name} logo`" 
                 class="w-full h-full object-cover">
          </div>
          <div v-else-if="viewingAsTeamStore.selectedTeam" 
               class="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-sm font-bold border-2 border-primary-200 dark:border-primary-600">
            {{ viewingAsTeamStore.selectedTeam.name.charAt(0).toUpperCase() }}
          </div>
          <div v-else 
               class="w-10 h-10 rounded-full bg-gray-300 dark:bg-slate-600 flex items-center justify-center">
            <svg class="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>
        
        <!-- Team Info -->
        <div class="flex-1 min-w-0 text-left">
          <div class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {{ viewingAsTeamStore.selectedTeam?.name || 'Select Team' }}
          </div>
          <div v-if="viewingAsTeamStore.selectedTeam" class="text-xs text-gray-500 dark:text-gray-400 truncate">
            {{ viewingAsTeamStore.selectedTeam.sport?.name }} • {{ viewingAsTeamStore.selectedTeam.age_group }}
          </div>
          <div v-else class="text-xs text-gray-500 dark:text-gray-400">
            Choose your team view
          </div>
        </div>
        
        <!-- Dropdown Arrow -->
        <div class="flex-shrink-0">
          <svg class="w-4 h-4 text-gray-400 transition-transform duration-200" 
               :class="{ 'rotate-180': showDropdown }" 
               fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      <!-- Dropdown Menu - Using Teleport to escape stacking context -->
      <Teleport to="body">
        <div v-if="showDropdown" 
             ref="dropdownMenu"
             class="dropdown-menu fixed bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-gray-200 dark:border-slate-600 z-[99999] overflow-hidden"
             style="z-index: 99999;"
             :style="dropdownPosition">
          
          <div class="py-2">
            <div v-for="team in viewingAsTeamStore.availableTeams" 
                 :key="team.id"
                 @click="selectTeam(team)"
                 class="dropdown-item flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer transition-colors duration-150"
                 :class="{ 'bg-primary-50 dark:bg-primary-900/20': team.id === viewingAsTeamStore.selectedTeamId }">
              
              <!-- Team Logo -->
              <div class="flex-shrink-0">
                <div v-if="team.logo_url" 
                     class="w-8 h-8 rounded-full overflow-hidden border border-gray-200 dark:border-slate-600">
                  <img :src="team.logo_url" 
                       :alt="`${team.name} logo`" 
                       class="w-full h-full object-cover">
                </div>
                <div v-else 
                     class="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-xs font-bold">
                  {{ team.name.charAt(0).toUpperCase() }}
                </div>
              </div>
              
              <!-- Team Info -->
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {{ team.name }}
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {{ team.sport?.name }} • {{ team.age_group }} • {{ team.city }}, {{ team.state }}
                </div>
              </div>
              
              <!-- Selected Indicator -->
              <div v-if="team.id === viewingAsTeamStore.selectedTeamId" 
                   class="flex-shrink-0">
                <svg class="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </Teleport>
    </div>

    <!-- No Teams State -->
    <div v-else class="no-teams-display flex items-center space-x-3 px-4 py-2 bg-gray-50 dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600">
      <div class="w-10 h-10 rounded-full bg-gray-300 dark:bg-slate-600 flex items-center justify-center">
        <svg class="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </div>
      <div class="flex-1">
        <div class="text-sm font-medium text-gray-500 dark:text-gray-400">
          No teams created
        </div>
        <div class="text-xs text-gray-400 dark:text-gray-500">
          Create a team to get started
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useViewingAsTeamStore } from '../stores/viewingAsTeam.js'

const viewingAsTeamStore = useViewingAsTeamStore()
const showDropdown = ref(false)
const dropdownMenu = ref(null)
const selectorButton = ref(null)

// Computed position for teleported dropdown
const dropdownPosition = computed(() => {
  if (!selectorButton.value) return {}
  
  const buttonRect = selectorButton.value.getBoundingClientRect()
  return {
    top: `${buttonRect.bottom + 8}px`,
    left: `${buttonRect.left}px`,
    width: `${buttonRect.width}px`,
    minWidth: '200px'
  }
})

// Methods
const selectTeam = (team) => {
  viewingAsTeamStore.setViewingAsTeam(team.id)
  showDropdown.value = false
}

// Update position when dropdown is shown
const toggleDropdown = async () => {
  showDropdown.value = !showDropdown.value
  if (showDropdown.value) {
    await nextTick()
    // Force position recalculation
    dropdownPosition.value
  }
}

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  if (!event.target.closest('.team-selector') && 
      !event.target.closest('.dropdown-menu')) {
    showDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('scroll', () => {
    if (showDropdown.value) {
      showDropdown.value = false
    }
  })
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('scroll', () => {
    if (showDropdown.value) {
      showDropdown.value = false
    }
  })
})
</script>

<style scoped>
.viewing-as-team-selector {
  @apply relative;
}

.team-selector-button:focus {
  @apply outline-none ring-2 ring-primary-500 ring-opacity-50;
}

.dropdown-item:last-child {
  @apply rounded-b-lg;
}

.dropdown-item:first-child {
  @apply rounded-t-lg;
}

.dropdown-menu {
  animation: slideDown 0.15s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style> 