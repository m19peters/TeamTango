<template>
  <div class="min-h-screen bg-gray-50 dark:bg-slate-900 pb-20 md:pb-0">
    <!-- Header -->
    <div class="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 md:mt-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
          <div class="flex items-center space-x-4">
            <div>
              <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">My Teams</h1>
              <p class="text-gray-600 dark:text-gray-300">Manage your teams and track interactions</p>
            </div>
            
            <!-- Dark Mode Toggle -->
            <button 
              @click="themeStore.toggleTheme"
              class="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              :title="themeStore.isDark ? 'Switch to light mode' : 'Switch to dark mode'"
            >
              <svg v-if="!themeStore.isDark" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
              <svg v-else class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </button>
          </div>
          
          <div class="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <!-- Show Inactive Toggle -->
            <div class="flex items-center space-x-2">
              <label class="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  v-model="showInactiveToggle" 
                  @change="toggleInactiveTeams"
                  class="sr-only peer"
                >
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
              <span class="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Show Inactive
              </span>
            </div>
            
            <button 
              @click="showCreateModal = true"
              class="btn btn-primary shrink-0 w-full sm:w-auto justify-center"
            >
              + Add Team
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Teams List -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div v-if="formattedTeams.length === 0" class="text-center py-12">
        <svg class="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 515.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No teams yet</h3>
        <p class="text-gray-600 dark:text-gray-300 mb-6">Create your first team to start finding matches</p>
        <button 
          @click="showCreateModal = true"
          class="btn btn-primary"
        >
          Create Your First Team
        </button>
      </div>

      <div v-else class="space-y-6">
        <div 
          v-for="team in formattedTeams" 
          :key="team.id"
          class="card"
          :class="{ 'opacity-60 border-gray-300 dark:border-gray-600': team.active === false }"
        >
          <div class="flex flex-col lg:flex-row lg:items-start justify-between space-y-4 lg:space-y-0">
            <div class="flex-1">
              <div class="flex items-center mb-3">
                <!-- Team Logo -->
                <div class="w-10 h-10 mr-3 shrink-0">
                  <img 
                    v-if="team.logo_url" 
                    :src="team.logo_url" 
                    :alt="`${team.name} logo`"
                    class="w-full h-full rounded-full object-cover border border-gray-200 dark:border-gray-600"
                    @error="$event.target.style.display = 'none'"
                  />
                  <div 
                    v-else
                    class="w-full h-full bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-sm font-bold"
                  >
                    {{ team.name.charAt(0).toUpperCase() }}
                  </div>
                </div>
                
                <div class="flex-1">
                  <div class="flex items-center space-x-2 mb-1">
                    <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">{{ team.name }}</h3>
                    <span 
                      v-if="team.active === false"
                      class="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    >
                      Inactive
                    </span>
                    <span 
                      v-else
                      :class="[
                        'px-2 py-1 text-xs rounded-full',
                        team.status === 'Active' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      ]"
                    >
                      {{ team.status }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div>
                  <span class="font-medium text-gray-500 dark:text-gray-400">Sport:</span>
                  <span class="ml-1 text-gray-900 dark:text-gray-100">{{ team.sport }}</span>
                </div>
                <div>
                  <span class="font-medium text-gray-500 dark:text-gray-400">Age Group:</span>
                  <span class="ml-1 text-gray-900 dark:text-gray-100">{{ team.age_group }}</span>
                </div>
                <div>
                  <span class="font-medium text-gray-500 dark:text-gray-400">Skill Level:</span>
                  <span class="ml-1 text-gray-900 dark:text-gray-100">{{ team.skillLevel }}</span>
                </div>
                <div>
                  <span class="font-medium text-gray-500 dark:text-gray-400">Location:</span>
                  <span class="ml-1 text-gray-900 dark:text-gray-100">{{ team.city }}, {{ team.state }}</span>
                </div>
                <div>
                  <span class="font-medium text-gray-500 dark:text-gray-400">Home Venue:</span>
                  <span class="ml-1 text-gray-900 dark:text-gray-100">{{ team.homeVenue }}</span>
                </div>
                <div>
                  <span class="font-medium text-gray-500 dark:text-gray-400">Contact:</span>
                  <span class="ml-1 text-gray-900 dark:text-gray-100">{{ team.phone }}</span>
                </div>
                <div>
                  <span class="font-medium text-gray-500 dark:text-gray-400">Matches:</span>
                  <span class="ml-1 text-gray-900 dark:text-gray-100">{{ team.totalMatches || 0 }}</span>
                </div>
              </div>

              <div v-if="team.description" class="mt-3">
                <span class="font-medium text-gray-500 dark:text-gray-400">Description:</span>
                <p class="text-gray-900 dark:text-gray-100 mt-1">{{ team.description }}</p>
              </div>
            </div>

            <div class="flex flex-wrap gap-2 lg:ml-4 shrink-0 justify-start lg:justify-end">
              <button 
                v-if="team.active !== false"
                @click="discoverForTeam(team)"
                class="btn btn-primary text-sm px-3 py-1"
              >
                <svg class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Discover
              </button>
              <button 
                @click="editTeam(team)"
                class="btn btn-secondary text-sm px-3 py-1"
              >
                Edit
              </button>
              <button 
                v-if="team.active !== false"
                @click="confirmMarkInactive(team)"
                class="btn text-sm px-3 py-1 bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900 dark:text-orange-200 dark:hover:bg-orange-800"
              >
                Mark Inactive
              </button>
              <button 
                v-else
                @click="activateTeam(team)"
                class="btn text-sm px-3 py-1 bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800"
              >
                Activate
              </button>
            </div>
          </div>

          <!-- Dashboard Tiles for this Team -->
          <div v-if="getDashboardData(team) && team.active !== false" class="border-t border-gray-200 dark:border-slate-700 p-6">
            <h4 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Team Activity
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <!-- Dislikes Tile -->
              <div 
                @click="openDislikedModal(team)" 
                class="dashboard-tile cursor-pointer group"
                :class="getDashboardData(team).hasNewDislikes ? 'dashboard-tile-new' : ''"
              >
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center space-x-2">
                    <div class="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                      <svg class="w-4 h-4 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.106-1.79l-.05-.025A4 4 0 0011.057 2H5.641a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
                      </svg>
                    </div>
                    <span class="text-sm font-medium text-gray-900 dark:text-gray-100">Disliked</span>
                  </div>
                  <div v-if="getDashboardData(team).hasNewDislikes" class="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                </div>
                <div class="text-2xl font-bold text-red-600 dark:text-red-400 mb-1">{{ getDashboardData(team).dislikedCount }}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">Teams disliked</div>
              </div>

              <!-- Likes Tile -->
              <div 
                @click="openLikedModal(team)" 
                class="dashboard-tile cursor-pointer group"
                :class="getDashboardData(team).hasNewLikes ? 'dashboard-tile-new' : ''"
              >
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center space-x-2">
                    <div class="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                      <svg class="w-4 h-4 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                      </svg>
                    </div>
                    <span class="text-sm font-medium text-gray-900 dark:text-gray-100">Likes</span>
                  </div>
                  <div v-if="getDashboardData(team).hasNewLikes" class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <div class="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">{{ getDashboardData(team).likesCount }}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">Mutual interest</div>
              </div>

              <!-- Messages Tile -->
              <div 
                @click="openRequestsModal(team)" 
                class="dashboard-tile cursor-pointer group"
                :class="getDashboardData(team).hasNewRequests ? 'dashboard-tile-new' : ''"
              >
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center space-x-2">
                    <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.962 8.962 0 01-4.5-1.207L3 21l2.207-5.5A8.962 8.962 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                      </svg>
                    </div>
                    <span class="text-sm font-medium text-gray-900 dark:text-gray-100">Messages</span>
                  </div>
                  <div v-if="getDashboardData(team).hasNewRequests" class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                </div>
                <div class="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">{{ getDashboardData(team).requestsCount }}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">Active conversations</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Team Modal -->
    <div v-if="showCreateModal || editingTeam" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4">
      <div class="bg-white dark:bg-slate-800 rounded-lg max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl">
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">
              {{ editingTeam ? 'Edit Team' : 'Create New Team' }}
            </h3>
            <button 
              @click="closeModal"
              class="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            >
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form @submit.prevent="saveTeam" class="space-y-6">
            <!-- Team Logo Section -->
            <div class="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Team Logo</label>
              
              <!-- Current Logo Display -->
              <div class="flex items-center space-x-4 mb-4">
                <div class="w-16 h-16 relative">
                  <img 
                    v-if="currentLogoUrl && !logoToRemove" 
                    :src="currentLogoUrl" 
                    :alt="`${teamForm.name || 'Team'} logo`"
                    class="w-full h-full rounded-full object-cover border-2 border-primary-200 dark:border-primary-700 shadow-lg"
                    @error="onLogoError"
                  />
                  <div 
                    v-else-if="logoPreview && !logoToRemove"
                    class="w-full h-full rounded-full overflow-hidden border-2 border-primary-200 dark:border-primary-700 shadow-lg"
                  >
                    <img 
                      :src="logoPreview" 
                      :alt="'New logo preview'"
                      class="w-full h-full object-cover"
                    />
                  </div>
                  <div 
                    v-else
                    class="w-full h-full bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg"
                  >
                    {{ (teamForm.name || 'T').charAt(0).toUpperCase() }}
                  </div>
                </div>
                
                <div class="flex-1">
                  <div class="flex space-x-2">
                    <label class="btn btn-secondary cursor-pointer text-sm">
                      <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {{ currentLogoUrl ? 'Change Logo' : 'Upload Logo' }}
                      <input 
                        ref="logoInput"
                        type="file" 
                        class="hidden" 
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        @change="onLogoSelected"
                      />
                    </label>
                    
                    <button 
                      v-if="currentLogoUrl || logoPreview"
                      type="button"
                      @click="removeLogo"
                      class="btn text-sm bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800"
                    >
                      <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Remove
                    </button>
                  </div>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    JPEG, PNG, GIF, or WebP. Max 5MB.
                  </p>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Team Name</label>
                <input
                  v-model="teamForm.name"
                  type="text"
                  required
                  :class="[
                    'input-field',
                    validationErrors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                  ]"
                  placeholder="Lightning Bolts U12"
                  @blur="() => validateField('name', teamForm.name)"
                />
                <p v-if="validationErrors.name" class="mt-1 text-sm text-red-600">
                  {{ validationErrors.name }}
                </p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sport</label>
                <select 
                  v-model="teamForm.sport" 
                  required 
                  :class="[
                    'input-field',
                    validationErrors.sport ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                  ]"
                  @blur="() => validateField('sport', teamForm.sport)"
                >
                  <option value="">Select a sport</option>
                  <option v-for="sport in sports" :key="sport.id" :value="sport.name">{{ sport.name }}</option>
                </select>
                <p v-if="validationErrors.sport" class="mt-1 text-sm text-red-600">
                  {{ validationErrors.sport }}
                </p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Age Group</label>
                <select 
                  v-model="teamForm.ageGroup" 
                  required 
                  :class="[
                    'input-field',
                    validationErrors.ageGroup ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                  ]"
                  @blur="() => validateField('ageGroup', teamForm.ageGroup)"
                >
                  <option value="">Select age group</option>
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
                <p v-if="validationErrors.ageGroup" class="mt-1 text-sm text-red-600">
                  {{ validationErrors.ageGroup }}
                </p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Skill Level</label>
                <select 
                  v-model="teamForm.skillLevel" 
                  required 
                  :class="[
                    'input-field',
                    validationErrors.skillLevel ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                  ]"
                  @blur="() => validateField('skillLevel', teamForm.skillLevel)"
                >
                  <option value="">Select skill level</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Elite">Elite</option>
                </select>
                <p v-if="validationErrors.skillLevel" class="mt-1 text-sm text-red-600">
                  {{ validationErrors.skillLevel }}
                </p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                <input
                  v-model="teamForm.phone"
                  type="tel"
                  required
                  :class="[
                    'input-field',
                    validationErrors.phone ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                  ]"
                  placeholder="(555) 123-4567"
                  @input="(e) => {
                    teamForm.phone = formatPhoneNumber(e.target.value)
                    if (isValidating) validateField('phone', teamForm.phone)
                  }"
                  @blur="() => validateField('phone', teamForm.phone)"
                />
                <p v-if="validationErrors.phone" class="mt-1 text-sm text-red-600">
                  {{ validationErrors.phone }}
                </p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">City</label>
                <input
                  v-model="teamForm.city"
                  type="text"
                  required
                  :class="[
                    'input-field',
                    validationErrors.city ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                  ]"
                  placeholder="Denver"
                  @input="() => {
                    if (isValidating) validateField('city', teamForm.city)
                  }"
                  @blur="() => validateField('city', teamForm.city)"
                />
                <p v-if="validationErrors.city" class="mt-1 text-sm text-red-600">
                  {{ validationErrors.city }}
                </p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">State/Province</label>
                <input
                  v-model="teamForm.state"
                  type="text"
                  required
                  :class="[
                    'input-field',
                    validationErrors.state ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                  ]"
                  placeholder="CO or Colorado"
                  @input="() => {
                    if (isValidating) validateField('state', teamForm.state)
                  }"
                  @blur="() => validateField('state', teamForm.state)"
                />
                <p v-if="validationErrors.state" class="mt-1 text-sm text-red-600">
                  {{ validationErrors.state }}
                </p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ZIP Code</label>
                <input
                  v-model="teamForm.zip"
                  type="text"
                  required
                  :class="[
                    'input-field',
                    validationErrors.zip ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                  ]"
                  placeholder="80202"
                  @blur="() => validateField('zip', teamForm.zip)"
                />
                <p v-if="validationErrors.zip" class="mt-1 text-sm text-red-600">
                  {{ validationErrors.zip }}
                </p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Home Venue</label>
                <input
                  v-model="teamForm.homeVenue"
                  type="text"
                  required
                  :class="[
                    'input-field',
                    validationErrors.homeVenue ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                  ]"
                  placeholder="Denver Sports Complex"
                  @blur="() => validateField('homeVenue', teamForm.homeVenue)"
                />
                <p v-if="validationErrors.homeVenue" class="mt-1 text-sm text-red-600">
                  {{ validationErrors.homeVenue }}
                </p>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Home Venue Address</label>
              <textarea
                v-model="teamForm.venueAddress"
                rows="3"
                class="input-field"
                placeholder="123 Sports Drive, Denver, CO 80202"
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Team Description (Optional)</label>
              <textarea
                v-model="teamForm.description"
                rows="3"
                class="input-field"
                placeholder="Tell other teams about your team..."
              ></textarea>
            </div>

            <div class="flex space-x-3 pt-6 pb-4">
              <button 
                type="button"
                @click="closeModal"
                class="btn btn-secondary flex-1"
              >
                Cancel
              </button>
              <button 
                type="submit"
                :disabled="loading"
                class="btn btn-primary flex-1"
              >
                {{ loading ? 'Saving...' : (editingTeam ? 'Update Team' : 'Create Team') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Mark Inactive Confirmation Modal -->
    <div v-if="teamToMarkInactive" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4">
      <div class="bg-white dark:bg-slate-800 rounded-lg max-w-md w-full p-6">
        <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Mark Team as Inactive</h3>
        <p class="text-gray-600 dark:text-gray-300 mb-6">
          Are you sure you want to mark "{{ teamToMarkInactive.name }}" as inactive? The team will no longer appear in searches, but can be reactivated later from the "Show Inactive" section.
        </p>
        <div class="flex space-x-3">
          <button 
            @click="teamToMarkInactive = null"
            class="btn btn-secondary flex-1"
          >
            Cancel
          </button>
          <button 
            @click="markTeamInactive"
            class="btn flex-1 bg-orange-600 text-white hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-800"
          >
            Mark as Inactive
          </button>
        </div>
      </div>
    </div>



    <!-- Dashboard Modals -->
    <!-- Disliked Teams Modal -->
    <div v-if="dashboardStore.showDislikedModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4">
      <div class="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div class="p-6 border-b border-gray-200 dark:border-slate-700">
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
              <svg class="w-5 h-5 mr-2 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.106-1.79l-.05-.025A4 4 0 0011.057 2H5.641a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
              </svg>
              Disliked Teams
            </h3>
            <button @click="dashboardStore.closeAllModals" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div class="p-6 max-h-[60vh] overflow-y-auto">
          <div v-if="dashboardStore.dislikedTeams.length === 0" class="text-center py-8">
            <svg class="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-gray-600 dark:text-gray-400">No disliked teams yet</p>
          </div>
          
          <div v-else class="space-y-3">
            <div 
              v-for="item in dashboardStore.dislikedTeams" 
              :key="`${item.interaction.id}`"
              class="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-lg"
            >
              <div class="flex-1">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                    <span class="text-sm font-bold text-red-600 dark:text-red-400">
                      {{ item.targetTeam.name.charAt(0).toUpperCase() }}
                    </span>
                  </div>
                  <div class="flex-1">
                    <div class="font-medium text-gray-900 dark:text-gray-100">{{ item.targetTeam.name }}</div>
                    <div class="text-sm text-gray-600 dark:text-gray-400">
                      {{ item.targetTeam.sport.name }} • {{ item.targetTeam.skill_level }} • {{ item.targetTeam.city }}, {{ item.targetTeam.state }}
                    </div>
                  </div>
                </div>
              </div>
              <button 
                @click="removeDislike(item)"
                class="btn btn-sm bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400"
              >
                <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Liked Teams Modal -->
    <div v-if="dashboardStore.showLikedModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4">
      <div class="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div class="p-6 border-b border-gray-200 dark:border-slate-700">
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
              <svg class="w-5 h-5 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
              </svg>
              Liked Teams
            </h3>
            <button @click="dashboardStore.closeAllModals" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div class="p-6 max-h-[60vh] overflow-y-auto">
          <div v-if="dashboardStore.likedTeams.length === 0" class="text-center py-8">
            <svg class="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <p class="text-gray-600 dark:text-gray-400">No liked teams yet</p>
          </div>
          
          <div v-else class="space-y-3">
            <div 
              v-for="item in dashboardStore.likedTeams" 
              :key="`${item.interaction.id}-${item.direction}`"
              class="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-lg"
            >
              <div class="flex-1">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <span class="text-sm font-bold text-green-600 dark:text-green-400">
                      {{ item.targetTeam.name.charAt(0).toUpperCase() }}
                    </span>
                  </div>
                  <div class="flex-1">
                    <div class="flex items-center space-x-2">
                      <span class="font-medium text-gray-900 dark:text-gray-100">{{ item.targetTeam.name }}</span>
                      <span v-if="item.direction === 'incoming'" class="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded-full">
                        Liked You
                      </span>
                      <span v-else class="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded-full">
                        You Liked
                      </span>
                    </div>
                    <div class="text-sm text-gray-600 dark:text-gray-400">
                      {{ item.targetTeam.sport.name }} • {{ item.targetTeam.skill_level }} • {{ item.targetTeam.city }}, {{ item.targetTeam.state }}
                    </div>
                  </div>
                </div>
              </div>
              <button 
                @click="toggleLike(item)"
                class="btn btn-sm"
                :class="item.direction === 'incoming' 
                  ? 'bg-green-100 hover:bg-green-200 text-green-700 dark:bg-green-900/30 dark:hover:bg-green-900/50 dark:text-green-400' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300'"
              >
                <svg v-if="item.direction === 'incoming'" class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                </svg>
                <svg v-else class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                {{ item.direction === 'incoming' ? 'Like Back' : 'Unlike' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Messages Modal (Shows Messages Page) -->
    <div v-if="dashboardStore.showRequestsModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4">
      <div class="bg-white dark:bg-slate-800 rounded-2xl max-w-7xl w-full h-[95vh] flex flex-col overflow-hidden">
        <div class="flex-shrink-0 p-6 border-b border-gray-200 dark:border-slate-700">
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
              <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.962 8.962 0 01-4.5-1.207L3 21l2.207-5.5A8.962 8.962 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
              </svg>
              Team Messages
            </h3>
            <button @click="dashboardStore.closeAllModals" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <!-- Embedded Messages View -->
        <div class="flex-1 overflow-hidden bg-gray-50 dark:bg-slate-900">
                      <MessageView :is-modal="true" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useTeamStore } from '../stores/teams.js'
import { useNotificationStore } from '../stores/notifications.js'
import { useThemeStore } from '../stores/theme.js'
import { useDashboardStore } from '../stores/dashboard.js'
import { useInteractionsStore } from '../stores/interactions.js'
import { useMessagesStore } from '../stores/messages.js'
import { useViewingAsTeamStore } from '../stores/viewingAsTeam.js'
import { useRouter } from 'vue-router'
import MessageView from './MessageView.vue'

const teamStore = useTeamStore()
const notificationStore = useNotificationStore()
const themeStore = useThemeStore()
const dashboardStore = useDashboardStore()
const interactionsStore = useInteractionsStore()
const messagesStore = useMessagesStore()
const viewingAsTeamStore = useViewingAsTeamStore()
const router = useRouter()

const showCreateModal = ref(false)
const editingTeam = ref(null)
const teamToMarkInactive = ref(null)

// Show inactive toggle
const showInactiveToggle = ref(false)
const inactiveTeams = ref([])
const loadingInactive = ref(false)

// Logo handling
const logoInput = ref(null)
const selectedLogo = ref(null)
const logoPreview = ref(null)
const currentLogoUrl = ref(null)
const logoToRemove = ref(false)

// Use storeToRefs to maintain reactivity
const { loading, teams, sports } = storeToRefs(teamStore)

// Computed to format team data for display
const formattedTeams = computed(() => {
  let allTeams = [...teams.value]
  
  // Include inactive teams if toggle is on
  if (showInactiveToggle.value) {
    allTeams = [...allTeams, ...inactiveTeams.value]
  }
  
  return allTeams.map(team => ({
    ...team,
    sport: team.sport?.name || 'Unknown',
    totalMatches: team.totalMatches || 0,
    skillLevel: team.skill_level,
    homeVenue: team.home_venue,
    venueAddress: team.venue_address,
    // Explicitly preserve age_group field
    age_group: team.age_group
  }))
})

const teamForm = reactive({
  name: '',
  sport: '',
  ageGroup: '',
  skillLevel: '',
  phone: '',
  city: '',
  state: '',
  zip: '',
  homeVenue: '',
  venueAddress: '',
  description: '',
  logo: null
})

// Validation state
const validationErrors = ref({})
const isValidating = ref(false)

// Phone number formatting
const formatPhoneNumber = (value) => {
  // Remove all non-digits
  const digits = value.replace(/\D/g, '')
  
  // Apply formatting based on length
  if (digits.length >= 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
  } else if (digits.length >= 6) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  } else if (digits.length >= 3) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  } else {
    return digits
  }
}

// Validation functions
const validatePhoneNumber = (phone) => {
  const digits = phone.replace(/\D/g, '')
  const phoneRegex = /^\d{10}$/
  
  if (!phone.trim()) {
    return 'Phone number is required'
  }
  
  if (!phoneRegex.test(digits)) {
    return 'Please enter a valid 10-digit phone number'
  }
  
  return null
}

const validateCity = (city) => {
  if (!city.trim()) {
    return 'City is required'
  }
  
  if (city.trim().length < 2) {
    return 'City must be at least 2 characters'
  }
  
  // Check for valid characters (letters, spaces, hyphens, apostrophes)
  const cityRegex = /^[a-zA-Z\s\-']+$/
  if (!cityRegex.test(city.trim())) {
    return 'City can only contain letters, spaces, hyphens, and apostrophes'
  }
  
  return null
}

const validateState = (state) => {
  if (!state.trim()) {
    return 'State/Province is required'
  }
  
  const trimmedState = state.trim()
  
  // Check for 2-letter state codes (US/CA style) or longer province names
  if (trimmedState.length < 2) {
    return 'State/Province must be at least 2 characters'
  }
  
  // Allow both state codes (like "CO", "CA") and full names (like "Colorado", "Ontario")
  const stateRegex = /^[a-zA-Z\s\-']+$/
  if (!stateRegex.test(trimmedState)) {
    return 'State/Province can only contain letters, spaces, hyphens, and apostrophes'
  }
  
  return null
}

const validateField = (fieldName, value) => {
  let error = null
  
  switch (fieldName) {
    case 'phone':
      error = validatePhoneNumber(value)
      break
    case 'city':
      error = validateCity(value)
      break
    case 'state':
      error = validateState(value)
      break
    default:
      if (!value.trim()) {
        error = `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`
      }
      break
  }
  
  if (error) {
    validationErrors.value[fieldName] = error
  } else {
    delete validationErrors.value[fieldName]
  }
  
  return !error
}

const validateForm = () => {
  isValidating.value = true
  validationErrors.value = {}
  
  let isValid = true
  
  // Required fields validation
  const requiredFields = ['name', 'sport', 'ageGroup', 'skillLevel', 'phone', 'city', 'state', 'zip', 'homeVenue']
  
  requiredFields.forEach(field => {
    if (!validateField(field, teamForm[field])) {
      isValid = false
    }
  })
  
  return isValid
}

const resetForm = () => {
  Object.keys(teamForm).forEach(key => {
    teamForm[key] = key === 'logo' ? null : ''
  })
  
  // Reset logo state
  selectedLogo.value = null
  logoPreview.value = null
  currentLogoUrl.value = null
  logoToRemove.value = false
  
  // Reset validation state
  validationErrors.value = {}
  isValidating.value = false
  
  // Clear file input
  if (logoInput.value) {
    logoInput.value.value = ''
  }
}

// Logo handling functions
const onLogoSelected = (event) => {
  const file = event.target.files[0]
  if (!file) return

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    notificationStore.error('Invalid File Type', 'Please upload a JPEG, PNG, GIF, or WebP image.')
    event.target.value = ''
    return
  }

  // Validate file size (5MB)
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    notificationStore.error('File Too Large', 'Logo must be less than 5MB.')
    event.target.value = ''
    return
  }

  selectedLogo.value = file
  teamForm.logo = file
  logoToRemove.value = false

  // Create preview
  const reader = new FileReader()
  reader.onload = (e) => {
    logoPreview.value = e.target.result
  }
  reader.readAsDataURL(file)
}

const removeLogo = () => {
  selectedLogo.value = null
  logoPreview.value = null
  logoToRemove.value = true
  teamForm.logo = null
  teamForm.deleteLogo = true
  
  // Clear file input
  if (logoInput.value) {
    logoInput.value.value = ''
  }
}

const onLogoError = (event) => {
  // Hide broken image and show fallback
  event.target.style.display = 'none'
  currentLogoUrl.value = null
}

const closeModal = () => {
  showCreateModal.value = false
  editingTeam.value = null
  resetForm()
}

const editTeam = (team) => {
  editingTeam.value = team
  
  // Debug: Log the team data to see what we're getting
  console.log('Editing team:', team)
  console.log('Team age_group:', team.age_group)
  
  // Map database fields to form fields
  Object.assign(teamForm, {
    name: team.name || '',
    sport: team.sport?.name || team.sport || '',
    ageGroup: team.age_group || '',
    skillLevel: team.skill_level || '',
    phone: formatPhoneNumber(team.phone || ''), // Format phone number when editing
    city: team.city || '',
    state: team.state || '',
    zip: team.zip || '',
    homeVenue: team.home_venue || '',
    venueAddress: team.venue_address || '',
    description: team.description || '',
    logo: null // Reset logo form field
  })
  
  // Clear any existing validation errors
  validationErrors.value = {}
  isValidating.value = false
  
  // Set current logo URL for display
  currentLogoUrl.value = team.logo_url || null
  logoPreview.value = null
  selectedLogo.value = null
  logoToRemove.value = false
  
  // Clear file input
  if (logoInput.value) {
    logoInput.value.value = ''
  }
  
  // Debug: Log the form data after assignment
  console.log('Form after assignment:', { ...teamForm })
}

const confirmMarkInactive = (team) => {
  teamToMarkInactive.value = team
}

const discoverForTeam = (team) => {
  // Set the viewing team and navigate to discovery
  viewingAsTeamStore.setViewingAsTeam(team.id)
  router.push('/discovery')
}

const saveTeam = async () => {
  // Validate form before saving
  if (!validateForm()) {
    notificationStore.error('Validation Error', 'Please fix the errors below before saving.')
    return
  }

  try {
    if (editingTeam.value) {
      // Update existing team
      const result = await teamStore.updateTeam(editingTeam.value.id, teamForm)
      if (result.error) {
        throw new Error(result.error.message)
      }
      notificationStore.success('Team Updated', 'Your team has been successfully updated.')
    } else {
      // Create new team
      const result = await teamStore.createTeam(teamForm)
      if (result.error) {
        throw new Error(result.error.message)
      }
      notificationStore.success('Team Created', 'Your team has been successfully created.')
    }
    
    closeModal()
    // Force refresh teams after creation/update
    await teamStore.loadUserTeams()
  } catch (error) {
    console.error('Error saving team:', error)
    notificationStore.error('Save Failed', error.message)
  }
}

const markTeamInactive = async () => {
  if (!teamToMarkInactive.value) return
  
  try {
    const result = await teamStore.deleteTeam(teamToMarkInactive.value.id)
    if (result.error) {
      throw new Error(result.error.message)
    }
    teamToMarkInactive.value = null
    // Force refresh teams after marking as inactive
    await teamStore.loadUserTeams()
    
    // If showing inactive teams, refresh the inactive teams list
    if (showInactiveToggle.value) {
      await loadInactiveTeams()
    }
  } catch (error) {
    console.error('Error marking team as inactive:', error)
    notificationStore.error('Mark Inactive Failed', error.message)
  }
}

const loadTeams = async () => {
  try {
    await teamStore.loadUserTeams()
  } catch (error) {
    console.error('Error loading teams:', error)
    notificationStore.error('Loading Failed', 'Failed to load teams')
  }
}

// Toggle inactive teams functionality
const toggleInactiveTeams = async () => {
  if (showInactiveToggle.value && inactiveTeams.value.length === 0) {
    // Load inactive teams when toggle is turned on for the first time
    await loadInactiveTeams()
  }
}

const loadInactiveTeams = async () => {
  loadingInactive.value = true
  try {
    const result = await teamStore.loadInactiveTeams()
    if (result.data) {
      inactiveTeams.value = result.data
    }
  } catch (error) {
    console.error('Error loading inactive teams:', error)
    notificationStore.error('Loading Failed', 'Failed to load inactive teams')
  } finally {
    loadingInactive.value = false
  }
}

const activateTeam = async (team) => {
  try {
    const result = await teamStore.reactivateTeam(team.id)
    if (!result.error) {
      // Remove from inactive list
      inactiveTeams.value = inactiveTeams.value.filter(t => t.id !== team.id)
      // Refresh active teams
      await loadTeams()
      notificationStore.success('Team Activated', `${team.name} has been reactivated.`)
    }
  } catch (error) {
    console.error('Error activating team:', error)
    notificationStore.error('Activation Failed', 'Failed to activate team')
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Dashboard functionality
// Get dashboard data for a specific team
const getDashboardData = (team) => {
  const dashboardData = dashboardStore.dashboardData.find(data => data.team.id === team.id)
  return dashboardData || null
}

// Modal actions
const openDislikedModal = (team) => {
  viewingAsTeamStore.setViewingAsTeam(team.id)
  dashboardStore.openDislikedModal()
}

const openLikedModal = (team) => {
  viewingAsTeamStore.setViewingAsTeam(team.id)
  dashboardStore.openLikedModal()
}

const openRequestsModal = (team) => {
  viewingAsTeamStore.setViewingAsTeam(team.id)
  dashboardStore.openRequestsModal()
}

// Team interaction actions
const removeDislike = async (item) => {
  try {
    await dashboardStore.removeDislike(item.interaction.user_team_id, item.interaction.target_team_id)
    notificationStore.success('Removed', `No longer disliking ${item.targetTeam.name}`)
  } catch (error) {
    notificationStore.error('Failed', 'Could not remove dislike')
  }
}

const toggleLike = async (item) => {
  try {
    if (item.direction === 'incoming') {
      // Like back
      await dashboardStore.toggleLike(item.userTeam.id, item.targetTeam.id, 'incoming')
      notificationStore.success('Liked Back! 💕', `You liked ${item.targetTeam.name} back`)
    } else {
      // Unlike
      await dashboardStore.toggleLike(item.userTeam.id, item.targetTeam.id, 'outgoing')
      notificationStore.success('Unliked', `No longer liking ${item.targetTeam.name}`)
    }
  } catch (error) {
    notificationStore.error('Failed', 'Could not update like status')
  }
}

onMounted(async () => {
  await loadTeams()
  // Initialize dashboard
  dashboardStore.initialize()
})
</script>

<style scoped>
.card {
  @apply bg-white dark:bg-slate-800 rounded-lg shadow border border-gray-200 dark:border-slate-700 p-6;
}

/* Dashboard Styles */
.dashboard-tile {
  @apply p-4 bg-gray-50 dark:bg-slate-700 rounded-lg border-2 border-transparent transition-all duration-200 hover:bg-gray-100 dark:hover:bg-slate-600 hover:border-gray-200 dark:hover:border-slate-600;
}

.dashboard-tile-new {
  @apply border-yellow-300 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20;
  box-shadow: 0 0 0 1px rgba(251, 191, 36, 0.1);
}

.dashboard-tile-new:hover {
  @apply border-yellow-400 dark:border-yellow-500 bg-yellow-100 dark:bg-yellow-900/30;
}


</style> 