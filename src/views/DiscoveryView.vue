<template>
  <div class="min-h-screen bg-gray-50 dark:bg-slate-900 pb-20 md:pb-0 transition-colors duration-300">
    <!-- Header with gradient background -->
    <div class="bg-pattern border-b border-gray-200 dark:border-slate-700 md:mt-16">
      <div class="glass">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div class="flex items-center justify-between">
            <div class="fade-in">
              <h1 class="text-3xl font-bold text-gradient mb-2">Find Your Match</h1>
              <p class="text-gray-600 dark:text-gray-400">Browse teams to find your perfect opponent</p>
            </div>
            <button 
              @click="showFilters = !showFilters"
              class="btn btn-secondary flex items-center space-x-2 slide-up shrink-0"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
              <span>Filters</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters Panel -->
    <div v-if="showFilters" class="glass border-b border-gray-200 dark:border-slate-700 slide-up">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sport</label>
            <select v-model="filters.sport" @change="loadTeams" class="input-field">
              <option value="">All Sports</option>
              <option v-for="sport in availableSports" :key="sport" :value="sport">{{ sport }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Age Group</label>
            <select v-model="filters.ageGroup" @change="loadTeams" class="input-field">
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
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Skill Level</label>
            <select v-model="filters.skillLevel" @change="loadTeams" class="input-field">
              <option value="">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Elite">Elite</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Distance</label>
            <select v-model="filters.distance" @change="loadTeams" class="input-field">
              <option value="">Any Distance</option>
              <option value="10">Within 10 miles</option>
              <option value="25">Within 25 miles</option>
              <option value="50">Within 50 miles</option>
              <option value="100">Within 100 miles</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Availability</label>
            <select v-model="filters.availability" @change="loadTeams" class="input-field">
              <option value="">Any</option>
              <option value="host">Can Host</option>
              <option value="travel">Can Travel</option>
              <option value="both">Both Host & Travel</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Show Interacted</label>
            <select v-model="filters.showInteracted" @change="loadTeams" class="input-field">
              <option :value="true">Show All Teams</option>
              <option :value="false">Hide Already Interacted</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-20">
        <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 dark:border-primary-400 mx-auto mb-4"></div>
        <p class="text-gray-600 dark:text-gray-400">Finding amazing teams for you...</p>
      </div>

      <!-- No Teams State -->
      <div v-else-if="teams.length === 0" class="text-center py-20">
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 card-hover">
          <svg class="w-20 h-20 mx-auto mb-6 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">No Teams Found</h3>
          <p class="text-gray-600 dark:text-gray-400 mb-6">
            {{ !filters.showInteracted ? 
               "You've interacted with all available teams! Try enabling 'Show All Teams' in filters to see them again." :
               "We couldn't find any teams matching your criteria. Try adjusting your filters or check back later!"
            }}
          </p>
          <div class="space-y-3">
            <button 
              @click="resetAndReload"
              class="btn btn-primary bounce-in w-full"
            >
              <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Teams
            </button>
            
            <button 
              v-if="passedTeams.size > 0"
              @click="clearPassedTeams"
              class="btn btn-secondary w-full"
            >
              <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear Passed Teams ({{ passedTeams.size }})
            </button>
          </div>
        </div>
      </div>

      <!-- Teams Feed -->
      <div v-else class="space-y-6">
        <div 
          v-for="team in teams" 
          :key="team.id"
          class="team-card bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 relative fade-in"
        >
          <!-- Interaction Status Badge -->
          <div v-if="team.interactionStatus" class="absolute top-4 right-4 z-10">
            <div 
              class="status-interaction-badge"
              :class="getInteractionStatusClass(team.interactionStatus.color)"
            >
              <span class="text-lg mr-1">{{ team.interactionStatus.icon }}</span>
              <span class="text-sm font-medium">{{ team.interactionStatus.label }}</span>
            </div>
          </div>

          <div class="p-8">
            <!-- Team Header -->
            <div class="text-center mb-6">
              <!-- Team Logo -->
              <div class="w-20 h-20 mx-auto mb-4 relative">
                <img 
                  v-if="team.logo_url" 
                  :src="team.logo_url" 
                  :alt="`${team.name} logo`"
                  class="w-full h-full rounded-full object-cover border-2 border-primary-200 dark:border-primary-700 shadow-lg"
                  @error="onImageError"
                />
                <div 
                  v-else
                  class="w-full h-full bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg"
                >
                  {{ team.name.charAt(0).toUpperCase() }}
                </div>
              </div>
              
              <h2 class="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{{ team.name }}</h2>
              <div class="flex items-center justify-center space-x-3">
                <span class="status-badge" :class="getSkillLevelClass(team.skill_level)">
                  {{ team.skill_level }}
                </span>
                <span class="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-full text-sm font-medium">
                  {{ team.sport_name }}
                </span>
                <span class="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                  {{ team.age_group }}
                </span>
              </div>
            </div>

            <!-- Team Details -->
            <div class="space-y-4 mb-6">
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div class="flex items-center text-gray-600 dark:text-gray-400">
                    <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span class="font-medium">{{ team.city }}, {{ team.state }}</span>
                  </div>
                </div>
                <div>
                  <div class="flex items-center text-gray-600 dark:text-gray-400" v-if="team.home_venue">
                    <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-3 4h1m-1 4h1" />
                    </svg>
                    <span class="font-medium">{{ team.home_venue }}</span>
                  </div>
                </div>
              </div>

              <div v-if="team.description" class="pt-2">
                <span class="font-medium text-gray-500 dark:text-gray-400">About:</span>
                <p class="text-gray-900 dark:text-gray-100 mt-1">{{ team.description }}</p>
              </div>
            </div>
                  
            <!-- Availability Indicators -->
            <div class="flex justify-center space-x-4 mb-6">
              <div v-if="team.can_host" class="flex items-center text-green-600 dark:text-green-400">
                <svg class="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span class="text-sm font-medium">Can Host</span>
              </div>
              <div v-if="team.can_travel" class="flex items-center text-blue-600 dark:text-blue-400">
                <svg class="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <span class="text-sm font-medium">Can Travel</span>
              </div>
            </div>

            <!-- Enhanced Availability Display -->
            <div v-if="team.upcoming_availability && team.upcoming_availability.length > 0" class="mb-6">
              <h4 class="font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                <svg class="w-4 h-4 mr-2 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Upcoming Availability
              </h4>
              
              <!-- Compact availability table -->
              <div class="bg-gray-50 dark:bg-slate-700 rounded-lg p-3">
                <div class="space-y-2">
                  <div 
                    v-for="slot in team.upcoming_availability.slice(0, 4)" 
                    :key="slot.id"
                    class="flex items-center justify-between text-sm"
                  >
                    <div class="flex items-center space-x-2">
                      <div :class="getAvailabilityTypeClass(slot.type)" class="w-2 h-2 rounded-full"></div>
                      <span class="font-medium text-gray-900 dark:text-gray-100">
                        {{ formatDate(slot.date) }}
                      </span>
                    </div>
                    <div class="text-gray-600 dark:text-gray-400">
                      {{ slot.all_day ? 'All day' : (slot.time ? formatTime(slot.time) : 'All day') }}
                      <span v-if="slot.type === 'available'" class="ml-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-1 rounded">Host</span>
                      <span v-if="slot.type === 'travel'" class="ml-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-1 rounded">Travel</span>
                    </div>
                  </div>
                  
                  <div v-if="team.upcoming_availability.length > 4" class="text-xs text-gray-500 dark:text-gray-400 text-center pt-1">
                    +{{ team.upcoming_availability.length - 4 }} more dates
                  </div>
                </div>
              </div>
            </div>

            <!-- No availability notice -->
            <div v-else class="mb-6">
              <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                <p class="text-sm text-yellow-800 dark:text-yellow-200 flex items-center">
                  <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  No upcoming availability listed
                </p>
              </div>
            </div>

            <!-- Match Compatibility Reasons -->
            <div v-if="team.matchReasons && team.matchReasons.length > 0" class="mb-6">
              <h4 class="font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                <svg class="w-4 h-4 mr-2 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Why this match?
              </h4>
              
              <!-- Match reasons grid -->
              <div class="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-3">
                <div class="space-y-2">
                  <div 
                    v-for="reason in team.matchReasons.slice(0, 3)" 
                    :key="reason.type"
                    class="flex items-center text-sm"
                  >
                    <span class="text-lg mr-2">{{ reason.icon }}</span>
                    <div class="flex-1">
                      <span class="font-medium text-primary-800 dark:text-primary-200">{{ reason.title }}</span>
                      <p class="text-primary-700 dark:text-primary-300 text-xs mt-1">{{ reason.description }}</p>
                    </div>
                  </div>
                  
                  <div v-if="team.matchReasons.length > 3" class="text-xs text-primary-600 dark:text-primary-400 text-center pt-1">
                    +{{ team.matchReasons.length - 3 }} more reasons
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex space-x-4">
              <button 
                @click="passTeam(team)"
                class="btn flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                :disabled="team.interactionStatus?.type === 'passed'"
              >
                <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                {{ team.interactionStatus?.type === 'passed' ? 'Already Passed' : 'Pass' }}
              </button>
              
              <!-- Dynamic Like Button Based on Status -->
              <button 
                v-if="!team.interactionStatus || team.interactionStatus.type === 'received'"
                @click="likeTeam(team)"
                class="btn btn-primary flex-1"
              >
                <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {{ team.interactionStatus?.type === 'received' ? 'Respond' : 'Like' }}
              </button>
              
              <!-- Already Liked/Matched State -->
              <button 
                v-else-if="team.interactionStatus.type === 'pending'"
                class="btn flex-1 bg-blue-100 dark:bg-blue-700 text-blue-700 dark:text-blue-200 cursor-not-allowed"
                disabled
              >
                <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Request Pending
              </button>
              
              <!-- Matched State -->
              <button 
                v-else-if="team.interactionStatus.type === 'matched'"
                class="btn flex-1 bg-green-100 dark:bg-green-700 text-green-700 dark:text-green-200 cursor-not-allowed"
                disabled
              >
                <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Matched!
              </button>
              
              <!-- Declined State -->
              <button 
                v-else-if="team.interactionStatus.type === 'declined'"
                @click="likeTeam(team)"
                class="btn flex-1 bg-orange-100 dark:bg-orange-700 text-orange-700 dark:text-orange-200"
              >
                <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Try Again
              </button>
              
              <!-- Default fallback -->
              <button 
                v-else
                @click="likeTeam(team)"
                class="btn btn-primary flex-1"
              >
                <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Like
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Match Request Modal -->
    <div v-if="showMatchModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 pb-20 md:pb-4">
      <div class="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full max-h-[calc(100vh-6rem)] md:max-h-[calc(100vh-2rem)] overflow-y-auto">
        <div class="p-6">
          <div class="text-center mb-6">
            <div class="w-16 h-16 bg-gradient-to-br from-pink-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">It's a Match! 🎉</h3>
            <p class="text-gray-600 dark:text-gray-400">Send a match request to <strong>{{ selectedTeam?.name }}</strong></p>
          </div>

          <form @submit.prevent="sendMatchRequest" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your Team</label>
              <select v-model="matchRequest.yourTeam" required class="input-field">
                <option value="">Select your team</option>
                <option v-for="team in yourTeams" :key="team.id" :value="team.id">
                  {{ team.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preferred Dates</label>
              <div v-if="availableDatesLoading" class="flex items-center justify-center py-8">
                <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                <span class="ml-2 text-sm text-gray-600 dark:text-gray-400">Loading available dates...</span>
              </div>
              <div v-else>
                <!-- No dates available -->
                <div v-if="combinedAvailableDates.length === 0" class="text-center py-6">
                  <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <svg class="w-8 h-8 mx-auto mb-2 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p class="text-sm text-yellow-800 dark:text-yellow-200 font-medium">No mutual availability found</p>
                    <p class="text-xs text-yellow-600 dark:text-yellow-400 mt-1">Consider messaging the team about custom availability</p>
                  </div>
                </div>
                
                <!-- Available dates with detailed info -->
                <div v-else class="space-y-3 max-h-48 overflow-y-auto">
                  <div 
                    v-for="dateInfo in combinedAvailableDates" 
                    :key="dateInfo.date"
                    @click="toggleDateSelection(dateInfo)"
                    class="cursor-pointer border-2 rounded-lg p-3 transition-all hover:shadow-md"
                    :class="{
                      'border-primary-500 bg-primary-50 dark:bg-primary-900/20': isDateSelected(`${dateInfo.date}|${dateInfo.formatted}`),
                      'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600': !isDateSelected(`${dateInfo.date}|${dateInfo.formatted}`)
                    }"
                  >
                    <!-- Date header -->
                    <div class="flex items-center justify-between mb-2">
                      <div class="flex items-center space-x-2">
                        <div 
                          class="w-4 h-4 rounded border-2 flex items-center justify-center"
                          :class="{
                            'border-primary-500 bg-primary-500': isDateSelected(`${dateInfo.date}|${dateInfo.formatted}`),
                            'border-gray-300 dark:border-gray-600': !isDateSelected(`${dateInfo.date}|${dateInfo.formatted}`)
                          }"
                        >
                          <svg v-if="isDateSelected(`${dateInfo.date}|${dateInfo.formatted}`)" class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                          </svg>
                        </div>
                        <span class="font-semibold text-gray-900 dark:text-gray-100">{{ dateInfo.formatted }}</span>
                      </div>
                      <span class="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                        {{ dateInfo.teams.length }} team{{ dateInfo.teams.length > 1 ? 's' : '' }}
                      </span>
                    </div>
                    
                    <!-- Team availability details -->
                    <div class="space-y-2">
                      <div 
                        v-for="teamAvail in dateInfo.teams" 
                        :key="`${teamAvail.team_id}-${teamAvail.type}`"
                        class="flex items-center justify-between text-sm"
                      >
                        <div class="flex items-center space-x-2">
                          <div 
                            class="w-3 h-3 rounded-full"
                            :class="getAvailabilityTypeClass(teamAvail.type)"
                          ></div>
                          <span class="font-medium text-gray-900 dark:text-gray-100">{{ teamAvail.team_name }}</span>
                          <span 
                            class="px-2 py-1 rounded-full text-xs font-medium"
                            :class="{
                              'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': teamAvail.type === 'available',
                              'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200': teamAvail.type === 'travel'
                            }"
                          >
                            {{ teamAvail.type === 'available' ? '🏠 Can Host' : '✈️ Can Travel' }}
                          </span>
                        </div>
                        <div class="text-gray-500 dark:text-gray-400 text-xs">
                          {{ teamAvail.all_day ? 'All day' : (teamAvail.time ? formatTime(teamAvail.time) : 'All day') }}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Selected count -->
                  <div v-if="matchRequest.preferredDates.length > 0" class="text-center pt-2">
                    <p class="text-sm text-primary-600 dark:text-primary-400">
                      {{ matchRequest.preferredDates.length }} date{{ matchRequest.preferredDates.length > 1 ? 's' : '' }} selected
                    </p>
                  </div>
                  
                  <!-- Helper text -->
                  <p class="text-xs text-gray-500 dark:text-gray-400 text-center">
                    Select multiple dates to increase your chances of finding a match
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message</label>
              <textarea
                v-model="matchRequest.message"
                rows="3"
                class="input-field"
                placeholder="Tell them why you'd like to play..."
              ></textarea>
            </div>

            <div class="flex space-x-3 pt-4 pb-4">
              <button 
                type="button"
                @click="closeMatchModal"
                class="btn btn-secondary flex-1"
              >
                Skip
              </button>
              <button 
                type="submit"
                class="btn btn-primary flex-1"
                :disabled="sending"
              >
                <svg v-if="sending" class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ sending ? 'Sending...' : 'Send Request' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch, onActivated } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import { useTeamStore } from '../stores/teams.js'
