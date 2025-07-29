import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useTeamStore } from './teams.js'

export const useViewingAsTeamStore = defineStore('viewingAsTeam', () => {
  // State
  const selectedTeamId = ref(null)
  
  // Get other stores
  const teamStore = useTeamStore()
  
  // Computed
  const selectedTeam = computed(() => {
    if (!selectedTeamId.value) return null
    return teamStore.userTeams.find(team => team.id === selectedTeamId.value)
  })
  
  const hasMultipleTeams = computed(() => {
    return teamStore.userTeams.length > 1
  })
  
  const availableTeams = computed(() => {
    return teamStore.userTeams.filter(team => team.status === 'Active')
  })
  
  // Actions
  const setViewingAsTeam = (teamId) => {
    selectedTeamId.value = teamId
    // Persist to localStorage
    if (teamId) {
      localStorage.setItem('viewingAsTeam', teamId)
    } else {
      localStorage.removeItem('viewingAsTeam')
    }
  }
  
  const initializeViewingAsTeam = () => {
    // Try to restore from localStorage first
    const saved = localStorage.getItem('viewingAsTeam')
    if (saved && teamStore.userTeams.some(team => team.id === saved)) {
      selectedTeamId.value = saved
      return
    }
    
    // Otherwise, default to first active team
    const firstActiveTeam = teamStore.userTeams.find(team => team.status === 'Active')
    if (firstActiveTeam) {
      selectedTeamId.value = firstActiveTeam.id
    }
  }
  
  const clearViewingAsTeam = () => {
    selectedTeamId.value = null
    localStorage.removeItem('viewingAsTeam')
  }
  
  // Helper to ensure we have a valid team selected when teams change
  const validateSelection = () => {
    if (selectedTeamId.value && !teamStore.userTeams.some(team => team.id === selectedTeamId.value)) {
      // Selected team no longer exists, reset to first available
      initializeViewingAsTeam()
    } else if (!selectedTeamId.value && teamStore.userTeams.length > 0) {
      // No team selected but teams available, select first one
      initializeViewingAsTeam()
    }
  }
  
  return {
    // State
    selectedTeamId,
    
    // Computed
    selectedTeam,
    hasMultipleTeams,
    availableTeams,
    
    // Actions
    setViewingAsTeam,
    initializeViewingAsTeam,
    clearViewingAsTeam,
    validateSelection
  }
}) 