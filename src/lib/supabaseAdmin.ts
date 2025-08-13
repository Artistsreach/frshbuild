import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  // This check runs when the server starts, failing fast if configuration is missing.
  throw new Error("Supabase URL and Service Role Key must be defined in environment variables.");
}

// Create a new client instance with the service_role key.
// This client should only ever be used in a secure server-side environment.
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    // For a server-to-server client, we don't need to persist sessions or refresh tokens.
    autoRefreshToken: false,
    persistSession: false
  }
});