import { useNotificationStore } from '../stores/notifications.js'
import { supabase } from '../config/supabase.js'
import { onBeforeRouteUpdate } from 'vue-router'

const authStore = useAuthStore()
const teamStore = useTeamStore()
const notificationStore = useNotificationStore()

// State
const loading = ref(true)
const teams = ref([])
const yourTeams = ref([])
const showFilters = ref(false)
const showMatchModal = ref(false)
const selectedTeam = ref(null)
const sending = ref(false)
const availableDatesLoading = ref(false)
const combinedAvailableDates = ref([])

// New state for tracking interactions
const matchRequests = ref([]) // All match requests (sent and received)
const passedTeams = ref(new Set()) // Teams that have been passed (stored in localStorage)

// Get sports from team store
const availableSports = computed(() => teamStore.sports.map(sport => sport.name))

// Filters
const filters = ref({
  sport: '',
  skillLevel: '',
  distance: '',
  availability: '',
  ageGroup: '',
  showInteracted: true // New filter to show/hide already interacted teams
})

// Match request
const matchRequest = ref({
  yourTeam: '',
  targetTeam: null,
  preferredDates: [], // Changed to array for multiple selections
  message: ''
})

// Watch for when both teams are selected to load combined availability
watch(() => [matchRequest.value.yourTeam, selectedTeam.value], async ([yourTeamId, targetTeam]) => {
  if (yourTeamId && targetTeam && showMatchModal.value) {
    await loadCombinedAvailability(targetTeam.id, yourTeamId)
  }
}, { immediate: false })

