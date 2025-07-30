import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../config/supabase.js'
import { useAuthStore } from './auth.js'
import { useTeamStore } from './teams.js'
import { useInteractionsStore } from './interactions.js'
import { useMessagesStore } from './messages.js'
import { useViewingAsTeamStore } from './viewingAsTeam.js'

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
  const viewingAsTeamStore = useViewingAsTeamStore()

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
  const dislikedTeams = ref([])
  
  const loadDislikedTeams = async () => {
    // Only show dislikes for the currently selected viewing team
    const currentTeamId = viewingAsTeamStore.selectedTeamId
    if (!currentTeamId) {
      dislikedTeams.value = []
      return
    }
    
    const dislikedInteractions = interactionsStore.interactions
      .filter(interaction => 
        interaction.user_team_id === currentTeamId && 
        interaction.interaction_type === 'dislike'
      )
      .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))

    // Load team details for each disliked team
    const dislikedPromises = dislikedInteractions.map(async interaction => ({
      interaction,
      targetTeam: await getTeamDetails(interaction.target_team_id),
      userTeam: teamStore.userTeams.find(t => t.id === currentTeamId)
    }))

    dislikedTeams.value = await Promise.all(dislikedPromises)
  }

  // Helper function to get team details
  const getTeamDetails = async (teamId) => {
    // Check cache first
    if (teamCache.value[teamId]) {
      return teamCache.value[teamId]
    }

    // Check if it's one of user's teams
    const userTeam = teamStore.userTeams.find(t => t.id === teamId)
    if (userTeam) {
      teamCache.value[teamId] = userTeam
      return userTeam
    }

    // Fetch from database
    try {
      const { data, error } = await supabase
        .from('teams')
        .select(`
          id, 
          name, 
          skill_level, 
          city, 
          state, 
          logo_url,
          sport:sports(name)
        `)
        .eq('id', teamId)
        .eq('active', true)
        .single()

      if (error || !data) {
        // Return placeholder if team not found
        return {
          id: teamId,
          name: 'Unknown Team',
          sport: { name: 'Unknown' },
          skill_level: 'Unknown',
          city: 'Unknown',
          state: 'Unknown'
        }
      }

      // Ensure sport is properly formatted
      if (data.sport && data.sport.name) {
        // Sport is already in correct format from JOIN
      } else {
        data.sport = { name: 'Unknown' }
      }

      // Cache the result
      teamCache.value[teamId] = data
      return data
    } catch (error) {
      console.error('Error fetching team details:', error)
      return {
        id: teamId,
        name: 'Unknown Team',
        sport: { name: 'Unknown' },
        skill_level: 'Unknown',
        city: 'Unknown',
        state: 'Unknown'
      }
    }
  }

  // Get liked teams for modal (teams user liked + teams that liked user)
  const likedTeams = ref([])
  
  const loadLikedTeams = async () => {
    // Only show likes for the currently selected viewing team
    const currentTeamId = viewingAsTeamStore.selectedTeamId
    if (!currentTeamId) {
      likedTeams.value = []
      return
    }

    // Find likes where current team liked others
    const outgoingLikes = interactionsStore.interactions
      .filter(interaction => 
        interaction.user_team_id === currentTeamId && 
        interaction.interaction_type === 'like'
      )
    
    // Find likes where others liked current team  
    const incomingLikes = interactionsStore.interactions
      .filter(interaction => 
        interaction.target_team_id === currentTeamId && 
        interaction.interaction_type === 'like'
      )

    // Map to get unique relationships by other team
    const relationships = new Map()
    
    // Process outgoing likes (current team liked other teams)
    for (const interaction of outgoingLikes) {
      const otherTeamId = interaction.target_team_id
      const otherTeam = await getTeamDetails(otherTeamId)
      
      relationships.set(otherTeamId, {
        otherTeam,
        currentTeamId,
        direction: 'outgoing',
        interaction,
        otherTeamId
      })
    }
    
    // Process incoming likes (other teams liked current team)
    for (const interaction of incomingLikes) {
      const otherTeamId = interaction.user_team_id
      const otherTeam = await getTeamDetails(otherTeamId)
      
      if (relationships.has(otherTeamId)) {
        // Already exists as outgoing, make it mutual
        const existing = relationships.get(otherTeamId)
        existing.direction = 'mutual'
        existing.incomingInteraction = interaction
      } else {
        // New incoming-only relationship
        relationships.set(otherTeamId, {
          otherTeam,
          currentTeamId,
          direction: 'incoming', 
          interaction,
          otherTeamId
        })
      }
    }

    // Convert to array and format for template
    likedTeams.value = Array.from(relationships.values())
      .map(rel => ({
        interaction: rel.interaction,
        targetTeam: rel.otherTeam,
        userTeam: teamStore.userTeams.find(t => t.id === currentTeamId),
        direction: rel.direction,
        mutualInteraction: rel.incomingInteraction
      }))
      .sort((a, b) => {
        const aTime = new Date(a.interaction.updated_at || a.interaction.created_at)
        const bTime = new Date(b.interaction.updated_at || b.interaction.created_at)
        return bTime - aTime
      })


  }

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
  const openDislikedModal = async () => {
    showDislikedModal.value = true
    markDislikesAsViewed()
    await loadDislikedTeams()
  }

  const openLikedModal = async () => {
    showLikedModal.value = true
    markLikesAsViewed()
    await loadLikedTeams()
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
    loadLikedTeams,
    loadDislikedTeams,
    cacheTeamData,
    initialize,
    clearDashboard
  }
}) 