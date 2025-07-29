import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../config/supabase.js'
import { useAuthStore } from './auth.js'
import { useNotificationStore } from './notifications.js'
import { geocodeAddress } from '../services/geocoding.js'

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

  // Geocoding helper function
  const geocodeTeamLocation = async (city, state) => {
    if (!city || !state) {
      return {
        latitude: null,
        longitude: null,
        geocoded_at: null,
        geocoding_failed: false
      }
    }

    try {
      const address = `${city}, ${state}`
      console.log(`Geocoding team location: ${address}`)
      
      const result = await geocodeAddress(address)
      
      if (result.success && result.latitude && result.longitude) {
        return {
          latitude: result.latitude,
          longitude: result.longitude,
          geocoded_at: new Date().toISOString(),
          geocoding_failed: false
        }
      } else {
        console.warn('Geocoding failed:', result.error)
        return {
          latitude: null,
          longitude: null,
          geocoded_at: null,
          geocoding_failed: true
        }
      }
    } catch (error) {
      console.error('Geocoding error:', error)
      return {
        latitude: null,
        longitude: null,
        geocoded_at: null,
        geocoding_failed: true
      }
    }
  }

  // Logo Management
  const uploadTeamLogo = async (file, teamId) => {
    try {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Please upload a valid image file (JPEG, PNG, GIF, or WebP)')
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        throw new Error('File size must be less than 5MB')
      }

      // Create unique filename
      const fileExt = file.name.split('.').pop().toLowerCase()
      const fileName = `${authStore.user.id}/${teamId}.${fileExt}`

      // Upload to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('team-logos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true // Replace existing file
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('team-logos')
        .getPublicUrl(fileName)

      return { data: urlData.publicUrl, error: null }
    } catch (error) {
      console.error('Error uploading logo:', error)
      notificationStore.error('Upload Failed', error.message)
      return { data: null, error }
    }
  }

  const deleteTeamLogo = async (teamId) => {
    try {
      // List all files for this team to find the logo
      const { data: files, error: listError } = await supabase.storage
        .from('team-logos')
        .list(`${authStore.user.id}`, {
          search: teamId
        })

      if (listError) throw listError

      // Delete all logo files for this team
      if (files && files.length > 0) {
        const filesToDelete = files
          .filter(file => file.name.startsWith(teamId))
          .map(file => `${authStore.user.id}/${file.name}`)

        if (filesToDelete.length > 0) {
          const { error: deleteError } = await supabase.storage
            .from('team-logos')
            .remove(filesToDelete)

          if (deleteError) throw deleteError
        }
      }

      return { error: null }
    } catch (error) {
      console.error('Error deleting logo:', error)
      notificationStore.error('Delete Failed', error.message)
      return { error }
    }
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

      // Geocode the team location
      const geocodeResult = await geocodeTeamLocation(teamData.city, teamData.state)

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
        status: 'Active',
        // Add geocoding results
        latitude: geocodeResult.latitude,
        longitude: geocodeResult.longitude,
        geocoded_at: geocodeResult.geocoded_at,
        geocoding_failed: geocodeResult.geocoding_failed
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

      // Handle logo upload if provided
      let logoUrl = null
      if (teamData.logo && teamData.logo instanceof File) {
        const logoResult = await uploadTeamLogo(teamData.logo, data.id)
        if (logoResult.error) {
          // Log error but don't fail team creation
          console.warn('Logo upload failed:', logoResult.error)
        } else {
          logoUrl = logoResult.data
          
          // Update team with logo URL
          const { error: updateError } = await supabase
            .from('teams')
            .update({ logo_url: logoUrl })
            .eq('id', data.id)

          if (updateError) {
            console.warn('Failed to update team with logo URL:', updateError)
          } else {
            data.logo_url = logoUrl
          }
        }
      }

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

      // Handle logo upload if provided
      let logoUrl = updateData.logo_url // Keep existing logo URL
      if (teamData.logo && teamData.logo instanceof File) {
        const logoResult = await uploadTeamLogo(teamData.logo, teamId)
        if (logoResult.error) {
          throw new Error(`Logo upload failed: ${logoResult.error.message}`)
        } else {
          logoUrl = logoResult.data
        }
      } else if (teamData.deleteLogo) {
        // Delete existing logo if requested
        await deleteTeamLogo(teamId)
        logoUrl = null
      }

      // Check if location has changed and geocode if needed
      let geocodeResult = {}
      if (updateData.city || updateData.state) {
        // Find the existing team to compare location
        const existingTeam = teams.value.find(t => t.id === teamId)
        const locationChanged = existingTeam && (
          (updateData.city && updateData.city !== existingTeam.city) ||
          (updateData.state && updateData.state !== existingTeam.state)
        )
        
        if (locationChanged || !existingTeam?.latitude) {
          // Location changed or coordinates missing, geocode again
          const city = updateData.city || existingTeam?.city
          const state = updateData.state || existingTeam?.state
          geocodeResult = await geocodeTeamLocation(city, state)
        }
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
        logo_url: logoUrl,
        updated_at: new Date().toISOString(),
        // Add geocoding results if location was updated
        ...geocodeResult
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

      // Soft delete: mark team as inactive instead of deleting
      const { error } = await supabase
        .from('teams')
        .update({ active: false })
        .eq('id', teamId)
        .eq('user_id', authStore.user.id) // Security: only modify own teams

      if (error) throw error

      // Remove from local teams array (since we only show active teams)
      teams.value = teams.value.filter(team => team.id !== teamId)

      notificationStore.success('Team Deactivated', 'Team has been deactivated and will no longer appear in searches.')
      return { error: null }
    } catch (error) {
      console.error('Error deactivating team:', error)
      notificationStore.error('Deactivation Failed', error.message)
      return { error }
    } finally {
      loading.value = false
    }
  }

  const reactivateTeam = async (teamId) => {
    try {
      loading.value = true

      // Reactivate: mark team as active
      const { error } = await supabase
        .from('teams')
        .update({ active: true })
        .eq('id', teamId)
        .eq('user_id', authStore.user.id) // Security: only modify own teams

      if (error) throw error

      notificationStore.success('Team Reactivated', 'Team has been reactivated and will appear in searches again.')
      return { error: null }
    } catch (error) {
      console.error('Error reactivating team:', error)
      notificationStore.error('Reactivation Failed', error.message)
      return { error }
    } finally {
      loading.value = false
    }
  }

  const loadInactiveTeams = async () => {
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
          logo_url,
          status,
          user_id,
          created_at,
          updated_at,
          active,
          sport:sports(*)
        `)
        .eq('user_id', authStore.user.id)
        .eq('active', false) // Only load inactive teams
        .order('updated_at', { ascending: false })

      if (error) throw error

      return { data: data || [], error: null }
    } catch (error) {
      console.error('Error loading inactive teams:', error)
      notificationStore.error('Loading Failed', 'Failed to load inactive teams.')
      return { data: null, error }
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
          logo_url,
          status,
          user_id,
          created_at,
          updated_at,
          active,
          sport:sports(*),
          match_requests_made:match_requests!requesting_team_id(count),
          match_requests_received:match_requests!target_team_id(count)
        `)
        .eq('user_id', authStore.user.id)
        .eq('active', true) // Only load active teams
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
          sport:sports(*),
          availability:team_availability(*)
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

  // Get combined availability for multiple teams (for match request dropdowns)
  const getCombinedAvailability = async (teamIds, startDate = null, endDate = null) => {
    try {
      let query = supabase
        .from('team_availability')
        .select(`
          *,
          team:teams(id, name)
        `)
        .in('team_id', teamIds)
        .in('type', ['available', 'travel']) // Only show available dates, not unavailable
        .order('date', { ascending: true })

      if (startDate) {
        query = query.gte('date', startDate)
      } else {
        // Default to today onwards
        query = query.gte('date', new Date().toISOString().split('T')[0])
      }
      
      if (endDate) {
        query = query.lte('date', endDate)
      }

      const { data, error } = await query

      if (error) throw error

      // Group by date and format for dropdown
      const groupedByDate = {}
      data.forEach(availability => {
        const date = availability.date
        if (!groupedByDate[date]) {
          groupedByDate[date] = {
            date,
            teams: [],
            formatted: formatDateForDropdown(date)
          }
        }
        groupedByDate[date].teams.push({
          ...availability,
          team_name: availability.team.name
        })
      })

      // Convert to array and sort
      const availableDates = Object.values(groupedByDate)
        .sort((a, b) => new Date(a.date) - new Date(b.date))

      return { data: availableDates, error: null }
    } catch (error) {
      console.error('Error fetching combined availability:', error)
      return { data: null, error }
    }
  }

  // Get future available dates for a team in a simple format
  const getFutureAvailableDates = async (teamId, limit = 10) => {
    try {
      const { data, error } = await supabase
        .from('team_availability')
        .select('date, time, type, notes')
        .eq('team_id', teamId)
        .in('type', ['available', 'travel'])
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true })
        .limit(limit)

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching future available dates:', error)
      return { data: null, error }
    }
  }

  // Helper function to format dates for dropdown
  const formatDateForDropdown = (dateString) => {
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
  const searchTeams = async (filters = {}, userTeamSports = [], userTeamCoordinates = null) => {
    try {
      let query = supabase
        .from('teams')
        .select(`
          *,
          sport:sports(*)
        `)
        .neq('user_id', authStore.user?.id) // Don't show own teams
        .eq('status', 'Active')
        .eq('active', true) // Only show active teams

      // IMPORTANT: Only show teams from sports that the user's teams play
      // This ensures volleyball teams never see hockey teams, etc.
      if (userTeamSports.length > 0) {
        query = query.in('sport_id', userTeamSports)
      }

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

      // Distance filtering using PostGIS
      if (filters.distance && userTeamCoordinates && userTeamCoordinates.latitude && userTeamCoordinates.longitude) {
        const maxDistanceMiles = parseInt(filters.distance)
        
        // Use PostGIS to filter by distance
        // ST_DWithin uses meters, so convert miles to meters
        const maxDistanceMeters = maxDistanceMiles * 1609.34
        
        query = query.not('latitude', 'is', null)
                    .not('longitude', 'is', null)
        
        // Use RPC to call a custom function for distance filtering
        const { data: distanceFilteredData, error: distanceError } = await supabase
          .rpc('teams_within_distance', {
            user_lat: userTeamCoordinates.latitude,
            user_lng: userTeamCoordinates.longitude,
            max_distance_miles: maxDistanceMiles,
            sport_ids: userTeamSports.length > 0 ? userTeamSports : null,
            user_id_to_exclude: authStore.user?.id,
            age_group_filter: filters.ageGroup || null,
            skill_level_filter: filters.skillLevel || null,
            city_filter: filters.city || null,
            state_filter: filters.state || null,
            sport_name_filter: filters.sport || null
          })
        
        if (distanceError) {
          console.warn('Distance filtering failed, falling back to basic search:', distanceError)
          // Fall back to basic search without distance
        } else {
          return { data: distanceFilteredData || [], error: null }
        }
      }

      const { data, error } = await query.limit(50)

      if (error) throw error

      // If we have user coordinates but no distance filter, add distance info for sorting
      if (userTeamCoordinates && userTeamCoordinates.latitude && userTeamCoordinates.longitude) {
        const teamsWithDistance = data.map(team => {
          if (team.latitude && team.longitude) {
            // Calculate distance using Haversine formula
            const distance = calculateDistanceBetweenPoints(
              userTeamCoordinates.latitude,
              userTeamCoordinates.longitude,
              team.latitude,
              team.longitude
            )
            return { ...team, distance }
          }
          return { ...team, distance: null }
        })
        return { data: teamsWithDistance, error: null }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error searching teams:', error)
      return { data: null, error }
    }
  }

  // Helper function to calculate distance between two points (Haversine formula)
  const calculateDistanceBetweenPoints = (lat1, lng1, lat2, lng2) => {
    const R = 3959 // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // Calculate why two teams might be a good match
  const calculateMatchReasons = (yourTeam, theirTeam) => {
    const reasons = []
    
    // Helper function to get sport icon
    const getSportIcon = (sportName) => {
      const sportIcons = {
        'Soccer': '⚽',
        'Football': '🏈', 
        'Basketball': '🏀',
        'Baseball': '⚾',
        'Tennis': '🎾',
        'Volleyball': '🏐',
        'Hockey': '🏒',
        'Golf': '⛳',
        'Swimming': '🏊',
        'Track': '🏃',
        'Wrestling': '🤼',
        'Lacrosse': '🥍',
        'Softball': '🥎'
      }
      return sportIcons[sportName] || '⚽'
    }
    
    // Same sport (should always be true now)
    if (yourTeam.sport_id === theirTeam.sport_id) {
      const sportName = theirTeam.sport?.name || 'the same sport'
      reasons.push({
        type: 'sport',
        icon: getSportIcon(sportName),
        title: 'Same Sport',
        description: `Both teams play ${sportName}`
      })
    }

    // Age group compatibility
    if (yourTeam.age_group === theirTeam.age_group) {
      reasons.push({
        type: 'age',
        icon: '👥',
        title: 'Same Age Group',
        description: `Both teams are ${yourTeam.age_group}`
      })
    } else if (yourTeam.age_group && theirTeam.age_group) {
      // Check for compatible age groups (within 1-2 years)
      const yourAge = parseInt(yourTeam.age_group.replace(/[^\d]/g, ''))
      const theirAge = parseInt(theirTeam.age_group.replace(/[^\d]/g, ''))
      
      if (Math.abs(yourAge - theirAge) <= 2) {
        reasons.push({
          type: 'age',
          icon: '👦',
          title: 'Compatible Ages',
          description: `Close age groups: ${yourTeam.age_group} vs ${theirTeam.age_group}`
        })
      }
    }

    // Skill level compatibility
    const skillLevels = ['Beginner', 'Intermediate', 'Advanced', 'Elite']
    const yourSkillIndex = skillLevels.indexOf(yourTeam.skill_level)
    const theirSkillIndex = skillLevels.indexOf(theirTeam.skill_level)
    const skillDiff = Math.abs(yourSkillIndex - theirSkillIndex)

    if (yourTeam.skill_level === theirTeam.skill_level) {
      reasons.push({
        type: 'skill',
        icon: '🎯',
        title: 'Perfect Skill Match',
        description: `Both teams are ${yourTeam.skill_level} level`
      })
    } else if (skillDiff === 1) {
      reasons.push({
        type: 'skill',
        icon: '⚖️',
        title: 'Compatible Skill Level',
        description: `Close skill levels: ${yourTeam.skill_level} vs ${theirTeam.skill_level}`
      })
    }

    // Geographic proximity
    if (yourTeam.state === theirTeam.state) {
      if (yourTeam.city === theirTeam.city) {
        reasons.push({
          type: 'location',
          icon: '📍',
          title: 'Same City',
          description: `Both teams are in ${yourTeam.city}, ${yourTeam.state}`
        })
      } else {
        reasons.push({
          type: 'location',
          icon: '🗺️',
          title: 'Same State',
          description: `Both teams are in ${yourTeam.state}`
        })
      }
    }

    // Hosting capabilities
    if (yourTeam.home_venue && theirTeam.home_venue) {
      reasons.push({
        type: 'hosting',
        icon: '🏟️',
        title: 'Both Can Host',
        description: 'Flexible venue options for games'
      })
    } else if (yourTeam.home_venue && !theirTeam.home_venue) {
      reasons.push({
        type: 'hosting',
        icon: '🏠',
        title: 'You Can Host',
        description: `Play at ${yourTeam.home_venue}`
      })
    } else if (!yourTeam.home_venue && theirTeam.home_venue) {
      reasons.push({
        type: 'hosting',
        icon: '✈️',
        title: 'They Can Host',
        description: `Play at ${theirTeam.home_venue}`
      })
    }

    // If we have very few reasons, add a general compatibility note
    if (reasons.length === 1) {
      reasons.push({
        type: 'general',
        icon: '🤝',
        title: 'Looking for Matches',
        description: 'Both teams are actively seeking games'
      })
    }

    return reasons
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
    
    // Logo
    uploadTeamLogo,
    deleteTeamLogo,
    
    // Team CRUD
    createTeam,
    updateTeam,
    deleteTeam,
    reactivateTeam,
    loadUserTeams,
    loadInactiveTeams,
    getTeamById,
    
    // Availability
    addTeamAvailability,
    updateTeamAvailability,
    deleteTeamAvailability,
    getTeamAvailability,
    getCombinedAvailability,
    getFutureAvailableDates,
    
    // Match Requests
    sendMatchRequest,
    getMatchRequests,
    updateMatchRequestStatus,
    
    // Discovery
    searchTeams,
    
    // Geocoding utilities
    geocodeTeamLocation,
    calculateDistanceBetweenPoints,
    
    // Retroactive geocoding for existing teams
    geocodeExistingTeams: async () => {
      try {
        // Find teams without coordinates
        const { data: teamsToGeocode, error } = await supabase
          .from('teams')
          .select('id, city, state, latitude, longitude')
          .eq('user_id', authStore.user?.id)
          .or('latitude.is.null,longitude.is.null')
          .not('geocoding_failed', 'eq', true) // Skip previously failed attempts
        
        if (error) throw error
        
        if (teamsToGeocode.length === 0) {
          notificationStore.info('All Set!', 'All your teams already have location data.')
          return { updated: 0, failed: 0 }
        }
        
        let updated = 0
        let failed = 0
        
        for (const team of teamsToGeocode) {
          if (team.city && team.state) {
            const geocodeResult = await geocodeTeamLocation(team.city, team.state)
            
            const { error: updateError } = await supabase
              .from('teams')
              .update({
                latitude: geocodeResult.latitude,
                longitude: geocodeResult.longitude,
                geocoded_at: geocodeResult.geocoded_at,
                geocoding_failed: geocodeResult.geocoding_failed
              })
              .eq('id', team.id)
            
            if (updateError) {
              console.error(`Failed to update team ${team.id}:`, updateError)
              failed++
            } else {
              updated++
            }
            
            // Rate limiting - wait 1 second between requests
            await new Promise(resolve => setTimeout(resolve, 1000))
          }
        }
        
        notificationStore.success(
          'Location Update Complete',
          `Updated ${updated} teams${failed > 0 ? `, ${failed} failed` : ''}.`
        )
        
        return { updated, failed }
      } catch (error) {
        console.error('Error geocoding existing teams:', error)
        notificationStore.error('Geocoding Error', error.message)
        return { updated: 0, failed: 0 }
      }
    },
    calculateMatchReasons,
    
    // Utilities
    refreshTeams,
    clearTeams
  }
})