// New method to load match requests
const loadMatchRequests = async () => {
  try {
    const result = await teamStore.getMatchRequests('all')
    if (result.error) throw result.error
    matchRequests.value = result.data || []
  } catch (error) {
    console.error('Error loading match requests:', error)
  }
}

// New method to load passed teams from localStorage
const loadPassedTeams = () => {
  try {
    const saved = localStorage.getItem(`passedTeams_${authStore.user?.id}`)
    if (saved) {
      passedTeams.value = new Set(JSON.parse(saved))
    }
  } catch (error) {
    console.error('Error loading passed teams:', error)
    passedTeams.value = new Set()
  }
}

// New method to save passed teams to localStorage
const savePassedTeams = () => {
  try {
    localStorage.setItem(
      `passedTeams_${authStore.user?.id}`, 
      JSON.stringify([...passedTeams.value])
    )
  } catch (error) {
    console.error('Error saving passed teams:', error)
  }
}

// New method to get team interaction status
const getTeamStatus = (team) => {
  const userTeamIds = yourTeams.value.map(t => t.id)
  
  // Check if team was passed
  if (passedTeams.value.has(team.id)) {
    return { type: 'passed', label: 'Passed', icon: '👋', color: 'gray' }
  }
  
  // Check match requests
  const sentRequest = matchRequests.value.find(req => 
    userTeamIds.includes(req.requesting_team_id) && req.target_team_id === team.id
  )
  
  const receivedRequest = matchRequests.value.find(req => 
    req.requesting_team_id === team.id && userTeamIds.includes(req.target_team_id)
  )
  
  if (sentRequest) {
    switch (sentRequest.status) {
      case 'pending':
        return { type: 'pending', label: 'Request Sent', icon: '⏳', color: 'blue' }
      case 'accepted':
        return { type: 'matched', label: 'Matched!', icon: '🎉', color: 'green' }
      case 'declined':
        return { type: 'declined', label: 'Declined', icon: '❌', color: 'red' }
      default:
        return { type: 'pending', label: 'Request Sent', icon: '⏳', color: 'blue' }
    }
  }
  
  if (receivedRequest) {
    switch (receivedRequest.status) {
      case 'pending':
        return { type: 'received', label: 'Request Received', icon: '📨', color: 'purple' }
      case 'accepted':
        return { type: 'matched', label: 'Matched!', icon: '🎉', color: 'green' }
      case 'declined':
        return { type: 'declined', label: 'You Declined', icon: '❌', color: 'red' }
      default:
        return { type: 'received', label: 'Request Received', icon: '📨', color: 'purple' }
    }
  }
  
  return null // No interaction yet
}

