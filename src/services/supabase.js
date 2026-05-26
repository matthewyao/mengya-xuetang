import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://YOUR_PROJECT.supabase.co'
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON || 'YOUR_ANON_KEY'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)

let currentUser = null

export async function signInAnonymously() {
  // 先检查现有 session
  const { data: { session } } = await supabase.auth.getSession()
  if (session) {
    currentUser = session.user
    return session.user
  }

  // 匿名登录
  const { data, error } = await supabase.auth.signInAnonymously()
  if (error) {
    console.error('匿名登录失败:', error)
    return null
  }
  currentUser = data.user
  return data.user
}

export function getCurrentUser() {
  return currentUser
}

export async function ensureAuth() {
  if (currentUser) return currentUser
  return await signInAnonymously()
}

// 监听登录状态变化
supabase.auth.onAuthStateChange((event, session) => {
  currentUser = session?.user || null
})
