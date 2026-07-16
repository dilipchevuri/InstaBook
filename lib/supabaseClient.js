import { createClient } from "@supabase/supabase-js";

// Public client (safe for browser — read-only via RLS policies)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Server-only client with elevated access — NEVER import this in a page/component,
// only inside pages/api/* (server side).
export function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}