// Helper function to get interaction status class
const getInteractionStatusClass = (color) => {
  const classes = {
    'gray': 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    'blue': 'bg-blue-200 text-blue-800 dark:bg-blue-700 dark:text-blue-200',
    'purple': 'bg-purple-200 text-purple-800 dark:bg-purple-700 dark:text-purple-200',
    'green': 'bg-green-200 text-green-800 dark:bg-green-700 dark:text-green-200',
    'red': 'bg-red-200 text-red-800 dark:bg-red-700 dark:text-red-200'
  }
  return classes[color] || 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
}

// Methods
const loadTeams = async () => {
  try {
    loading.value = true
    
    // Get user's team sports to ensure only same sport matches
    const userTeamSports = yourTeams.value.map(team => team.sport_id).filter(Boolean)
    
    const result = await teamStore.searchTeams(filters.value, userTeamSports)
    
    if (result.error) throw result.error
    
    // Process teams and load their availability data
    const teamsWithAvailability = await Promise.all(
      result.data.map(async (team) => {
        // Get upcoming availability for this team
        const availabilityResult = await teamStore.getFutureAvailableDates(team.id, 10)
        const upcomingAvailability = availabilityResult.data || []
        
        // Determine hosting capabilities based on actual availability
        const availableSlots = upcomingAvailability.filter(slot => slot.type === 'available')
        const travelSlots = upcomingAvailability.filter(slot => slot.type === 'travel')
        
        return {
          ...team,
          sport_name: team.sport?.name || 'Unknown',
          skill_level: team.skill_level,
          // Use real availability data from database
          upcoming_availability: upcomingAvailability,
          // Determine capabilities based on actual availability and venue
          can_host: team.home_venue && availableSlots.length > 0,
          can_travel: travelSlots.length > 0,
          // Calculate match reasons against the user's teams
          matchReasons: getMatchReasonsForTeam(team, yourTeams.value),
          // Add interaction status
          interactionStatus: getTeamStatus(team)
        }
      })
    )
    
    teams.value = teamsWithAvailability
    
    // Filter out already interacted teams if the filter is off
    if (!filters.value.showInteracted) {
      teams.value = teams.value.filter(team => !team.interactionStatus)
    }
    
  } catch (error) {
    console.error('Error loading teams:', error)
    notificationStore.error('Loading Error', 'Failed to load teams. Please try again.')
  } finally {
    loading.value = false
  }
}

