import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types";

/**
 * Client met de service-role key: omzeilt RLS. Gebruikt voor gebruikersbeheer
 * via de Auth Admin API én voor de intake-route (/api/intake), die zelf de
 * klant-API-key/HMAC-signature controleert i.p.v. via een Supabase-sessie —
 * er is dus geen `authenticated`-rol om RLS op te laten meedraaien. Nooit
 * importeren vanuit een client component; SUPABASE_SERVICE_ROLE_KEY mag nooit
 * NEXT_PUBLIC_ zijn.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
