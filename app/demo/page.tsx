import type { Metadata } from "next";
import { DemoPortaal } from "./demo-portaal";

export const metadata: Metadata = {
  title: "Demo · Beekmans Portaal",
  description: "Statische demo van het Beekmans-portaal met voorbeelddata.",
};

/**
 * Losse demo-pagina met statische voorbeelddata, niet gekoppeld aan Supabase.
 * Hier naartoe verhuisd vanuit R'EMS (/leverancier-portal). Staat in
 * PUBLIC_PATHS (lib/supabase/middleware.ts), zodat de demo zonder login te
 * bekijken is.
 */
export default function DemoPage() {
  return <DemoPortaal />;
}