const loadYourTeams = async () => {
  try {
    await teamStore.loadUserTeams()
    yourTeams.value = teamStore.activeTeams
  } catch (error) {
    console.error('Error loading your teams:', error)
    notificationStore.error('Loading Error', 'Failed to load your teams.')
  }
}

const passTeam = (team) => {
  if (!team) return
  
  // Add to passed teams
  passedTeams.value.add(team.id)
  savePassedTeams()
  
  // Update the team's status immediately
  team.interactionStatus = getTeamStatus(team)
  
  notificationStore.success('Team Passed', `You have passed on ${team.name}.`)
}

const likeTeam = (team) => {
  if (!team) return
  
  selectedTeam.value = team
  showMatchModal.value = true
  
  // Reset availability data when opening modal
  combinedAvailableDates.value = []
}

// Helper function to check if a date is selected
const isDateSelected = (dateKey) => {
  return matchRequest.value.preferredDates.includes(dateKey)
}

// Helper function to toggle date selection
const toggleDateSelection = (dateInfo) => {
  const dateKey = `${dateInfo.date}|${dateInfo.formatted}`
  const index = matchRequest.value.preferredDates.indexOf(dateKey)
  
  if (index > -1) {
    // Remove if already selected
    matchRequest.value.preferredDates.splice(index, 1)
  } else {
    // Add if not selected
    matchRequest.value.preferredDates.push(dateKey)
  }
}

