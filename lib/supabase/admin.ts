import "server-only";
import { createClient } from "@supabase/supabase-js";

// The secret key bypasses row-level security. Server actions use it only to
// insert rounds, and only after getUser() has identified the user.
export function createAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
