<script setup>
import { onMounted, onUnmounted, ref, computed, nextTick, watch } from 'vue'
import { useMessagesStore } from '../stores/messages.js'
import { useTeamStore } from '../stores/teams.js'
import { useAuthStore } from '../stores/auth.js'
import { useViewingAsTeamStore } from '../stores/viewingAsTeam.js'
import ViewingAsTeamSelector from '../components/ViewingAsTeamSelector.vue'
import AvailabilityPicker from '../components/AvailabilityPicker.vue'
import MessageDisplay from '../components/MessageDisplay.vue'
import { formatMessageWithDates, createMessagePreview, getTeamIdsFromConversation } from '../utils/messageUtils.js'

// Props
const props = defineProps({
  isModal: {
    type: Boolean,
    default: false
  }
})

const messagesStore = useMessagesStore()
const teamStore = useTeamStore()
const authStore = useAuthStore()
const viewingAsTeamStore = useViewingAsTeamStore()

// Local state
const newMessage = ref('')
const selectedDates = ref([])
const messagesContainer = ref(null)
const showMobileChat = ref(false)

// Computed properties
const conversations = computed(() => {
  // Filter conversations to only show those involving the selected viewing team
  if (!viewingAsTeamStore.selectedTeamId) return []
  
  return messagesStore.sortedConversations.filter(conv => 
    conv.requesting_team_id === viewingAsTeamStore.selectedTeamId || 
    conv.target_team_id === viewingAsTeamStore.selectedTeamId
  )
})

const currentConversation = computed(() => messagesStore.currentConversation)
const currentMessages = computed(() => messagesStore.currentMessages)
const unreadCount = computed(() => {
  // Calculate unread count for the selected team
  if (!viewingAsTeamStore.selectedTeamId) return 0
  
  return conversations.value.reduce((total, conv) => {
    // Count unread messages for the selected team
    if (conv.requesting_team_id === viewingAsTeamStore.selectedTeamId) {
      return total + (conv.requesting_team_unread_count || 0)
    } else if (conv.target_team_id === viewingAsTeamStore.selectedTeamId) {
      return total + (conv.target_team_unread_count || 0)
    }
    return total
  }, 0)
})

// Helper functions
const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffInHours = (now - date) / (1000 * 60 * 60)
  
  if (diffInHours < 24) {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  } else if (diffInHours < 168) { // Less than a week
    return date.toLocaleDateString('en-US', { weekday: 'short' })
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
}

const formatMessageTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  })
}

const getOtherTeam = (conversation) => {
  return messagesStore.getOtherTeamFromConversation(conversation)
}

const getUserTeamId = (conversation) => {
  // Always use the selected viewing team as the user's team perspective
  return viewingAsTeamStore.selectedTeamId
}

const getUnreadCount = (conversation) => {
  const userTeamId = getUserTeamId(conversation)
  return userTeamId === conversation.requesting_team_id 
    ? conversation.requesting_team_unread_count || 0
    : conversation.target_team_unread_count || 0
}

const selectConversation = async (conversation) => {
  await messagesStore.setCurrentConversation(conversation)
  showMobileChat.value = true
  await nextTick()
  scrollToBottom()
}

const backToConversationList = () => {
  showMobileChat.value = false
  messagesStore.setCurrentConversation(null)
}