// Helper function to get availability type class for color coding
const getAvailabilityTypeClass = (type) => {
  const classes = {
    'available': 'bg-green-500',
    'travel': 'bg-blue-500',
    'unavailable': 'bg-red-500'
  }
  return classes[type] || 'bg-gray-400'
}

// Helper function to get availability type icon
const getAvailabilityTypeIcon = (type) => {
  const icons = {
    'available': '🏠',
    'travel': '✈️'
  }
  return icons[type] || '❓'
}

// Helper function to format time from database TIME format
const formatTime = (timeString) => {
  if (!timeString) return null
  
  // Handle database TIME format (HH:MM:SS or HH:MM)
  const [hours, minutes] = timeString.split(':')
  const hour = parseInt(hours)
  const minute = parseInt(minutes)
  
  const date = new Date()
  date.setHours(hour, minute, 0, 0)
  
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  })
}

// Update the closeMatchModal function
const closeMatchModal = () => {
  showMatchModal.value = false
  selectedTeam.value = null
  matchRequest.value = {
    yourTeam: '',
    targetTeam: null,
    preferredDates: [], // Reset to empty array
    message: ''
  }
}

// Update the sendMatchRequest function to handle array of dates
const sendMatchRequest = async () => {
  try {
    sending.value = true
    
    // Convert selected dates array to a formatted string
    const selectedDatesString = matchRequest.value.preferredDates
      .map(dateKey => dateKey.split('|')[1]) // Extract formatted date from key
      .join(', ')
    
    const result = await teamStore.sendMatchRequest({
      requestingTeamId: matchRequest.value.yourTeam,
      targetTeamId: selectedTeam.value.id,
      preferredDates: selectedDatesString || 'Open to discussion',
      message: matchRequest.value.message
    })
    
    if (result.error) throw result.error
    
    // Reload match requests to update status
    await loadMatchRequests()
    
    // Update the team's interaction status in the current list
    const teamToUpdate = teams.value.find(t => t.id === selectedTeam.value.id)
    if (teamToUpdate) {
      teamToUpdate.interactionStatus = getTeamStatus(teamToUpdate)
    }
    
    closeMatchModal()
    notificationStore.success(
      'Match Request Sent! 🎉', 
      `Your request has been sent to ${selectedTeam.value.name}. They'll receive your message and get back to you soon!`
    )
  } catch (error) {
    console.error('Error sending match request:', error)
    notificationStore.error(
      'Failed to Send Request',
      'There was an issue sending your match request. Please try again.'
    )
  } finally {
    sending.value = false
  }
}

