<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <!-- Logo -->
      <div class="flex justify-center">
        <div class="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center">
          <svg class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
          </svg>
        </div>
      </div>
      
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        {{ isSignUp ? 'Create your account' : 'Sign in to TeamTango' }}
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        {{ isSignUp ? 'Join the sports community' : 'Welcome back!' }}
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <!-- Alert Messages -->
        <div v-if="errorMessage" class="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          <span class="block sm:inline">{{ errorMessage }}</span>
        </div>

        <div v-if="successMessage" class="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative">
          <span class="block sm:inline">{{ successMessage }}</span>
        </div>

        <!-- Auth Form -->
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <div class="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                v-model="form.email"
                autocomplete="email"
                required
                class="input-field"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div class="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                v-model="form.password"
                autocomplete="current-password"
                required
                class="input-field"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div v-if="isSignUp">
            <label for="confirm-password" class="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <div class="mt-1">
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                v-model="form.confirmPassword"
                required
                class="input-field"
                placeholder="Confirm your password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              :disabled="loading"
              class="btn btn-primary w-full flex justify-center"
            >
              <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ loading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In') }}
            </button>
          </div>
        </form>

        <!-- Toggle Sign Up/Sign In -->
        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300" />
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">
                {{ isSignUp ? 'Already have an account?' : "Don't have an account?" }}
              </span>
            </div>
          </div>

          <div class="mt-6">
            <button
              @click="toggleMode"
              type="button"
              class="w-full text-center text-sm text-primary-600 hover:text-primary-500"
            >
              {{ isSignUp ? 'Sign in instead' : 'Create a new account' }}
            </button>
          </div>
        </div>

        <!-- Back to Home -->
        <div class="mt-6">
          <router-link 
            to="/"
            class="block text-center text-sm text-gray-500 hover:text-gray-700"
          >
            ← Back to home
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { useNotificationStore } from '../stores/notifications.js'

const router = useRouter()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const isSignUp = ref(false)
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const form = reactive({
  email: '',
  password: '',
  confirmPassword: ''
})

const toggleMode = () => {
  isSignUp.value = !isSignUp.value
  errorMessage.value = ''
  successMessage.value = ''
  form.email = ''
  form.password = ''
  form.confirmPassword = ''
}

const handleSubmit = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  if (isSignUp.value && form.password !== form.confirmPassword) {
    errorMessage.value = 'Passwords do not match'
    return
  }

  if (form.password.length < 6) {
    errorMessage.value = 'Password must be at least 6 characters long'
    return
  }

  loading.value = true

  try {
    let result
    
    if (isSignUp.value) {
      result = await authStore.signUp(form.email, form.password)
      if (!result.error) {
        successMessage.value = 'Account created! Please check your email to verify your account.'
        form.email = ''
        form.password = ''
        form.confirmPassword = ''
        // Switch to sign in mode after successful signup
        setTimeout(() => {
          isSignUp.value = false
          successMessage.value = ''
        }, 3000)
      }
    } else {
      result = await authStore.signIn(form.email, form.password)
      if (!result.error && result.data?.session) {
        // Show welcome notification
        notificationStore.success(
          'Welcome back! 🎉', 
          `Signed in as ${result.data.user.email}`
        )
        
        // Clear form
        form.email = ''
        form.password = ''
        
        // Redirect to dashboard
        router.push('/dashboard')
      }
    }

    if (result.error) {
      errorMessage.value = result.error.message
    }
  } catch (error) {
    errorMessage.value = 'An unexpected error occurred. Please try again.'
  } finally {
    loading.value = false
  }
}
</script> 