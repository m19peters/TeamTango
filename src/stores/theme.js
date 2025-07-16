import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(false)
  
  // Initialize theme from localStorage or system preference
  const initializeTheme = () => {
    const savedTheme = localStorage.getItem('theme')
    
    if (savedTheme) {
      isDark.value = savedTheme === 'dark'
    } else {
      // Check system preference
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
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
  
  // Toggle theme
  const toggleTheme = () => {
    isDark.value = !isDark.value
    updateTheme()
  }
  
  // Set specific theme
  const setTheme = (theme) => {
    isDark.value = theme === 'dark'
    updateTheme()
  }
  
  // Watch for theme changes
  watch(isDark, updateTheme)
  
  return {
    isDark,
    initializeTheme,
    toggleTheme,
    setTheme
  }
}) 