const resetAndReload = async () => {
  // Reload all data including match requests
  await Promise.all([
    loadMatchRequests(),
    loadTeams()
  ])
  
  notificationStore.info('Starting Fresh', 'Loading new teams for you to discover!')
}

// New method to clear passed teams
const clearPassedTeams = () => {
  const count = passedTeams.value.size
  passedTeams.value.clear()
  savePassedTeams()
  notificationStore.success('Passed Teams Cleared', `You have cleared ${count} passed teams.`)
  loadTeams() // Reload teams to reflect the change
}

const getSkillLevelClass = (level) => {
  const classes = {
    'Beginner': 'status-beginner',
    'Intermediate': 'status-intermediate',
    'Advanced': 'status-advanced',
    'Elite': 'status-elite'
  }
  return classes[level] || 'status-beginner'
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

// Function to load combined availability when modal opens
const loadCombinedAvailability = async (targetTeamId, yourTeamId) => {
  try {
    availableDatesLoading.value = true
    combinedAvailableDates.value = []
    
    const teamIds = [targetTeamId, yourTeamId]
    const result = await teamStore.getCombinedAvailability(teamIds)
    
    if (result.error) throw result.error
    
    combinedAvailableDates.value = result.data || []
  } catch (error) {
    console.error('Error loading combined availability:', error)
    notificationStore.error('Loading Error', 'Failed to load availability data.')
  } finally {
    availableDatesLoading.value = false
  }
}

// Function to calculate match reasons for a team
const getMatchReasonsForTeam = (team, userTeams) => {
  if (!userTeams.length) return []
  
  // Find the best matching user team (same sport, closest skill level, etc.)
  const bestMatch = userTeams.find(userTeam => userTeam.sport_id === team.sport_id) || userTeams[0]
  
  if (!bestMatch) return []
  
  // Use the store's calculateMatchReasons function
  return teamStore.calculateMatchReasons(bestMatch, team)
}

// Handle image load errors
const onImageError = (event) => {
  // Hide the broken image to show the fallback div
  event.target.style.display = 'none'
}

// Add method to refresh all interaction data
const refreshInteractionData = async () => {
  await loadMatchRequests()
  // Update team statuses after loading fresh match requests
  teams.value.forEach(team => {
    team.interactionStatus = getTeamStatus(team)
  })
}

// Refresh data when component becomes active (user switches back to tab)
onActivated(async () => {
  await refreshInteractionData()
})

// Refresh data when navigating to this route
onBeforeRouteUpdate(async (to, from, next) => {
  await refreshInteractionData()
  next()
})

// Add window focus listener to refresh when returning to the window
const handleWindowFocus = async () => {
  await refreshInteractionData()
}

// Add visibility change listener to refresh when tab becomes active
const handleVisibilityChange = async () => {
  if (!document.hidden) {
    await refreshInteractionData()
  }
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    loadYourTeams(),
    loadMatchRequests(),
    loadTeams()
  ])
  
  // Load passed teams from localStorage
  loadPassedTeams()
  
  // Add event listeners
  document.addEventListener('visibilitychange', handleVisibilityChange)
  window.addEventListener('focus', handleWindowFocus)
})

