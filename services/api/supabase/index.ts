import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

// Service-role client — full DB access, bypasses RLS. For trusted
// server-side operations only; never send this key to the client.
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

/**
 * Anon-key client scoped to a specific user's bearer token, used to
 * validate or act on behalf of a raw Supabase access token (OAuth flows).
 * Replaces the inline `createClient` calls that used to be duplicated in
 * middlewares/auth.mjs and controllers/user.controller.mjs.
 */
export function userClientFromToken(token) {
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

export default supabase
