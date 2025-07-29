<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 dark:from-primary-800 dark:via-primary-900 dark:to-slate-900 transition-colors duration-500">
    <!-- Hero Section -->
    <div class="flex flex-col items-center justify-center min-h-screen px-4 text-center text-white relative overflow-hidden">
      <!-- Background Pattern -->
      <div class="absolute inset-0 bg-pattern opacity-10"></div>
      
      <div class="max-w-lg mx-auto relative z-10 fade-in">
        <!-- Logo/Icon -->
        <div class="mb-8 slide-up">
          <div class="w-48 h-48 mx-auto bg-white/90 dark:bg-white rounded-3xl overflow-hidden shadow-2xl backdrop-blur-sm p-3">
            <img src="@/assets/team_tango_logo.png" alt="TeamTango Logo" class="w-full h-full object-contain">
          </div>
        </div>

        <!-- App Title and Description -->
        <p class="text-xl mb-8 opacity-90 leading-relaxed">
          Connect your youth sports teams with others for exciting matchups
        </p>
        <p class="text-lg mb-12 opacity-80 leading-relaxed">
          Find teams, schedule games, and build your sports community
        </p>

        <!-- Action Buttons -->
        <div class="space-y-4 slide-up">
          <router-link 
            to="/login" 
            class="block w-full bg-white text-primary-600 py-4 px-8 rounded-xl font-bold text-lg hover:bg-gray-50 hover:scale-105 active:scale-95 transition-all duration-200 shadow-xl hover:shadow-2xl"
          >
            Get Started
          </router-link>
          
          <div class="text-sm opacity-75 mt-8">
            <p class="font-medium mb-4">Perfect for youth sports:</p>
            <div class="flex flex-wrap justify-center gap-2">
              <span class="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm transition-all duration-200 cursor-default">🏒 Hockey</span>
              <span class="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm transition-all duration-200 cursor-default">⚾ Baseball</span>
              <span class="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm transition-all duration-200 cursor-default">🏀 Basketball</span>
              <span class="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm transition-all duration-200 cursor-default">🏈 Football</span>
              <span class="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm transition-all duration-200 cursor-default">⚽ Soccer</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Features Section -->
    <div class="bg-white dark:bg-slate-900 py-20 transition-colors duration-300">
      <div class="max-w-6xl mx-auto px-4">
        <h2 class="text-4xl font-bold text-center text-gray-900 dark:text-gray-100 mb-4 fade-in">How It Works</h2>
        <p class="text-center text-gray-600 dark:text-gray-400 mb-16 text-lg max-w-2xl mx-auto">
          Connect with other teams and schedule amazing games effortlessly
        </p>
        
        <div class="grid md:grid-cols-3 gap-8">
          <!-- Feature 1 -->
          <div class="text-center group">
            <div class="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <svg class="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">Create Your Team</h3>
            <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
              Register your team with details like skill level, location, and home venue
            </p>
          </div>

          <!-- Feature 2 -->
          <div class="text-center group">
            <div class="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <svg class="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">Find Matches</h3>
            <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
              Swipe through teams to find perfect opponents based on skill level and location
            </p>
          </div>

          <!-- Feature 3 -->
          <div class="text-center group">
            <div class="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <svg class="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">Schedule Games</h3>
            <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
              Manage your team's availability and coordinate match schedules easily
            </p>
          </div>
        </div>

        <!-- Call to Action -->
        <div class="text-center mt-16">
          <router-link 
            to="/login" 
            class="inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold rounded-xl transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            Start Finding Teams
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Simple landing page - no complex logic needed
</script>

<style scoped>
.text-gradient-white {
  background: linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.fade-in {
  animation: fadeIn 1s ease-out;
}

.slide-up {
  animation: slideUp 0.8s ease-out 0.2s both;
}

.bounce-in {
  animation: bounceIn 1s ease-out 0.4s both;
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
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1.0);
  }
}
</style> 