const sendMessage = async () => {
  if (!newMessage.value.trim() || !currentConversation.value || messagesStore.sendingMessage) {
    return
  }

  const conversation = currentConversation.value
  const userTeamId = getUserTeamId(conversation)
  const otherTeam = getOtherTeam(conversation)

  // Format message with embedded dates
  console.log('sendMessage - Before formatting:', { 
    message: newMessage.value.trim(), 
    selectedDates: selectedDates.value 
  })
  const formattedMessage = formatMessageWithDates(newMessage.value.trim(), selectedDates.value)
  console.log('sendMessage - After formatting:', formattedMessage)

  await messagesStore.sendMessage(
    conversation.match_request_id,
    userTeamId,
    otherTeam.id,
    formattedMessage
  )

  // Clear form
  newMessage.value = ''
  selectedDates.value = []
  await nextTick()
  scrollToBottom()
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const handleKeyPress = (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}

// Lifecycle
onMounted(async () => {
  await teamStore.loadUserTeams()
  messagesStore.initialize()
})

onUnmounted(() => {
  messagesStore.cleanupSubscription()
})

// Get conversation team IDs for availability picker
const getConversationTeamIds = (conversation) => {
  return getTeamIdsFromConversation(conversation)
}

// Message preview with embedded dates
const messagePreview = computed(() => {
  console.log('messagePreview computed - newMessage:', newMessage.value.trim(), 'selectedDates:', selectedDates.value)
  if (!newMessage.value.trim()) return ''
  const preview = createMessagePreview(newMessage.value.trim(), selectedDates.value)
  console.log('messagePreview result:', preview)
  return preview
})

// Watch selectedDates for debugging
watch(selectedDates, (newValue) => {
  console.log('MessageView selectedDates changed:', newValue)
}, { deep: true })

// Watch for viewing team changes and close current conversation
watch(() => viewingAsTeamStore.selectedTeamId, () => {
  // Close current conversation when team changes
  messagesStore.setCurrentConversation(null)
  showMobileChat.value = false
  // Clear message form
  newMessage.value = ''
  selectedDates.value = []
}, { immediate: false })
</script>

<template>
  <div :class="props.isModal ? 'h-full bg-gray-50 dark:bg-slate-900' : 'min-h-screen bg-gray-50 dark:bg-slate-900 pb-20 md:pb-0'">
    <!-- Header -->
    <div v-if="!props.isModal" class="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 md:mt-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Team Messages</h1>
            <p class="text-gray-600 dark:text-gray-300">Communicate with other teams</p>
          </div>
          
          <!-- Viewing As Team Selector -->
          <div class="w-full sm:w-auto">
            <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">
              Messaging as
            </label>
            <ViewingAsTeamSelector />
          </div>
        </div>
      </div>
    </div>

    <div :class="props.isModal ? 'h-full' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'">

      <!-- Main Chat Interface -->
      <div class="bg-white dark:bg-slate-800 shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden flex flex-col" 
           :class="props.isModal ? 'h-full rounded-none' : 'rounded-lg'"
           :style="props.isModal ? 'height: 100%;' : 'height: calc(100vh - 200px);'">
        
        <div class="flex h-full">
          <!-- Conversations List -->
          <div class="w-full md:w-1/3 lg:w-1/4 border-r border-gray-200 dark:border-slate-700 flex flex-col"
               :class="{ 'hidden md:flex': showMobileChat && !props.isModal }">
            
            <!-- Conversations Header -->
            <div class="p-4 border-b border-gray-200 dark:border-slate-700">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Conversations
                <span v-if="unreadCount > 0" 
                      class="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                  {{ unreadCount }}
                </span>
              </h2>
            </div>

            <!-- Conversations List -->
            <div class="flex-1 overflow-y-auto">
              <div v-if="messagesStore.loading" class="p-4">
                <div class="animate-pulse space-y-4">
                  <div v-for="i in 3" :key="i" class="flex items-center space-x-3">
                    <div class="w-12 h-12 bg-gray-300 dark:bg-slate-600 rounded-full"></div>
                    <div class="flex-1 space-y-2">
                      <div class="h-4 bg-gray-300 dark:bg-slate-600 rounded w-3/4"></div>
                      <div class="h-3 bg-gray-300 dark:bg-slate-600 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div v-else-if="conversations.length === 0" class="p-4 text-center">
                <div class="text-gray-500 dark:text-gray-400">
                  <svg class="w-12 h-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.962 8.962 0 01-4.5-1.207L3 21l2.207-5.5A8.962 8.962 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                  </svg>
                  <p class="text-sm font-medium mb-2">No conversations yet</p>
                  <p class="text-xs mb-4">Find teams to play against and start conversations</p>
                  <router-link 
                    to="/discovery" 
                    class="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors">
                    <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Discover Teams
                  </router-link>
                </div>
              </div>

              <div v-else class="space-y-1">
                <div v-for="conversation in conversations" 
                     :key="conversation.match_request_id"
                     class="conversation-item p-4 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer transition-colors border-b border-gray-100 dark:border-slate-600"
                     :class="{ 
                       'bg-blue-50 dark:bg-slate-700': currentConversation?.match_request_id === conversation.match_request_id,
                       'opacity-75': !getOtherTeam(conversation).active
                     }"
                     @click="selectConversation(conversation)">
                  
                  <div class="flex items-start space-x-3">
                    <!-- Team Icon -->
                    <div class="w-12 h-12 bg-primary-600 dark:bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span class="text-white font-semibold text-lg">
                        {{ getOtherTeam(conversation).name.charAt(0) }}
                      </span>
                    </div>

                    <!-- Conversation Info -->
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center justify-between">
                        <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {{ getOtherTeam(conversation).name }}
                        </h3>
                                                 <div class="flex items-center space-x-2">
                           <span class="text-xs text-gray-500 dark:text-gray-400">
                             {{ formatTime(conversation.last_activity_at) }}
                           </span>
                          <span v-if="getUnreadCount(conversation) > 0"
                                class="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                            {{ getUnreadCount(conversation) }}
                          </span>
                        </div>
                      </div>
                      
                      <p class="text-xs text-gray-600 dark:text-gray-400 mb-1">
                        {{ getOtherTeam(conversation).sport }} • {{ conversation.status }}
                        <span v-if="!getOtherTeam(conversation).active" class="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          Team Inactive
                        </span>
                      </p>
                      
                      <p class="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {{ conversation.last_message || conversation.initial_message || 'No messages yet' }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Chat Interface -->
          <div class="flex-1 flex flex-col" :class="{ 'hidden md:flex': !showMobileChat && !currentConversation && !props.isModal }">
            
            <!-- No Conversation Selected -->
            <div v-if="!currentConversation" class="flex-1 flex items-center justify-center">
              <div class="text-center text-gray-500 dark:text-gray-400">
                <svg class="w-16 h-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.962 8.962 0 01-4.5-1.207L3 21l2.207-5.5A8.962 8.962 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                </svg>
                <h3 class="text-lg font-medium mb-2">Select a conversation</h3>
                <p class="text-sm">Choose a team from the list to start messaging</p>
              </div>
            </div>

            <!-- Chat with Selected Team -->
            <div v-else class="flex-1 flex flex-col h-0">
              <!-- Chat Header -->
              <div class="p-4 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                <div class="flex items-center space-x-3">
                  <!-- Mobile Back Button -->
                  <button v-if="!props.isModal" 
                          @click="backToConversationList" 
                          class="md:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  <!-- Team Info -->
                  <div class="w-10 h-10 bg-primary-600 dark:bg-primary-500 rounded-full flex items-center justify-center">
                    <span class="text-white font-semibold">
                      {{ getOtherTeam(currentConversation).name.charAt(0) }}
                    </span>
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {{ getOtherTeam(currentConversation).name }}
                    </h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                      {{ getOtherTeam(currentConversation).sport }} • {{ currentConversation.status }}
                      <span v-if="!getOtherTeam(currentConversation).active" class="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                        Team Inactive
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <!-- Messages Container -->
              <div ref="messagesContainer" 
                   class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-slate-900 min-h-0">
                
                <!-- Initial Message -->
                <div v-if="currentConversation.initial_message" class="text-center">
                  <div class="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-lg text-sm">
                    <div class="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">Initial Message:</div>
                    <MessageDisplay :message="currentConversation.initial_message" variant="default" />
                  </div>
                </div>

                <!-- Messages -->
                <div v-for="message in currentMessages" :key="message.id" class="flex"
                     :class="message.sender_team_id === getUserTeamId(currentConversation) ? 'justify-end' : 'justify-start'">
                  
                  <div class="max-w-xs lg:max-w-md px-4 py-2 rounded-lg"
                       :class="message.sender_team_id === getUserTeamId(currentConversation) 
                         ? 'bg-blue-500 text-white rounded-br-sm' 
                         : 'bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-slate-600 rounded-bl-sm'">
                    
                    <MessageDisplay 
                      :message="message.message" 
                      :variant="message.sender_team_id === getUserTeamId(currentConversation) ? 'sent' : 'received'"
                    />
                    
                    <div class="flex items-center justify-end mt-1 space-x-1">
                      <span class="text-xs opacity-75">
                        {{ formatMessageTime(message.sent_at) }}
                      </span>
                      <svg v-if="message.sender_team_id === getUserTeamId(currentConversation) && message.is_read" 
                           class="w-3 h-3 opacity-75" 
                           fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>

                <!-- Loading indicator for new messages -->
                <div v-if="messagesStore.sendingMessage" class="flex justify-end">
                  <div class="max-w-xs lg:max-w-md px-4 py-2 bg-blue-400 text-white rounded-lg rounded-br-sm opacity-75">
                    <div class="flex items-center space-x-2">
                      <div class="animate-pulse">Sending...</div>
                      <div class="flex space-x-1">
                        <div class="w-1 h-1 bg-white rounded-full animate-bounce"></div>
                        <div class="w-1 h-1 bg-white rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                        <div class="w-1 h-1 bg-white rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Message Input -->
              <div class="border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                <!-- Inactive Team Notice -->
                <div v-if="currentConversation && !getOtherTeam(currentConversation).active" class="p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
                  <div class="flex items-center space-x-2 text-red-800 dark:text-red-200">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                    <span class="text-sm font-medium">This team is no longer active. You cannot send new messages.</span>
                  </div>
                </div>

                <!-- Availability Picker -->
                <div v-if="currentConversation && getOtherTeam(currentConversation).active" class="p-3 border-b border-gray-100 dark:border-slate-700">
                  <AvailabilityPicker 
                    :team-ids="getConversationTeamIds(currentConversation)"
                    v-model="selectedDates"
                  />
                </div>

                <!-- Message Input Form -->
                <div v-if="currentConversation && getOtherTeam(currentConversation).active" class="p-4">
                  <div class="flex items-end space-x-3">
                    <div class="flex-1">
                      <textarea v-model="newMessage"
                                @keydown="handleKeyPress"
                                placeholder="Type a message..."
                                rows="1"
                                class="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                                style="min-height: 40px; max-height: 120px;"></textarea>
                    </div>
                    <button @click="sendMessage"
                            :disabled="!newMessage.trim() || messagesStore.sendingMessage"
                            class="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 dark:disabled:bg-slate-600 text-white rounded-lg transition-colors duration-200 flex items-center justify-center min-w-[80px]">
                      <span v-if="!messagesStore.sendingMessage">Send</span>
                      <div v-else class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    </button>
                  </div>
                  
                  <!-- Message Preview -->
                  <div v-if="messagePreview && newMessage.trim()" class="mt-2">
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                      Preview: {{ messagePreview }}
                    </p>
                  </div>
                  
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Press Enter to send, Shift+Enter for new line
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.conversation-item:last-child {
  border-bottom: none;
}

/* Custom scrollbar for messages */
div[ref="messagesContainer"]::-webkit-scrollbar {
  width: 6px;
}

div[ref="messagesContainer"]::-webkit-scrollbar-track {
  background: transparent;
}

div[ref="messagesContainer"]::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 3px;
}

.dark div[ref="messagesContainer"]::-webkit-scrollbar-thumb {
  background: #475569;
}

div[ref="messagesContainer"]::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}

.dark div[ref="messagesContainer"]::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}

/* Auto-resize textarea */
textarea {
  resize: none;
  overflow-y: hidden;
}
</style> 