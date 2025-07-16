import { createClient } from '@supabase/supabase-js'

// Your Supabase project details - using environment variables for deployment
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qnwdsbjbpckaobjnfyud.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFud2RzYmpicGNrYW9iam5meXVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2MjI2MzMsImV4cCI6MjA2ODE5ODYzM30.sxDbW_RoqTfG3vOl0vKMJo0O78Z6sSKChv7WQPrmsfI'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper function to handle auth state changes
export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange(callback)
}

// Helper function to get current user
export const getCurrentUser = () => {
  return supabase.auth.getUser()
}

// Helper function to sign out
export const signOut = () => {
  return supabase.auth.signOut()
} 