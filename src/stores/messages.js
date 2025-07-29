import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../config/supabase.js'
import { useAuthStore } from './auth.js'
import { useTeamStore } from './teams.js'
import { useNotificationStore } from './notifications.js'

export const useMessagesStore = defineStore('messages', () => {
  // State
  const conversations = ref([])
  const messages = ref([])
  const currentConversation = ref(null)
  const loading = ref(false)
  const sendingMessage = ref(false)
  const subscription = ref(null)

  // Get other stores
  const authStore = useAuthStore()
  const teamStore = useTeamStore()
  const notificationStore = useNotificationStore()

  // Getters
  const userTeamIds = computed(() => teamStore.userTeams.map(team => team.id))
  
  const sortedConversations = computed(() => {
    return conversations.value.sort((a, b) => {
      // Sort by last activity (either last message or when request was created)
      const aTime = new Date(a.last_activity_at)
      const bTime = new Date(b.last_activity_at)
      return bTime - aTime
    })
  })

  const currentMessages = computed(() => {
    if (!currentConversation.value) return []
    return messages.value
      .filter(msg => msg.match_request_id === currentConversation.value.match_request_id)
      .sort((a, b) => new Date(a.sent_at) - new Date(b.sent_at))
  })

  const unreadCount = computed(() => {
    return conversations.value.reduce((total, conversation) => {
      const userTeamId = getUserTeamIdFromConversation(conversation)
      if (conversation.requesting_team_id === userTeamId) {
        return total + (conversation.requesting_team_unread_count || 0)
      } else {
        return total + (conversation.target_team_unread_count || 0)
      }
    }, 0)
  })

  // Helper function to determine which team in the conversation belongs to the user
  const getUserTeamIdFromConversation = (conversation) => {
    return userTeamIds.value.includes(conversation.requesting_team_id) 
      ? conversation.requesting_team_id 
      : conversation.target_team_id
  }

  const getOtherTeamFromConversation = (conversation) => {
    const userTeamId = getUserTeamIdFromConversation(conversation)
    return userTeamId === conversation.requesting_team_id 
      ? {
          id: conversation.target_team_id,
          name: conversation.target_team_name,
          sport: conversation.target_team_sport,
          active: conversation.target_team_active
        }
      : {
          id: conversation.requesting_team_id,
          name: conversation.requesting_team_name,
          sport: conversation.requesting_team_sport,
          active: conversation.requesting_team_active
        }
  }

  // Load conversations (match requests with messages)
  const loadConversations = async () => {
    try {
      loading.value = true

      const { data, error } = await supabase
        .from('team_conversations')
        .select('*')
        .or(`requesting_team_id.in.(${userTeamIds.value.join(',')}),target_team_id.in.(${userTeamIds.value.join(',')})`)

      if (error) throw error

      conversations.value = data || []
      return { data, error: null }
    } catch (error) {
      console.error('Error loading conversations:', error)
      notificationStore.error('Failed to Load Conversations', error.message)
      return { data: null, error }
    } finally {
      loading.value = false
    }
  }

  // Load messages for a specific conversation
  const loadMessagesForConversation = async (matchRequestId) => {
    try {
      const { data, error } = await supabase
        .from('team_messages')
        .select(`
          *,
          sender_team:teams!sender_team_id(id, name),
          receiver_team:teams!receiver_team_id(id, name)
        `)
        .eq('match_request_id', matchRequestId)
        .order('sent_at', { ascending: true })

      if (error) throw error

      // Add messages to store (replace existing messages for this conversation)
      messages.value = messages.value.filter(msg => msg.match_request_id !== matchRequestId)
      messages.value.push(...(data || []))

      return { data, error: null }
    } catch (error) {
      console.error('Error loading messages:', error)
      return { data: null, error }
    }
  }

  // Send a message
  const sendMessage = async (matchRequestId, senderTeamId, receiverTeamId, messageText) => {
    try {
      sendingMessage.value = true

      const { data, error } = await supabase
        .from('team_messages')
        .insert([{
          match_request_id: matchRequestId,
          sender_team_id: senderTeamId,
          receiver_team_id: receiverTeamId,
          message: messageText.trim()
        }])
        .select(`
          *,
          sender_team:teams!sender_team_id(id, name),
          receiver_team:teams!receiver_team_id(id, name)
        `)
        .single()

      if (error) throw error

      // Optimistically add message to local state
      messages.value.push(data)

      // Refresh conversations to update last message info
      await loadConversations()

      return { data, error: null }
    } catch (error) {
      console.error('Error sending message:', error)
      notificationStore.error('Failed to Send Message', error.message)
      return { data: null, error }
    } finally {
      sendingMessage.value = false
    }
  }

  // Mark messages as read
  const markMessagesAsRead = async (matchRequestId, receiverTeamId) => {
    try {
      const { error } = await supabase
        .from('team_messages')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('match_request_id', matchRequestId)
        .eq('receiver_team_id', receiverTeamId)
        .eq('is_read', false)

      if (error) throw error

      // Update local state
      messages.value = messages.value.map(msg => {
        if (msg.match_request_id === matchRequestId && 
            msg.receiver_team_id === receiverTeamId && 
            !msg.is_read) {
          return { ...msg, is_read: true, read_at: new Date().toISOString() }
        }
        return msg
      })

      // Refresh conversations to update unread counts
      await loadConversations()

      return { error: null }
    } catch (error) {
      console.error('Error marking messages as read:', error)
      return { error }
    }
  }

  // Set current conversation
  const setCurrentConversation = async (conversation) => {
    currentConversation.value = conversation
    if (conversation) {
      await loadMessagesForConversation(conversation.match_request_id)
      
      // Mark messages as read for the user's team
      const userTeamId = getUserTeamIdFromConversation(conversation)
      await markMessagesAsRead(conversation.match_request_id, userTeamId)
    }
  }

  // Start a new conversation from a match request
  const startConversationFromRequest = async (matchRequest, initialMessage) => {
    try {
      const { data, error } = await sendMessage(
        matchRequest.id,
        matchRequest.requesting_team_id,
        matchRequest.target_team_id,
        initialMessage
      )

      if (error) throw error

      // Refresh conversations to show the new one
      await loadConversations()
      
      // Find and set the current conversation
      const newConversation = conversations.value.find(
        conv => conv.match_request_id === matchRequest.id
      )
      
      if (newConversation) {
        await setCurrentConversation(newConversation)
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error starting conversation:', error)
      return { data: null, error }
    }
  }

  // Setup realtime subscription
  const setupRealtimeSubscription = () => {
    if (subscription.value) {
      supabase.removeChannel(subscription.value)
    }

    if (userTeamIds.value.length === 0) return

    subscription.value = supabase
      .channel('team_messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'team_messages',
          filter: `sender_team_id=in.(${userTeamIds.value.join(',')})`,
        },
        (payload) => {
          handleRealtimeMessage(payload)
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'team_messages',
          filter: `receiver_team_id=in.(${userTeamIds.value.join(',')})`,
        },
        (payload) => {
          handleRealtimeMessage(payload)
        }
      )
      .subscribe()
  }

  // Handle realtime message updates
  const handleRealtimeMessage = async (payload) => {
    const { eventType, new: newMessage, old: oldMessage } = payload

    if (eventType === 'INSERT') {
      // Add new message to local state if not already present
      const exists = messages.value.some(msg => msg.id === newMessage.id)
      if (!exists) {
        // Fetch full message data with relationships
        const { data } = await supabase
          .from('team_messages')
          .select(`
            *,
            sender_team:teams!sender_team_id(id, name),
            receiver_team:teams!receiver_team_id(id, name)
          `)
          .eq('id', newMessage.id)
          .single()

        if (data) {
          messages.value.push(data)
          
          // Show notification for received messages (not sent by user)
          const isFromUserTeam = userTeamIds.value.includes(data.sender_team_id)
          if (!isFromUserTeam) {
            notificationStore.info(
              'New Message', 
              `${data.sender_team.name}: ${data.message.substring(0, 50)}${data.message.length > 50 ? '...' : ''}`
            )
          }
        }
      }
      
      // Refresh conversations to update last message info
      await loadConversations()
    } else if (eventType === 'UPDATE') {
      // Update message in local state
      const index = messages.value.findIndex(msg => msg.id === newMessage.id)
      if (index !== -1) {
        messages.value[index] = { ...messages.value[index], ...newMessage }
      }
      
      // Refresh conversations if read status changed
      await loadConversations()
    } else if (eventType === 'DELETE') {
      // Remove message from local state
      messages.value = messages.value.filter(msg => msg.id !== oldMessage.id)
      await loadConversations()
    }
  }

  // Cleanup subscription
  const cleanupSubscription = () => {
    if (subscription.value) {
      supabase.removeChannel(subscription.value)
      subscription.value = null
    }
  }

  // Initialize - setup subscription when user teams are available
  const initialize = () => {
    if (userTeamIds.value.length > 0) {
      setupRealtimeSubscription()
      loadConversations()
    }
  }

  // Clear store
  const clearMessages = () => {
    conversations.value = []
    messages.value = []
    currentConversation.value = null
    cleanupSubscription()
  }

  return {
    // State
    conversations,
    messages,
    currentConversation,
    loading,
    sendingMessage,

    // Getters
    sortedConversations,
    currentMessages,
    unreadCount,

    // Actions
    loadConversations,
    loadMessagesForConversation,
    sendMessage,
    markMessagesAsRead,
    setCurrentConversation,
    startConversationFromRequest,
    setupRealtimeSubscription,
    getUserTeamIdFromConversation,
    getOtherTeamFromConversation,
    initialize,
    clearMessages,
    cleanupSubscription
  }
}) 