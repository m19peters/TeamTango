import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { supabase } from '../config/supabase.js'
import { useAuthStore } from './auth.js'

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(false)
  const themePreference = ref('system') // 'light', 'dark', or 'system'
  
  // Initialize theme from database or localStorage fallback
  const initializeTheme = async () => {
    const authStore = useAuthStore()
    
    if (authStore.isAuthenticated && authStore.user) {
      try {
        // Try to load from database first
        const { data, error } = await supabase
          .from('user_profiles')
          .select('theme_preference')
          .eq('id', authStore.user.id)
          .single()
        
        if (!error && data?.theme_preference) {
          themePreference.value = data.theme_preference
          applyThemePreference()
          return
        }
      } catch (error) {
        console.warn('Failed to load theme from database:', error)
      }
    }
    
    // Fallback to localStorage or system preference
    const savedTheme = localStorage.getItem('theme')
    
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      themePreference.value = savedTheme
      isDark.value = savedTheme === 'dark'
    } else {
      themePreference.value = 'system'
      // Check system preference
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    
    updateTheme()
  }
  
  // Apply theme preference (handles system preference)
  const applyThemePreference = () => {
    if (themePreference.value === 'system') {
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    } else {
      isDark.value = themePreference.value === 'dark'
    }
    updateTheme()
  }
  
  // Update the document class and localStorage
  const updateTheme = () => {
    if (isDark.value) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }
  
  // Save theme preference to database
  const saveThemeToDatabase = async (theme) => {
    const authStore = useAuthStore()
    
    if (!authStore.isAuthenticated || !authStore.user) {
      return
    }
    
    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({ 
          id: authStore.user.id,
          email: authStore.user.email,
          theme_preference: theme 
        })
      
      if (error) {
        console.warn('Failed to save theme preference:', error)
      }
    } catch (error) {
      console.warn('Failed to save theme preference:', error)
    }
  }
  
  // Toggle theme (cycles through light -> dark -> light)
  const toggleTheme = async () => {
    const newTheme = isDark.value ? 'light' : 'dark'
    themePreference.value = newTheme
    isDark.value = newTheme === 'dark'
    updateTheme()
    await saveThemeToDatabase(newTheme)
  }
  
  // Set specific theme
  const setTheme = async (theme) => {
    themePreference.value = theme
    if (theme === 'system') {
      applyThemePreference()
    } else {
      isDark.value = theme === 'dark'
      updateTheme()
    }
    await saveThemeToDatabase(theme)
  }
  
  // Watch for theme changes
  watch(isDark, updateTheme)
  
  return {
    isDark,
    themePreference,
    initializeTheme,
    toggleTheme,
    setTheme,
    applyThemePreference
  }
}) 