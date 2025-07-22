import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ggnbrnxptltxbuznheoy.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdnbmJybnhwdGx0eGJ1em5oZW95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MTM3NzEsImV4cCI6MjA2ODA4OTc3MX0.Uv7u8RJuE-itPM1Ek4Ml9TzaxOi7-q1JIEGqeX7uFzI'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface SurveyQuestion {
  id: number
  question_text: string
  question_type: 'text' | 'scale' | 'multiple_choice'
  options?: any
  is_required: boolean
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SurveyResponse {
  id: number
  session_id: string
  question_id: number
  response_text?: string
  response_data?: any
  submitted_at: string
  ip_address?: string
  user_agent?: string
}

export interface SurveySession {
  id: string
  started_at: string
  completed_at?: string
  total_questions: number
  completed_questions: number
  is_completed: boolean
}

export interface AdminUser {
  id: number
  username: string
  password: string
}