<template>
  <div class="min-h-screen bg-gray-50 dark:bg-slate-900 pb-20 md:pb-0 transition-colors duration-300">
    <!-- Header -->
    <div class="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 md:mt-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Discover Teams</h1>
            <p class="text-gray-600 dark:text-gray-300">Find teams to play against and build connections</p>
          </div>
          
                    <div class="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <!-- Viewing As Team Selector -->
            <div class="w-full sm:w-auto">
              <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">
                Discovering as
              </label>
              <ViewingAsTeamSelector />
            </div>
            
            <!-- Show Only New Teams Toggle -->
            <div class="flex items-center space-x-2">
              <label class="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  :checked="!primaryFilters.showInteracted"
                  @change="toggleNewTeamsOnly"
                  class="sr-only peer"
                >
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
              <span class="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Show only new
              </span>
            </div>
            
            <button
              @click="showAdvancedFilters = !showAdvancedFilters"
              class="btn btn-secondary shrink-0 w-full sm:w-auto justify-center"
            >
              <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
              Advanced Filters
            </button>
          </div>
        </div>
      </div>
    </div>



    <!-- Advanced Filters Panel -->
    <div v-if="showAdvancedFilters" class="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Advanced Search</h3>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Age Group -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Age Group</label>
            <select v-model="advancedFilters.ageGroup" @change="loadTeams" class="input-field">
              <option value="">All Ages</option>
              <option value="6U">6U</option>
              <option value="7U">7U</option>
              <option value="8U">8U</option>
              <option value="9U">9U</option>
              <option value="10U">10U</option>
              <option value="11U">11U</option>
              <option value="12U">12U</option>
              <option value="13U">13U</option>
              <option value="14U">14U</option>
              <option value="15U">15U</option>
              <option value="16U">16U</option>
              <option value="17U">17U</option>
              <option value="18U">18U</option>
              <option value="18+">18+</option>
            </select>
          </div>

          <!-- Skill Level -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Skill Level</label>
            <select v-model="advancedFilters.skillLevel" @change="loadTeams" class="input-field">
              <option value="">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Elite">Elite</option>
            </select>
          </div>

          <!-- Proximity -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Distance</label>
            <select v-model="advancedFilters.distance" @change="loadTeams" class="input-field">
              <option value="">Any Distance</option>
              <option value="10">Within 10 miles</option>
              <option value="25">Within 25 miles</option>
              <option value="50">Within 50 miles</option>
              <option value="100">Within 100 miles</option>
            </select>
          </div>

          <!-- Availability -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Can Host/Travel</label>
            <select v-model="advancedFilters.availability" @change="loadTeams" class="input-field">
              <option value="">Any</option>
              <option value="host">Can Host</option>
              <option value="travel">Can Travel</option>
              <option value="both">Both Host & Travel</option>
            </select>
          </div>

          <!-- Interaction Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Interactions</label>
            <select v-model="advancedFilters.interactionFilter" @change="loadTeams" class="input-field">
              <option value="">All teams</option>
              <option value="liked">Teams I liked</option>
              <option value="disliked">Teams I disliked</option>
              <option value="no_interaction">No interaction yet</option>
            </select>
          </div>

          <!-- Team Name Search -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Team Name</label>
            <input v-model="advancedFilters.teamName" 
                   @input="debouncedLoadTeams"
                   placeholder="Search team names..."
                   class="input-field">
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-20">
        <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 dark:border-primary-400 mx-auto"></div>
        <p class="text-gray-600 dark:text-gray-400 mt-4">Finding teams for you...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="teams.length === 0" class="text-center py-20">
        <div class="text-gray-500 dark:text-gray-400">
          <svg class="w-16 h-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 class="text-lg font-medium mb-2">No teams found</h3>
          <p class="text-sm">Try adjusting your filters or check back later for new teams.</p>
        </div>
      </div>

      <!-- Teams List -->
      <div v-else class="space-y-6">
        <div v-for="team in teams" :key="team.id" 
             class="team-card bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden hover:shadow-xl transition-all duration-300">
          
          <!-- Team Header -->
          <div class="p-6 pb-4">
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-start space-x-4 flex-1">
                <!-- Team Logo -->
                <div class="flex-shrink-0">
                  <div v-if="team.logo_url" class="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 dark:border-slate-600">
                    <img :src="team.logo_url" :alt="`${team.name} logo`" class="w-full h-full object-cover">
                  </div>
                  <div v-else class="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-xl font-bold border-2 border-gray-200 dark:border-slate-600">
                    {{ team.name.charAt(0).toUpperCase() }}
                  </div>
                </div>
                
                <!-- Team Info -->
                <div class="flex-1 min-w-0">
                  <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{{ team.name }}</h3>
                  <div class="space-y-1">
                  <div class="flex items-center text-gray-600 dark:text-gray-400">
                    <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                    <span class="font-medium">{{ team.sport?.name }} • {{ team.age_group }} • {{ team.skill_level }}</span>
                  </div>
                                     <div class="flex items-center text-gray-600 dark:text-gray-400">
                     <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                     </svg>
                     <span class="font-medium">{{ team.city }}, {{ team.state }}</span>
                     <span v-if="team.distance" class="ml-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
                       {{ Math.round(team.distance) }} mi
                     </span>
                   </div>
                </div>
                </div>
              </div>

              <!-- Like/Dislike Stats -->
              <div class="flex items-center space-x-3 text-sm">
                <div class="flex items-center text-green-600 dark:text-green-400">
                  <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                  </svg>
                  <span>{{ team.stats.like_count }}</span>
                </div>
                <div class="flex items-center text-red-600 dark:text-red-400">
                  <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.106-1.79l-.05-.025A4 4 0 0011.057 2H5.641a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
                  </svg>
                  <span>{{ team.stats.dislike_count }}</span>
                </div>
              </div>
            </div>

            <!-- Team Description -->
            <div v-if="team.description" class="mb-4">
              <p class="text-gray-600 dark:text-gray-400 text-sm">{{ team.description }}</p>
            </div>

            <!-- Match Reasons -->
            <div v-if="team.matchReasons && team.matchReasons.length > 0" class="mb-4">
              <div class="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-3">
                <h4 class="text-sm font-medium text-primary-800 dark:text-primary-200 mb-2 flex items-center">
                  <span class="text-lg mr-2">🎯</span>
                  Why this is a good match
                </h4>
                <div class="space-y-1">
                  <div v-for="reason in team.matchReasons.slice(0, 2)" :key="reason.type" class="flex items-center text-xs">
                    <span class="mr-2">{{ reason.icon }}</span>
                    <span class="text-primary-700 dark:text-primary-300">{{ reason.description }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="p-6 pt-0">
            <div class="flex space-x-3">
              <!-- Dislike Button -->
              <button 
                @click="handleDislike(team)"
                :disabled="loading || getUserInteractionType(team) === 'dislike'"
                class="btn flex-1 flex items-center justify-center space-x-2 transition-all duration-200"
                :class="[
                  getUserInteractionType(team) === 'dislike' 
                    ? 'bg-red-500 text-white cursor-not-allowed opacity-90' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400',
                  (loading || getUserInteractionType(team) === 'dislike') ? 'pointer-events-none' : ''
                ]"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.106-1.79l-.05-.025A4 4 0 0011.057 2H5.641a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
                </svg>
                <span>{{ getUserInteractionType(team) === 'dislike' ? 'Disliked' : 'Dislike' }}</span>
                <span class="text-xs opacity-75">({{ team.stats.dislike_count }})</span>
              </button>

              <!-- Like Button -->
              <button 
                @click="handleLike(team)"
                :disabled="loading || getUserInteractionType(team) === 'like'"
                class="btn flex-1 flex items-center justify-center space-x-2 transition-all duration-200"
                :class="[
                  getUserInteractionType(team) === 'like' 
                    ? 'bg-green-500 text-white cursor-not-allowed opacity-90' 
                    : 'bg-primary-600 hover:bg-primary-700 text-white',
                  (loading || getUserInteractionType(team) === 'like') ? 'pointer-events-none' : ''
                ]"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                </svg>
                <span>{{ getUserInteractionType(team) === 'like' ? 'Liked' : 'Like' }}</span>
                <span class="text-xs opacity-75">({{ team.stats.like_count }})</span>
              </button>
            </div>

            <!-- Message Status -->
            <div v-if="getMessageButtonStatus(team)" class="mt-3 text-center">
              <button 
                @click="handleMessageButton(team)"
                class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105"
                :class="getMessageButtonClass(team)"
              >
                {{ getMessageButtonText(team) }}
                <svg class="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Send Message Modal -->
    <div v-if="showMessageModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4">
              <div class="bg-white dark:bg-slate-800 rounded-2xl max-w-lg md:max-w-xl w-full h-fit max-h-[95vh] flex flex-col shadow-2xl">
        <!-- Modal Header (Fixed) -->
        <div class="flex-shrink-0 p-4 md:p-6 border-b border-gray-200 dark:border-slate-600">
          <div class="text-center">
            <div class="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Great Choice! 👍</h3>
            <p class="text-gray-600 dark:text-gray-400">Send a message to <strong>{{ selectedTeam?.name }}</strong></p>
          </div>
        </div>

        <!-- Modal Body (Scrollable) -->
        <div class="flex-1 overflow-y-auto p-4 md:p-6">
          <form @submit.prevent="sendMessage" class="space-y-4">
            <!-- Your Team Display -->
            <div v-if="viewingAsTeamStore.selectedTeam" class="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your Team</label>
              <div class="flex items-center space-x-3">
                <div class="flex-shrink-0">
                  <div v-if="viewingAsTeamStore.selectedTeam.logo_url" 
                       class="w-8 h-8 rounded-full overflow-hidden border border-gray-200 dark:border-slate-600">
                    <img :src="viewingAsTeamStore.selectedTeam.logo_url" 
                         :alt="`${viewingAsTeamStore.selectedTeam.name} logo`" 
                         class="w-full h-full object-cover">
                  </div>
                  <div v-else 
                       class="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-xs font-bold">
                    {{ viewingAsTeamStore.selectedTeam.name.charAt(0).toUpperCase() }}
                  </div>
                </div>
                <div>
                  <div class="font-medium text-gray-900 dark:text-gray-100">{{ viewingAsTeamStore.selectedTeam.name }}</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    {{ viewingAsTeamStore.selectedTeam.sport?.name }} • {{ viewingAsTeamStore.selectedTeam.age_group }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Availability Picker -->
            <div v-if="viewingAsTeamStore.selectedTeam && selectedTeam">
              <AvailabilityPicker 
                :team-ids="[viewingAsTeamStore.selectedTeamId, selectedTeam.id]"
                v-model="selectedDates"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message</label>
              <textarea
                                  v-model="messageData.message"
                rows="3"
                class="input-field"
                placeholder="Tell them why you'd like to play..."
              ></textarea>
              
              <!-- Message Preview -->
              <div v-if="messagePreview" class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Preview: {{ messagePreview }}
              </div>
            </div>

          </form>
        </div>

        <!-- Modal Footer (Fixed) -->
        <div class="flex-shrink-0 p-4 md:p-6 border-t border-gray-200 dark:border-slate-600">
          <div class="flex space-x-3">
            <button 
              type="button"
              @click="closeMessageModal"
              class="btn btn-secondary flex-1"
            >
              Cancel
            </button>
            <button 
              @click="sendMessage"
              class="btn btn-primary flex-1"
              :disabled="sending"
            >
              <svg v-if="sending" class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ sending ? 'Sending...' : 'Send Message' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <div v-if="showConfirmation" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4">
      <div class="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6">
        <div class="text-center">
          <div class="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Change Your Mind?</h3>
          <p class="text-gray-600 dark:text-gray-400 mb-6">
            You previously {{ confirmationData.currentInteraction }} this team. 
            Are you sure you want to {{ confirmationData.newInteraction }} them instead?
          </p>
          <div class="flex space-x-3">
            <button @click="cancelConfirmation" class="btn btn-secondary flex-1">
              Cancel
            </button>
            <button @click="confirmInteraction" class="btn btn-primary flex-1">
              Yes, {{ confirmationData.newInteraction }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import { useTeamStore } from '../stores/teams.js'
import { useInteractionsStore } from '../stores/interactions.js'
import { useMessagesStore } from '../stores/messages.js'
import { useNotificationStore } from '../stores/notifications.js'
import { useDashboardStore } from '../stores/dashboard.js'
import { useViewingAsTeamStore } from '../stores/viewingAsTeam.js'
import { useRouter } from 'vue-router'
import { calculateDistance } from '../services/geocoding.js'
import ViewingAsTeamSelector from '../components/ViewingAsTeamSelector.vue'
import AvailabilityPicker from '../components/AvailabilityPicker.vue'
import { formatMessageWithDates, createMessagePreview } from '../utils/messageUtils.js'

const authStore = useAuthStore()
const teamStore = useTeamStore()
const interactionsStore = useInteractionsStore()
const messagesStore = useMessagesStore()
const notificationStore = useNotificationStore()
const dashboardStore = useDashboardStore()
const viewingAsTeamStore = useViewingAsTeamStore()
const router = useRouter()

// State
const loading = ref(true)
const teams = ref([])
const yourTeams = ref([])
const matchRequests = ref([])
const showAdvancedFilters = ref(false)
const showMessageModal = ref(false)
const showConfirmation = ref(false)
const selectedTeam = ref(null)
const sending = ref(false)
const confirmationData = ref({})

// Computed
const availableSports = computed(() => teamStore.sports.map(sport => sport.name))

// Primary Filters (Highly Visible) - simplified since viewingAsTeam replaces sport/matchTeam
const primaryFilters = ref({
  showInteracted: true // Default to all teams
})

// Advanced Filters (Less Visible)
const advancedFilters = ref({
  ageGroup: '',
  skillLevel: '',
  distance: '',
  availability: '',
  interactionFilter: '',
  teamName: ''
})

// Message data (simplified since viewingAsTeam determines the requesting team)
const messageData = ref({
  message: ''
})
const selectedDates = ref([])

// Debounced team loading for text search
let debounceTimeout = null
const debouncedLoadTeams = () => {
  clearTimeout(debounceTimeout)
  debounceTimeout = setTimeout(loadTeams, 300)
}

// Get available sports from user teams
const getUserTeamSports = () => {
  return yourTeams.value.map(team => team.sport_id).filter(Boolean)
}

// Get match team for filtering
const getMatchTeam = () => {
  if (!primaryFilters.value.matchTeam) return null
  return yourTeams.value.find(team => team.id === primaryFilters.value.matchTeam)
}

// Calculate match reasons between two teams
const calculateMatchReasons = (theirTeam, userTeam) => {
  const reasons = []

  // Same sport
  if (userTeam.sport_id === theirTeam.sport_id) {
    reasons.push({
      type: 'sport',
      icon: '⚽',
      title: 'Same Sport',
      description: `Both teams play ${theirTeam.sport?.name || 'the same sport'}`
    })
  }

  // Age group compatibility
  if (userTeam.age_group === theirTeam.age_group) {
    reasons.push({
      type: 'age',
      icon: '👥',
      title: 'Same Age Group',
      description: `Both teams are ${userTeam.age_group}`
    })
  }

  // Skill level compatibility
  const skillLevels = ['Beginner', 'Intermediate', 'Advanced', 'Elite']
  const userSkillIndex = skillLevels.indexOf(userTeam.skill_level)
  const theirSkillIndex = skillLevels.indexOf(theirTeam.skill_level)
  const skillDiff = Math.abs(userSkillIndex - theirSkillIndex)

  if (userTeam.skill_level === theirTeam.skill_level) {
    reasons.push({
      type: 'skill',
      icon: '🎯',
      title: 'Perfect Skill Match',
      description: `Both teams are ${userTeam.skill_level} level`
    })
  } else if (skillDiff === 1) {
    reasons.push({
      type: 'skill',
      icon: '⚖️',
      title: 'Compatible Skill Level',
      description: `Close skill levels: ${userTeam.skill_level} vs ${theirTeam.skill_level}`
    })
  }

  // Geographic proximity
  if (userTeam.state === theirTeam.state) {
    if (userTeam.city === theirTeam.city) {
      reasons.push({
        type: 'location',
        icon: '📍',
        title: 'Same City',
        description: `Both teams are in ${userTeam.city}, ${userTeam.state}`
      })
    } else {
      reasons.push({
        type: 'location',
        icon: '🗺️',
        title: 'Same State',
        description: `Both teams are in ${userTeam.state}`
      })
    }
  }

  return reasons
}

// Sort teams according to STATUS_OF_WORK.md specifications
const sortTeams = (teams) => {
  const matchTeam = getMatchTeam()
  
  return teams.sort((a, b) => {
    // 1. Sport they have teams in (if other_team_sport = their_team_sport then 1 else 0) descending
    let aHasSameSport = 0
    let bHasSameSport = 0
    
    if (matchTeam) {
      aHasSameSport = a.sport_id === matchTeam.sport_id ? 1 : 0
      bHasSameSport = b.sport_id === matchTeam.sport_id ? 1 : 0
    } else {
      // Check against any of user's teams
      const userSportIds = getUserTeamSports()
      aHasSameSport = userSportIds.includes(a.sport_id) ? 1 : 0
      bHasSameSport = userSportIds.includes(b.sport_id) ? 1 : 0
    }
    
    if (bHasSameSport !== aHasSameSport) {
      return bHasSameSport - aHasSameSport
    }

    if (matchTeam) {
      // 2. Absolute age difference between their teams sport
      const getAgeNumber = (ageGroup) => {
        if (ageGroup === '18+') return 18
        return parseInt(ageGroup?.replace('U', '') || '0')
      }
      
      const userAge = getAgeNumber(matchTeam.age_group)
      const aAge = getAgeNumber(a.age_group)
      const bAge = getAgeNumber(b.age_group)
      
      const aDiff = Math.abs(userAge - aAge)
      const bDiff = Math.abs(userAge - bAge)
      
      if (aDiff !== bDiff) {
        return aDiff - bDiff
      }

      // 3. Proximity difference (if coordinates available)
      if (matchTeam.latitude && matchTeam.longitude) {
        const aDistance = (a.distance !== undefined) ? a.distance : 
          (a.latitude && a.longitude) ? 
            calculateDistance(matchTeam.latitude, matchTeam.longitude, a.latitude, a.longitude) : 
            999999
        
        const bDistance = (b.distance !== undefined) ? b.distance :
          (b.latitude && b.longitude) ? 
            calculateDistance(matchTeam.latitude, matchTeam.longitude, b.latitude, b.longitude) : 
            999999
        
        if (aDistance !== bDistance) {
          return aDistance - bDistance
        }
      }

      // 4. Absolute difference in skill
      const skillLevels = ['Beginner', 'Intermediate', 'Advanced', 'Elite']
      const userSkillIndex = skillLevels.indexOf(matchTeam.skill_level)
      const aSkillIndex = skillLevels.indexOf(a.skill_level)
      const bSkillIndex = skillLevels.indexOf(b.skill_level)
      
      const aSkillDiff = Math.abs(userSkillIndex - aSkillIndex)
      const bSkillDiff = Math.abs(userSkillIndex - bSkillIndex)
      
      if (aSkillDiff !== bSkillDiff) {
        return aSkillDiff - bSkillDiff
      }
    }

    // 5. Is disliked (if disliked before 1 else 0) ascending
    const aDisliked = getUserInteractionType(a) === 'dislike' ? 1 : 0
    const bDisliked = getUserInteractionType(b) === 'dislike' ? 1 : 0
    
    if (aDisliked !== bDisliked) {
      return aDisliked - bDisliked
    }

    // Default: most recent teams first
    return new Date(b.created_at) - new Date(a.created_at)
  })
}

// Get user's interaction type for a team
const getUserInteractionType = (team) => {
  if (!viewingAsTeamStore.selectedTeamId) return null
  
  // Check against the selected viewing team
  const interaction = interactionsStore.getTeamInteraction(viewingAsTeamStore.selectedTeamId, team.id)
  const interactionType = interaction?.interaction_type || null
  
  return interactionType
}

// Get request status for a team
const getRequestStatus = (team) => {
  const userTeamIds = yourTeams.value.map(t => t.id)
  
  const sentRequest = matchRequests.value.find(req => 
    userTeamIds.includes(req.requesting_team_id) && req.target_team_id === team.id
  )
  
  return sentRequest?.status || null
}

const getRequestStatusText = (status) => {
  const statusMap = {
    'pending': 'Messages',
    'accepted': 'Message Accepted!',
    'declined': 'Message Declined',
    'cancelled': 'Message Cancelled'
  }
  return statusMap[status] || ''
}

const getRequestStatusClass = (status) => {
  const classMap = {
    'pending': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800 cursor-pointer',
    'accepted': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800 cursor-pointer',
    'declined': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800 cursor-pointer',
    'cancelled': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer'
  }
  return classMap[status] || ''
}

// Check if there's an existing conversation with actual messages
const hasExistingConversation = (team) => {
  if (!messagesStore.conversations || messagesStore.conversations.length === 0) {
    return false
  }
  
  return messagesStore.conversations.some(conv => 
    (conv.requesting_team_id === viewingAsTeamStore.selectedTeamId && conv.target_team_id === team.id) ||
    (conv.target_team_id === viewingAsTeamStore.selectedTeamId && conv.requesting_team_id === team.id)
  )
}

// Enhanced message button logic - shows for both existing conversations AND liked teams
const getMessageButtonStatus = (team) => {
  // First check if there's an existing conversation WITH MESSAGES - this takes precedence
  if (hasExistingConversation(team)) return 'pending' // Show as "Messages" to navigate to conversation
  
  // Check if team is liked (show Send Message button)
  const interactionType = getUserInteractionType(team)
  if (interactionType === 'like') return 'liked'
  
  // Don't show button for match requests without actual conversations
  // This prevents showing "Messages" when there are no actual messages
  
  return null
}

const getMessageButtonText = (team) => {
  const status = getMessageButtonStatus(team)
  
  if (status === 'liked') return 'Send Message'
  if (status === 'pending') return 'Messages' // Only for actual conversations
  
  // For any other status, don't show button
  return ''
}

const getMessageButtonClass = (team) => {
  const status = getMessageButtonStatus(team)
  
  if (status === 'liked') {
    return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800 cursor-pointer'
  }
  
  if (status === 'pending') {
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800 cursor-pointer'
  }
  
  return ''
}

const handleMessageButton = async (team) => {
  const status = getMessageButtonStatus(team)
  
  if (status === 'liked') {
    // Open the send message modal for liked teams (no existing conversation)
    selectedTeam.value = team
    showMessageModal.value = true
  } else if (status === 'pending') {
    // Navigate to existing conversation with messages
    await navigateToMessages(team)
  } else {
    console.warn(`Unexpected button status: ${status} for team: ${team.name}`)
    notificationStore.warning('Unexpected State', 'Something went wrong. Please try refreshing the page.')
  }
}

// Navigate to messages for a specific team
const navigateToMessages = async (team) => {
  try {
    // Find the conversation for this team
    await messagesStore.loadConversations()
    
    const conversation = messagesStore.sortedConversations.find(conv => 
      (conv.requesting_team_id === viewingAsTeamStore.selectedTeamId && conv.target_team_id === team.id) ||
      (conv.target_team_id === viewingAsTeamStore.selectedTeamId && conv.requesting_team_id === team.id)
    )
    
    if (conversation) {
      // Set the conversation as active and navigate to messages
      messagesStore.setCurrentConversation(conversation)
      await router.push('/requests')
    } else {
      notificationStore.info('No Messages', `No message history found with ${team.name}`)
    }
  } catch (error) {
    console.error('Error navigating to messages:', error)
    notificationStore.error('Navigation Error', 'Failed to open messages')
  }
}

// Handle like action
const handleLike = async (team) => {
  const currentInteraction = getUserInteractionType(team)
  
  if (currentInteraction === 'like') {
    // Already liked, button should be disabled - this shouldn't happen
    console.warn('Team already liked, button should be disabled!')
    notificationStore.info('Already Liked', `You've already liked ${team.name}`)
    return
  }

  if (currentInteraction === 'dislike') {
    // Ask for confirmation to switch from dislike to like
    confirmationData.value = {
      team,
      currentInteraction: 'disliked',
      newInteraction: 'like',
      action: 'like'
    }
    showConfirmation.value = true
    return
  }

  // No previous interaction, proceed with like
  await setInteraction(team, 'like')
  
  // Show success notification
      notificationStore.success('Liked! 👍', `You liked ${team.name}. You can now send a message!`)
  
      // After successful like, show message modal after a small delay
    setTimeout(() => {
      selectedTeam.value = team
      showMessageModal.value = true
    }, 800) // Give time for the like to register and button to update
}

// Handle dislike action
const handleDislike = async (team) => {
  const currentInteraction = getUserInteractionType(team)
  
  if (currentInteraction === 'dislike') {
    // Already disliked, button should be disabled - this shouldn't happen
    console.warn('Team already disliked, button should be disabled!')
    notificationStore.info('Already Disliked', `You've already disliked ${team.name}`)
    return
  }

  if (currentInteraction === 'like') {
    // Ask for confirmation to switch from like to dislike
    confirmationData.value = {
      team,
      currentInteraction: 'liked',
      newInteraction: 'dislike',
      action: 'dislike'
    }
    showConfirmation.value = true
    return
  }

  // No previous interaction, proceed with dislike
  await setInteraction(team, 'dislike')
  
  // Show success notification
  notificationStore.success('Disliked 👎', `You disliked ${team.name}`)
}

// Set interaction
const setInteraction = async (team, interactionType) => {
  if (!viewingAsTeamStore.selectedTeamId) {
    notificationStore.error('No Team Selected', 'Please select a team to view as first.')
    return
  }

  try {
    loading.value = true
    await interactionsStore.setTeamInteraction(viewingAsTeamStore.selectedTeamId, team.id, interactionType)
    
    // Update team stats locally
    const stats = interactionsStore.getTeamStats(team.id)
    team.stats = stats

    // Force Vue reactivity update by updating the teams array
    const teamIndex = teams.value.findIndex(t => t.id === team.id)
    if (teamIndex !== -1) {
      teams.value[teamIndex] = { ...teams.value[teamIndex], stats }
    }
  } catch (error) {
    console.error('Error setting interaction:', error)
    notificationStore.error('Error', 'Failed to save interaction. Please try again.')
  } finally {
    loading.value = false
  }
}

// Remove interaction
const removeInteraction = async (team) => {
  if (!viewingAsTeamStore.selectedTeamId) {
    notificationStore.error('No Team Selected', 'Please select a team to view as first.')
    return
  }

  await interactionsStore.removeTeamInteraction(viewingAsTeamStore.selectedTeamId, team.id)
  
  // Update team stats locally
  const stats = interactionsStore.getTeamStats(team.id)
  team.stats = stats
}

// Confirmation handlers
const confirmInteraction = async () => {
  const { team, action } = confirmationData.value
  
  try {
    await setInteraction(team, action)
    
    if (action === 'like') {
      notificationStore.success('Switched to Like! 👍', `You now like ${team.name}`)
    } else if (action === 'dislike') {
      notificationStore.success('Switched to Dislike 👎', `You now dislike ${team.name}`)
    }
  } catch (error) {
    notificationStore.error('Error', 'Failed to update interaction')
  }
  
  showConfirmation.value = false
  confirmationData.value = {}
}

const cancelConfirmation = () => {
  showConfirmation.value = false
  confirmationData.value = {}
}

// Toggle function for "Show only new" switch
const toggleNewTeamsOnly = () => {
  // Invert the showInteracted value
  // When toggle is ON (checked), we want showInteracted = false (new teams only)
  // When toggle is OFF (unchecked), we want showInteracted = true (all teams)
  primaryFilters.value.showInteracted = !primaryFilters.value.showInteracted
  loadTeams()
}

// Load teams with filtering and sorting
const loadTeams = async () => {
  try {
    loading.value = true
    
    // If no team is selected for viewing, show empty state
    if (!viewingAsTeamStore.selectedTeam) {
      teams.value = []
      loading.value = false
      return
    }
    
    // Use the selected viewing team for sport filtering and coordinates
    const selectedTeam = viewingAsTeamStore.selectedTeam
    const userTeamSports = [selectedTeam.sport_id]
    
    let userTeamCoordinates = null
    if (selectedTeam.latitude && selectedTeam.longitude) {
      userTeamCoordinates = {
        latitude: selectedTeam.latitude,
        longitude: selectedTeam.longitude
      }
    }

    // Build filter object combining advanced filters (no sport filter needed since we use selectedTeam.sport)
    const combinedFilters = {
      ...advancedFilters.value,
      showInteracted: primaryFilters.value.showInteracted
    }

    const result = await teamStore.searchTeams(combinedFilters, userTeamSports, userTeamCoordinates)
    
    if (result.error) throw result.error
    
    // Process teams
    let processedTeams = result.data.map(team => {
      const stats = interactionsStore.getTeamStats(team.id)
      
      return {
        ...team,
        stats,
        matchReasons: calculateMatchReasons(team, selectedTeam)
      }
    })

    // Apply interaction filter
    if (advancedFilters.value.interactionFilter) {
      processedTeams = processedTeams.filter(team => {
        const interaction = getUserInteractionType(team)
        
        switch (advancedFilters.value.interactionFilter) {
          case 'liked':
            return interaction === 'like'
          case 'disliked':
            return interaction === 'dislike'
          case 'no_interaction':
            return !interaction
          default:
            return true
        }
      })
    }

    // Filter out interacted teams if showInteracted is false
    if (!primaryFilters.value.showInteracted) {
      processedTeams = processedTeams.filter(team => !getUserInteractionType(team))
    }

    // Apply team name filter
    if (advancedFilters.value.teamName) {
      const searchTerm = advancedFilters.value.teamName.toLowerCase()
      processedTeams = processedTeams.filter(team => 
        team.name.toLowerCase().includes(searchTerm)
      )
    }

    // Sort teams according to specifications
    teams.value = sortTeams(processedTeams)
    
    // Cache team data for dashboard
    dashboardStore.cacheTeamData(teams.value)
    
  } catch (error) {
    console.error('Error loading teams:', error)
    notificationStore.error('Loading Error', 'Failed to load teams. Please try again.')
  } finally {
    loading.value = false
  }
}

// Load user teams and messages
const loadUserData = async () => {
  try {
    await teamStore.loadUserTeams()
    yourTeams.value = teamStore.activeTeams

    const result = await teamStore.getMatchRequests('all')
    if (!result.error) {
      matchRequests.value = result.data || []
    }
  } catch (error) {
    console.error('Error loading user data:', error)
  }
}

// Send message
const sendMessage = async () => {
  try {
    sending.value = true
    
    // Store team name before closing modal (to avoid null reference)
    const targetTeamName = selectedTeam.value?.name || 'the team'
    
    // Use the selected viewing team as the requesting team
    if (!viewingAsTeamStore.selectedTeamId) {
      notificationStore.error('No Team Selected', 'Please select a team to view as first.')
      return
    }
    
    // Format message with embedded dates
    const formattedMessage = formatMessageWithDates(messageData.value.message, selectedDates.value)

    const result = await teamStore.sendMatchRequest({
      requestingTeamId: viewingAsTeamStore.selectedTeamId,
      targetTeamId: selectedTeam.value.id,
      preferredDates: 'Open to discussion',
      message: formattedMessage
    })
    
    if (result.error) throw result.error
    
    // Reload messages
    await loadUserData()
    
    closeMessageModal()
    
    notificationStore.success(
              'Message Sent! 🎉',
        `Your message has been sent to ${targetTeamName}.`
    )

    // Redirect to conversation
    setTimeout(async () => {
      await messagesStore.loadConversations()
      
      const newConversation = messagesStore.conversations.find(conv => 
        conv.match_request_id === result.data.id
      )
      
      if (newConversation) {
        await router.push('/requests')
        await messagesStore.setCurrentConversation(newConversation)
      } else {
        router.push('/requests')
      }
    }, 1000)
    
  } catch (error) {
    console.error('Error sending message:', error)
          notificationStore.error('Failed to Send Message', error.message)
  } finally {
    sending.value = false
  }
}

const closeMessageModal = () => {
  showMessageModal.value = false
  selectedTeam.value = null
  messageData.value = {
    message: ''
  }
  selectedDates.value = []
}

// Watch for filter changes
watch(() => [primaryFilters.value.sport, primaryFilters.value.matchTeam, primaryFilters.value.showInteracted], 
  () => loadTeams(), 
  { deep: true }
)

// Initialize
onMounted(async () => {
  await Promise.all([
    loadUserData(),
    interactionsStore.initialize(),
    messagesStore.loadConversations() // Load conversations to check for existing chats
  ])
  await loadTeams()
})

// Message preview with embedded dates
const messagePreview = computed(() => {
  if (!messageData.value.message.trim()) return ''
  return createMessagePreview(messageData.value.message.trim(), selectedDates.value)
})

// Watch for viewing team changes and reload teams
watch(() => viewingAsTeamStore.selectedTeamId, () => {
  loadTeams()
  messagesStore.loadConversations() // Reload conversations for the new team context
}, { immediate: false })
</script>

<style scoped>
.team-card {
  position: relative;
  transform: scale(1);
  transition: all 0.3s ease;
}

.team-card:hover {
  transform: scale(1.02);
}


</style> 