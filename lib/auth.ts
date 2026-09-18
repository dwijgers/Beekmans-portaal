import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isPlannerOfBeheerder } from "@/lib/roles";
import type { Gebruiker } from "@/lib/types";

export { isPlannerOfBeheerder };

/** Haalt de ingelogde Beekmans-medewerker + profiel op, of stuurt door naar /login. */
export async function requireUser(): Promise<Gebruiker> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profiel } = await supabase.from("gebruikers").select("*").eq("id", user.id).single();

  if (!profiel) redirect("/login");

  return profiel;
}

/** Zoals requireUser, maar stuurt monteurs terug naar /dashboard. */
export async function requirePlannerOfBeheerder(): Promise<Gebruiker> {
  const gebruiker = await requireUser();
  if (!isPlannerOfBeheerder(gebruiker.rol)) redirect("/dashboard");
  return gebruiker;
}

/** Zoals requireUser, maar alleen voor beheerder (bv. gebruikersbeheer). */
export async function requireBeheerder(): Promise<Gebruiker> {
  const gebruiker = await requireUser();
  if (gebruiker.rol !== "beheerder") redirect("/dashboard");
  return gebruiker;
}
