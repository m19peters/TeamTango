import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../config/supabase.js'
import { useAuthStore } from './auth.js'
import { useTeamStore } from './teams.js'
import { useNotificationStore } from './notifications.js'

export const useInteractionsStore = defineStore('interactions', () => {
  // State
  const interactions = ref([])
  const interactionStats = ref([])
  const loading = ref(false)

  // Get other stores
  const authStore = useAuthStore()
  const teamStore = useTeamStore()
  const notificationStore = useNotificationStore()

  // Getters
  const userTeamIds = computed(() => teamStore.userTeams.map(team => team.id))
  
  const likedTeamIds = computed(() => {
    return interactions.value
      .filter(interaction => interaction.interaction_type === 'like' && userTeamIds.value.includes(interaction.user_team_id))
      .map(interaction => interaction.target_team_id)
  })
  
  const dislikedTeamIds = computed(() => {
    return interactions.value
      .filter(interaction => interaction.interaction_type === 'dislike' && userTeamIds.value.includes(interaction.user_team_id))
      .map(interaction => interaction.target_team_id)
  })

  // Get interaction for a specific team pair
  const getTeamInteraction = (userTeamId, targetTeamId) => {
    return interactions.value.find(
      interaction => interaction.user_team_id === userTeamId && interaction.target_team_id === targetTeamId
    )
  }

  // Get interaction stats for a team
  const getTeamStats = (teamId) => {
    return interactionStats.value.find(stats => stats.target_team_id === teamId) || {
      like_count: 0,
      dislike_count: 0,
      total_interactions: 0
    }
  }

  // Load all interactions for user's teams
  const loadInteractions = async () => {
    try {
      loading.value = true

      if (userTeamIds.value.length === 0) {
        interactions.value = []
        return { data: [], error: null }
      }

      const { data, error } = await supabase
        .from('team_interactions')
        .select('*')
        .or(`user_team_id.in.(${userTeamIds.value.join(',')}),target_team_id.in.(${userTeamIds.value.join(',')})`)
        .order('created_at', { ascending: false })

      if (error) throw error

      interactions.value = data || []
      return { data, error: null }
    } catch (error) {
      console.error('Error loading interactions:', error)
      return { data: null, error }
    } finally {
      loading.value = false
    }
  }

  // Load interaction stats for all teams
  const loadInteractionStats = async () => {
    try {
      const { data, error } = await supabase
        .from('team_interaction_stats')
        .select('*')

      if (error) throw error

      interactionStats.value = data || []
      return { data, error: null }
    } catch (error) {
      console.error('Error loading interaction stats:', error)
      return { data: null, error }
    }
  }

  // Like or dislike a team
  const setTeamInteraction = async (userTeamId, targetTeamId, interactionType) => {
    try {
      loading.value = true

      // Check if interaction already exists
      const existingInteraction = getTeamInteraction(userTeamId, targetTeamId)
      
      if (existingInteraction) {
        // Update existing interaction
        const { data, error } = await supabase
          .from('team_interactions')
          .update({ 
            interaction_type: interactionType,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingInteraction.id)
          .select()
          .single()

        if (error) throw error

        // Update local state
        const index = interactions.value.findIndex(i => i.id === existingInteraction.id)
        if (index !== -1) {
          interactions.value[index] = data
        }
      } else {
        // Create new interaction
        const { data, error } = await supabase
          .from('team_interactions')
          .insert([{
            user_team_id: userTeamId,
            target_team_id: targetTeamId,
            interaction_type: interactionType
          }])
          .select()
          .single()

        if (error) throw error

        // Add to local state
        interactions.value.push(data)
      }

      // Refresh interaction stats
      await loadInteractionStats()

      const actionText = interactionType === 'like' ? 'liked' : 'disliked'
      notificationStore.success('Interaction Updated', `You have ${actionText} this team.`)
      
      return { error: null }
    } catch (error) {
      console.error('Error setting team interaction:', error)
      notificationStore.error('Failed to Update', error.message)
      return { error }
    } finally {
      loading.value = false
    }
  }

  // Remove interaction (unlike/undislike)
  const removeTeamInteraction = async (userTeamId, targetTeamId) => {
    try {
      loading.value = true

      const existingInteraction = getTeamInteraction(userTeamId, targetTeamId)
      if (!existingInteraction) {
        return { error: null }
      }

      const { error } = await supabase
        .from('team_interactions')
        .delete()
        .eq('id', existingInteraction.id)

      if (error) throw error

      // Remove from local state
      interactions.value = interactions.value.filter(i => i.id !== existingInteraction.id)

      // Refresh interaction stats
      await loadInteractionStats()

      notificationStore.success('Interaction Removed', 'Your interaction has been removed.')
      return { error: null }
    } catch (error) {
      console.error('Error removing team interaction:', error)
      notificationStore.error('Failed to Remove', error.message)
      return { error }
    } finally {
      loading.value = false
    }
  }

  // Initialize - load interactions when user teams are available
  const initialize = () => {
    if (userTeamIds.value.length > 0) {
      loadInteractions()
      loadInteractionStats()
    }
  }

  // Clear interactions
  const clearInteractions = () => {
    interactions.value = []
    interactionStats.value = []
  }

  return {
    // State
    interactions,
    interactionStats,
    loading,

    // Getters
    userTeamIds,
    likedTeamIds,
    dislikedTeamIds,

    // Actions
    loadInteractions,
    loadInteractionStats,
    getTeamInteraction,
    getTeamStats,
    setTeamInteraction,
    removeTeamInteraction,
    initialize,
    clearInteractions
  }
}) 