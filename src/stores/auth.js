import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase, onAuthStateChange } from '../config/supabase.js'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const session = ref(null)
  const loading = ref(true)

  // Getters
  const isAuthenticated = computed(() => !!user.value)
  const userEmail = computed(() => user.value?.email)

  // Actions
  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { data, error }
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      user.value = null
      session.value = null
    }
    return { error }
  }

  const initialize = () => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        user.value = session.user
        session.value = session
      }
      loading.value = false
    })

    // Listen for auth changes
    onAuthStateChange((event, session) => {
      if (session) {
        user.value = session.user
        session.value = session
      } else {
        user.value = null
        session.value = null
      }
      loading.value = false
    })
  }

  return {
    user,
    session,
    loading,
    isAuthenticated,
    userEmail,
    signUp,
    signIn,
    signOut,
    initialize
  }
}) 