import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth.js'
import { useTeamStore } from './teams.js'
import { useInteractionsStore } from './interactions.js'
import { useMessagesStore } from './messages.js'

export const useDashboardStore = defineStore('dashboard', () => {
  // State
  const lastViewedTimes = ref({
    likes: null,
    dislikes: null,
    requests: null
  })
  
  const showDislikedModal = ref(false)
  const showLikedModal = ref(false) 
  const showRequestsModal = ref(false)
  
  // Cache for team details from discovery
  const teamCache = ref({})

  // Get other stores
  const authStore = useAuthStore()
  const teamStore = useTeamStore()
  const interactionsStore = useInteractionsStore()
  const messagesStore = useMessagesStore()

  // Computed dashboard data
  const dashboardData = computed(() => {
    const userTeamIds = teamStore.userTeams.map(team => team.id)
    
    if (userTeamIds.length === 0) {
      return teamStore.userTeams.map(team => ({
        team,
        dislikedCount: 0,
        likesCount: 0,
        requestsCount: 0,
        hasNewLikes: false,
        hasNewDislikes: false,
        hasNewRequests: false
      }))
    }

    return teamStore.userTeams.map(team => {
      // Count interactions FROM this team (teams they disliked)
      const dislikedByThisTeam = interactionsStore.interactions.filter(
        interaction => interaction.user_team_id === team.id && interaction.interaction_type === 'dislike'
      )

      // Count likes FROM this team (teams they liked)
      const likedByThisTeam = interactionsStore.interactions.filter(
        interaction => interaction.user_team_id === team.id && interaction.interaction_type === 'like'
      )

      // Count likes TO this team (teams who liked them)
      const likedThisTeam = interactionsStore.interactions.filter(
        interaction => interaction.target_team_id === team.id && interaction.interaction_type === 'like'
      )

      // Count requests involving this team
      const requestsInvolving = messagesStore.conversations.filter(conv => 
        conv.requesting_team_id === team.id || conv.target_team_id === team.id
      )

      // Check for new items since last viewed
      const lastLikesView = lastViewedTimes.value.likes
      const lastDislikesView = lastViewedTimes.value.dislikes
      const lastRequestsView = lastViewedTimes.value.requests

      const hasNewLikes = lastLikesView ? 
        [...likedByThisTeam, ...likedThisTeam].some(item => 
          new Date(item.created_at || item.updated_at) > new Date(lastLikesView)
        ) : (likedByThisTeam.length + likedThisTeam.length) > 0

      const hasNewDislikes = lastDislikesView ?
        dislikedByThisTeam.some(item => 
          new Date(item.created_at || item.updated_at) > new Date(lastDislikesView)
        ) : dislikedByThisTeam.length > 0

      const hasNewRequests = lastRequestsView ?
        requestsInvolving.some(item => 
          new Date(item.created_at || item.last_activity_at) > new Date(lastRequestsView)
        ) : requestsInvolving.length > 0

      return {
        team,
        dislikedCount: dislikedByThisTeam.length,
        likesCount: likedByThisTeam.length + likedThisTeam.length,
        requestsCount: requestsInvolving.length,
        hasNewLikes,
        hasNewDislikes,
        hasNewRequests
      }
    })
  })

  // Get disliked teams for modal
  const dislikedTeams = computed(() => {
    const userTeamIds = teamStore.userTeams.map(team => team.id)
    
    const dislikedInteractions = interactionsStore.interactions
      .filter(interaction => 
        userTeamIds.includes(interaction.user_team_id) && 
        interaction.interaction_type === 'dislike'
      )
      .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))

    return dislikedInteractions.map(interaction => {
      // Try to find team details from discovery cache or create placeholder
      const targetTeam = teamCache.value[interaction.target_team_id] || {
        id: interaction.target_team_id,
        name: 'Team',
        sport: { name: 'Unknown' },
        skill_level: 'Unknown',
        city: 'Unknown',
        state: 'Unknown'
      }

      return {
        interaction,
        targetTeam,
        userTeam: teamStore.userTeams.find(t => t.id === interaction.user_team_id)
      }
    })
  })

  // Get liked teams for modal (teams user liked + teams that liked user)
  const likedTeams = computed(() => {
    const userTeamIds = teamStore.userTeams.map(team => team.id)
    
    // Teams the user liked
    const userLiked = interactionsStore.interactions
      .filter(interaction => 
        userTeamIds.includes(interaction.user_team_id) && 
        interaction.interaction_type === 'like'
      )
      .map(interaction => ({
        interaction,
        targetTeam: teamCache.value[interaction.target_team_id] || {
          id: interaction.target_team_id,
          name: 'Team',
          sport: { name: 'Unknown' },
          skill_level: 'Unknown',
          city: 'Unknown',
          state: 'Unknown'
        },
        userTeam: teamStore.userTeams.find(t => t.id === interaction.user_team_id),
        direction: 'outgoing' // User liked this team
      }))

    // Teams that liked the user
    const likedUser = interactionsStore.interactions
      .filter(interaction => 
        userTeamIds.includes(interaction.target_team_id) && 
        interaction.interaction_type === 'like'
      )
      .map(interaction => ({
        interaction,
        targetTeam: teamCache.value[interaction.user_team_id] || {
          id: interaction.user_team_id,
          name: 'Team',
          sport: { name: 'Unknown' },
          skill_level: 'Unknown',
          city: 'Unknown',
          state: 'Unknown'
        },
        userTeam: teamStore.userTeams.find(t => t.id === interaction.target_team_id),
        direction: 'incoming' // This team liked user
      }))

    return [...userLiked, ...likedUser]
      .sort((a, b) => new Date(b.interaction.updated_at || b.interaction.created_at) - 
                      new Date(a.interaction.updated_at || a.interaction.created_at))
  })

  // Actions
  const markLikesAsViewed = () => {
    lastViewedTimes.value.likes = new Date().toISOString()
    saveViewedTimes()
  }

  const markDislikesAsViewed = () => {
    lastViewedTimes.value.dislikes = new Date().toISOString()
    saveViewedTimes()
  }

  const markRequestsAsViewed = () => {
    lastViewedTimes.value.requests = new Date().toISOString()
    saveViewedTimes()
  }

  const saveViewedTimes = () => {
    if (authStore.user?.id) {
      localStorage.setItem(
        `dashboard_viewed_${authStore.user.id}`,
        JSON.stringify(lastViewedTimes.value)
      )
    }
  }

  const loadViewedTimes = () => {
    if (authStore.user?.id) {
      try {
        const saved = localStorage.getItem(`dashboard_viewed_${authStore.user.id}`)
        if (saved) {
          lastViewedTimes.value = JSON.parse(saved)
        }
      } catch (error) {
        console.error('Error loading dashboard viewed times:', error)
      }
    }
  }

  // Modal actions
  const openDislikedModal = () => {
    showDislikedModal.value = true
    markDislikesAsViewed()
  }

  const openLikedModal = () => {
    showLikedModal.value = true
    markLikesAsViewed()
  }

  const openRequestsModal = () => {
    showRequestsModal.value = true
    markRequestsAsViewed()
  }

  const closeAllModals = () => {
    showDislikedModal.value = false
    showLikedModal.value = false
    showRequestsModal.value = false
  }

  // Remove dislike
  const removeDislike = async (userTeamId, targetTeamId) => {
    await interactionsStore.removeTeamInteraction(userTeamId, targetTeamId)
  }

  // Toggle like (for incoming likes - user can like back)
  const toggleLike = async (userTeamId, targetTeamId, currentDirection) => {
    if (currentDirection === 'incoming') {
      // User wants to like back
      await interactionsStore.setTeamInteraction(userTeamId, targetTeamId, 'like')
    } else {
      // User wants to unlike
      await interactionsStore.removeTeamInteraction(userTeamId, targetTeamId)
    }
  }

  // Initialize
  const initialize = () => {
    loadViewedTimes()
  }

  // Cache team data from discovery
  const cacheTeamData = (teams) => {
    teams.forEach(team => {
      teamCache.value[team.id] = team
    })
  }

  // Clear data
  const clearDashboard = () => {
    lastViewedTimes.value = {
      likes: null,
      dislikes: null,
      requests: null
    }
    teamCache.value = {}
    closeAllModals()
  }

  return {
    // State
    showDislikedModal,
    showLikedModal,
    showRequestsModal,
    lastViewedTimes,
    teamCache,

    // Computed
    dashboardData,
    dislikedTeams,
    likedTeams,

    // Actions
    markLikesAsViewed,
    markDislikesAsViewed,
    markRequestsAsViewed,
    openDislikedModal,
    openLikedModal,
    openRequestsModal,
    closeAllModals,
    removeDislike,
    toggleLike,
    cacheTeamData,
    initialize,
    clearDashboard
  }
}) 