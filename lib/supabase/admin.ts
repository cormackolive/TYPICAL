import { createClient } from "@supabase/supabase-js";

/**
 * Uses the service_role key, which bypasses row-level security.
 * Server-only — never import this from a Client Component.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