// Cleanup listener when component unmounts
onUnmounted(() => {
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  window.removeEventListener('focus', handleWindowFocus)
})
</script>

<style scoped>
.input-field {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-700 dark:text-gray-200;
}

.btn {
  @apply px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2;
}

.btn-primary {
  @apply bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500 dark:bg-primary-500 dark:hover:bg-primary-600 dark:focus:ring-primary-400;
}

.btn-secondary {
  @apply bg-gray-200 hover:bg-gray-300 text-gray-900 focus:ring-gray-500 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-gray-200 dark:focus:ring-slate-500;
}

.status-badge {
  @apply px-3 py-1 text-sm rounded-full font-medium;
}

.status-available {
  @apply bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200;
}

.status-travel {
  @apply bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200;
}

.status-beginner {
  @apply bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200;
}

.status-intermediate {
  @apply bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200;
}

.status-advanced {
  @apply bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200;
}

.status-elite {
  @apply bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200;
}

.status-interaction-badge {
  @apply flex items-center px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm shadow-lg border;
}

.team-card {
  @apply transition-all duration-300 hover:shadow-2xl hover:scale-[1.02];
}

.glass {
  @apply backdrop-blur-sm bg-white/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700;
}

.fade-in {
  animation: fadeIn 0.5s ease-out;
}

.slide-up {
  animation: slideUp 0.5s ease-out;
}

.bounce-in {
  animation: bounceIn 0.6s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes bounceIn {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style> 