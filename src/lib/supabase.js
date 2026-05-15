import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key missing. Check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const callFunction = async (functionName, payload) => {
  const { data, error } = await supabase.functions.invoke(functionName, {
    body: payload,
  })
  if (error) throw error
  return data
}

export const callRPC = async (functionName, payload) => {
  const { data, error } = await supabase.rpc(functionName, payload)
  if (error) throw error
  return data
}
