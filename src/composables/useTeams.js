import { computed } from 'vue'
import { useTeamStore } from '../stores/teams.js'

export function useTeams() {
  const teamStore = useTeamStore()

  // Computed helpers
  const hasTeams = computed(() => teamStore.userTeams.length > 0)
  const activeTeamsCount = computed(() => teamStore.activeTeams.length)
  
  // Utility functions
  const formatTeamLocation = (team) => {
    if (team.city && team.state) {
      return `${team.city}, ${team.state}`
    }
    return team.city || team.state || 'Location not set'
  }

  const formatSkillLevel = (level) => {
    const levels = {
      'Beginner': { label: 'Beginner', color: 'green' },
      'Intermediate': { label: 'Intermediate', color: 'blue' },
      'Advanced': { label: 'Advanced', color: 'orange' },
      'Elite': { label: 'Elite', color: 'red' }
    }
    return levels[level] || { label: level, color: 'gray' }
  }

  const getTeamSport = (team) => {
    return team.sport?.name || team.sport_name || 'Unknown Sport'
  }

  const isTeamOwner = (team, userId) => {
    return team.user_id === userId
  }

  // Form validation helpers
  const validateTeamForm = (formData) => {
    const errors = []
    
    if (!formData.name?.trim()) {
      errors.push('Team name is required')
    }
    
    if (!formData.sport) {
      errors.push('Sport selection is required')
    }
    
    if (!formData.skillLevel) {
      errors.push('Skill level is required')
    }
    
    if (formData.phone && !isValidPhone(formData.phone)) {
      errors.push('Please enter a valid phone number')
    }
    
    if (formData.zip && !isValidZip(formData.zip)) {
      errors.push('Please enter a valid ZIP code')
    }
    
    return errors
  }

  const isValidPhone = (phone) => {
    const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/
    return phoneRegex.test(phone?.replace(/\D/g, ''))
  }

  const isValidZip = (zip) => {
    const zipRegex = /^\d{5}(-\d{4})?$/
    return zipRegex.test(zip)
  }

  // Quick actions
  const createQuickTeam = async (basicInfo) => {
    const defaultTeamData = {
      name: basicInfo.name,
      sport: basicInfo.sport,
      skillLevel: basicInfo.skillLevel || 'Intermediate',
      city: basicInfo.city || '',
      state: basicInfo.state || '',
      phone: basicInfo.phone || '',
      homeVenue: basicInfo.homeVenue || '',
      description: `${basicInfo.sport} team looking for matches`
    }
    
    return await teamStore.createTeam(defaultTeamData)
  }

  // Search and filter helpers
  const filterTeamsBySport = (sport) => {
    return teamStore.userTeams.filter(team => getTeamSport(team) === sport)
  }

  const filterTeamsBySkillLevel = (skillLevel) => {
    return teamStore.userTeams.filter(team => team.skill_level === skillLevel)
  }

  const getTeamStats = (team) => {
    return {
      totalMatches: team.totalMatches || 0,
      pendingRequests: 0, // Would be computed from match requests
      upcomingGames: 0, // Would be computed from calendar
      winRate: '0%' // Would be computed from match results
    }
  }

  // Calendar helpers
  const getTeamAvailabilityStatus = (team, date) => {
    // This would check the team's availability for a specific date
    // Implementation would depend on how availability data is structured
    return 'unknown'
  }

  const canTeamHost = (team) => {
    return !!(team.home_venue && team.venue_address)
  }

  const canTeamTravel = (team) => {
    // Logic to determine if team can travel
    // Could be based on travel preferences, distance limits, etc.
    return true
  }

  return {
    // Store access
    teamStore,
    
    // Computed
    hasTeams,
    activeTeamsCount,
    
    // Utilities
    formatTeamLocation,
    formatSkillLevel,
    getTeamSport,
    isTeamOwner,
    
    // Validation
    validateTeamForm,
    isValidPhone,
    isValidZip,
    
    // Quick actions
    createQuickTeam,
    
    // Filters
    filterTeamsBySport,
    filterTeamsBySkillLevel,
    
    // Stats
    getTeamStats,
    
    // Calendar
    getTeamAvailabilityStatus,
    canTeamHost,
    canTeamTravel
  }
} 