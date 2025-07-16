import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../config/supabase.js'
import { useAuthStore } from './auth.js'
import { useNotificationStore } from './notifications.js'

export const useTeamStore = defineStore('teams', () => {
  // State
  const teams = ref([])
  const sports = ref([])
  const loading = ref(false)
  const selectedTeam = ref(null)

  // Get auth and notification stores
  const authStore = useAuthStore()
  const notificationStore = useNotificationStore()

  // Getters
  const userTeams = computed(() => teams.value.filter(team => team.user_id === authStore.user?.id))
  const activeTeams = computed(() => userTeams.value.filter(team => team.status === 'Active'))

  // Sports Management
  const loadSports = async () => {
    try {
      const { data, error } = await supabase
        .from('sports')
        .select('*')
        .order('name')

      if (error) throw error
      sports.value = data
      return { data, error: null }
    } catch (error) {
      console.error('Error loading sports:', error)
      return { data: null, error }
    }
  }

  const getSportById = (sportId) => {
    return sports.value.find(sport => sport.id === sportId)
  }

  const getSportByName = (sportName) => {
    return sports.value.find(sport => sport.name === sportName)
  }

  // Team CRUD Operations
  const createTeam = async (teamData) => {
    try {
      loading.value = true

      // Get sport ID from sport name
      const sport = getSportByName(teamData.sport)
      if (!sport) {
        throw new Error('Invalid sport selected')
      }

      const newTeam = {
        user_id: authStore.user.id,
        name: teamData.name,
        sport_id: sport.id,
        age_group: teamData.ageGroup,
        skill_level: teamData.skillLevel,
        phone: teamData.phone,
        city: teamData.city,
        state: teamData.state,
        zip: teamData.zip,
        home_venue: teamData.homeVenue,
        venue_address: teamData.venueAddress,
        description: teamData.description,
        status: 'Active'
      }

      const { data, error } = await supabase
        .from('teams')
        .insert([newTeam])
        .select(`
          *,
          sport:sports(*)
        `)
        .single()

      if (error) throw error

      // Add to local teams array
      teams.value.push(data)
      
      notificationStore.success('Team Created! 🎉', `${teamData.name} has been successfully created.`)
      return { data, error: null }
    } catch (error) {
      console.error('Error creating team:', error)
      notificationStore.error('Creation Failed', error.message)
      return { data: null, error }
    } finally {
      loading.value = false
    }
  }

  const updateTeam = async (teamId, teamData) => {
    try {
      loading.value = true

      // Get sport ID from sport name if sport is being updated
      let updateData = { ...teamData }
      if (teamData.sport) {
        const sport = getSportByName(teamData.sport)
        if (!sport) {
          throw new Error('Invalid sport selected')
        }
        updateData.sport_id = sport.id
        delete updateData.sport // Remove sport name, use sport_id
      }

      // Map form fields to database fields
      const dbUpdateData = {
        name: updateData.name,
        sport_id: updateData.sport_id,
        age_group: updateData.ageGroup,
        skill_level: updateData.skillLevel,
        phone: updateData.phone,
        city: updateData.city,
        state: updateData.state,
        zip: updateData.zip,
        home_venue: updateData.homeVenue,
        venue_address: updateData.venueAddress,
        description: updateData.description,
        updated_at: new Date().toISOString()
      }

      // Remove undefined values
      Object.keys(dbUpdateData).forEach(key => 
        dbUpdateData[key] === undefined && delete dbUpdateData[key]
      )

      const { data, error } = await supabase
        .from('teams')
        .update(dbUpdateData)
        .eq('id', teamId)
        .eq('user_id', authStore.user.id) // Security: only update own teams
        .select(`
          *,
          sport:sports(*)
        `)
        .single()

      if (error) throw error

      // Update local teams array
      const index = teams.value.findIndex(team => team.id === teamId)
      if (index !== -1) {
        teams.value[index] = data
      }

      notificationStore.success('Team Updated! ✅', `${data.name} has been successfully updated.`)
      return { data, error: null }
    } catch (error) {
      console.error('Error updating team:', error)
      notificationStore.error('Update Failed', error.message)
      return { data: null, error }
    } finally {
      loading.value = false
    }
  }

  const deleteTeam = async (teamId) => {
    try {
      loading.value = true

      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId)
        .eq('user_id', authStore.user.id) // Security: only delete own teams

      if (error) throw error

      // Remove from local teams array
      teams.value = teams.value.filter(team => team.id !== teamId)

      notificationStore.success('Team Deleted', 'Team has been successfully removed.')
      return { error: null }
    } catch (error) {
      console.error('Error deleting team:', error)
      notificationStore.error('Deletion Failed', error.message)
      return { error }
    } finally {
      loading.value = false
    }
  }

  const loadUserTeams = async () => {
    try {
      loading.value = true

      const { data, error } = await supabase
        .from('teams')
        .select(`
          id,
          name,
          sport_id,
          age_group,
          skill_level,
          phone,
          city,
          state,
          zip,
          home_venue,
          venue_address,
          description,
          status,
          user_id,
          created_at,
          updated_at,
          sport:sports(*),
          match_requests_made:match_requests!requesting_team_id(count),
          match_requests_received:match_requests!target_team_id(count)
        `)
        .eq('user_id', authStore.user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      teams.value = data.map(team => ({
        ...team,
        // Add computed fields for the UI
        totalMatches: (team.match_requests_made?.[0]?.count || 0) + (team.match_requests_received?.[0]?.count || 0)
      }))

      return { data, error: null }
    } catch (error) {
      console.error('Error loading teams:', error)
      notificationStore.error('Loading Failed', 'Failed to load your teams.')
      return { data: null, error }
    } finally {
      loading.value = false
    }
  }

  const getTeamById = async (teamId) => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          sport:sports(*)
        `)
        .eq('id', teamId)
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching team:', error)
      return { data: null, error }
    }
  }

  // Team Availability Management
  const addTeamAvailability = async (teamId, availabilityData) => {
    try {
      const insertData = {
        team_id: teamId,
        date: availabilityData.date,
        type: availabilityData.type,
        notes: availabilityData.notes,
        all_day: availabilityData.allDay || false
      }

      // Only add time and duration for host availability when not all day
      if (availabilityData.type === 'available' && !availabilityData.allDay) {
        insertData.time = availabilityData.time
        insertData.duration = parseFloat(availabilityData.duration)
      }

      const { data, error } = await supabase
        .from('team_availability')
        .insert([insertData])
        .select()
        .single()

      if (error) throw error

      notificationStore.success('Availability Added', 'Team availability has been updated.')
      return { data, error: null }
    } catch (error) {
      console.error('Error adding availability:', error)
      notificationStore.error('Failed to Add Availability', error.message)
      return { data: null, error }
    }
  }

  const updateTeamAvailability = async (availabilityId, availabilityData) => {
    try {
      const updateData = {
        date: availabilityData.date,
        type: availabilityData.type,
        notes: availabilityData.notes,
        all_day: availabilityData.allDay || false
      }

      // Only add time and duration for host availability when not all day
      if (availabilityData.type === 'available' && !availabilityData.allDay) {
        updateData.time = availabilityData.time
        updateData.duration = parseFloat(availabilityData.duration)
      } else {
        // Clear time and duration for travel or all-day availability
        updateData.time = null
        updateData.duration = null
      }

      const { data, error } = await supabase
        .from('team_availability')
        .update(updateData)
        .eq('id', availabilityId)
        .select()
        .single()

      if (error) throw error

      notificationStore.success('Availability Updated', 'Team availability has been updated.')
      return { data, error: null }
    } catch (error) {
      console.error('Error updating availability:', error)
      notificationStore.error('Failed to Update Availability', error.message)
      return { data: null, error }
    }
  }

  const deleteTeamAvailability = async (availabilityId) => {
    try {
      const { error } = await supabase
        .from('team_availability')
        .delete()
        .eq('id', availabilityId)

      if (error) throw error

      notificationStore.success('Availability Removed', 'Team availability has been removed.')
      return { error: null }
    } catch (error) {
      console.error('Error deleting availability:', error)
      notificationStore.error('Failed to Remove Availability', error.message)
      return { error }
    }
  }

  const getTeamAvailability = async (teamId, startDate = null, endDate = null) => {
    try {
      let query = supabase
        .from('team_availability')
        .select('*')
        .eq('team_id', teamId)
        .order('date', { ascending: true })

      if (startDate) {
        query = query.gte('date', startDate)
      }
      if (endDate) {
        query = query.lte('date', endDate)
      }

      const { data, error } = await query

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching team availability:', error)
      return { data: null, error }
    }
  }

  // Match Request Management
  const sendMatchRequest = async (requestData) => {
    try {
      const { data, error } = await supabase
        .from('match_requests')
        .insert([{
          requesting_team_id: requestData.requestingTeamId,
          target_team_id: requestData.targetTeamId,
          preferred_dates: requestData.preferredDates,
          message: requestData.message
        }])
        .select(`
          *,
          requesting_team:teams!requesting_team_id(*),
          target_team:teams!target_team_id(*)
        `)
        .single()

      if (error) throw error

      notificationStore.success('Match Request Sent! 🎉', 'Your match request has been sent successfully.')
      return { data, error: null }
    } catch (error) {
      console.error('Error sending match request:', error)
      notificationStore.error('Failed to Send Request', error.message)
      return { data: null, error }
    }
  }

  const getMatchRequests = async (type = 'all') => {
    try {
      let query = supabase
        .from('match_requests')
        .select(`
          *,
          requesting_team:teams!requesting_team_id(*),
          target_team:teams!target_team_id(*)
        `)
        .order('created_at', { ascending: false })

      if (type === 'sent') {
        query = query.in('requesting_team_id', userTeams.value.map(t => t.id))
      } else if (type === 'received') {
        query = query.in('target_team_id', userTeams.value.map(t => t.id))
      } else {
        // Get both sent and received
        const userTeamIds = userTeams.value.map(t => t.id)
        query = query.or(`requesting_team_id.in.(${userTeamIds.join(',')}),target_team_id.in.(${userTeamIds.join(',')})`)
      }

      const { data, error } = await query

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching match requests:', error)
      return { data: null, error }
    }
  }

  const updateMatchRequestStatus = async (requestId, status, responseMessage = null) => {
    try {
      const updateData = { 
        status,
        updated_at: new Date().toISOString()
      }
      
      if (responseMessage) {
        updateData.response_message = responseMessage
      }

      const { data, error } = await supabase
        .from('match_requests')
        .update(updateData)
        .eq('id', requestId)
        .select(`
          *,
          requesting_team:teams!requesting_team_id(*),
          target_team:teams!target_team_id(*)
        `)
        .single()

      if (error) throw error

      const statusMessages = {
        accepted: 'Match request accepted! 🎉',
        declined: 'Match request declined.',
        cancelled: 'Match request cancelled.'
      }

      notificationStore.success('Request Updated', statusMessages[status] || 'Match request status updated.')
      return { data, error: null }
    } catch (error) {
      console.error('Error updating match request:', error)
      notificationStore.error('Failed to Update Request', error.message)
      return { data: null, error }
    }
  }

  // Discovery/Search Functions
  const searchTeams = async (filters = {}) => {
    try {
      let query = supabase
        .from('teams')
        .select(`
          *,
          sport:sports(*),
          availability:team_availability(*)
        `)
        .neq('user_id', authStore.user?.id) // Don't show own teams
        .eq('status', 'Active')

      if (filters.sport) {
        const sport = getSportByName(filters.sport)
        if (sport) {
          query = query.eq('sport_id', sport.id)
        }
      }

      if (filters.ageGroup) {
        query = query.eq('age_group', filters.ageGroup)
      }

      if (filters.skillLevel) {
        query = query.eq('skill_level', filters.skillLevel)
      }

      if (filters.city) {
        query = query.ilike('city', `%${filters.city}%`)
      }

      if (filters.state) {
        query = query.ilike('state', `%${filters.state}%`)
      }

      const { data, error } = await query.limit(50)

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error searching teams:', error)
      return { data: null, error }
    }
  }

  // Utility Functions
  const refreshTeams = () => {
    return loadUserTeams()
  }

  const clearTeams = () => {
    teams.value = []
  }

  // Auto-load sports when store is created
  loadSports()

  return {
    // State
    teams,
    sports,
    loading,
    selectedTeam,
    
    // Getters
    userTeams,
    activeTeams,
    
    // Sports
    loadSports,
    getSportById,
    getSportByName,
    
    // Team CRUD
    createTeam,
    updateTeam,
    deleteTeam,
    loadUserTeams,
    getTeamById,
    
    // Availability
    addTeamAvailability,
    updateTeamAvailability,
    deleteTeamAvailability,
    getTeamAvailability,
    
    // Match Requests
    sendMatchRequest,
    getMatchRequests,
    updateMatchRequestStatus,
    
    // Discovery
    searchTeams,
    
    // Utilities
    refreshTeams,
    clearTeams
  }
})