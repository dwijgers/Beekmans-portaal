"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requirePlannerOfBeheerder } from "@/lib/auth";
import type { FactuurModus } from "@/lib/types";

export async function maakKlant(formData: FormData) {
  await requirePlannerOfBeheerder();

  const naam = String(formData.get("naam") ?? "").trim();
  const contactpersoon = String(formData.get("contactpersoon") ?? "").trim() || null;
  const email = String(formData.get("email") ?? "").trim() || null;
  const telefoon = String(formData.get("telefoon") ?? "").trim() || null;
  const factuurModus = String(formData.get("factuurModus") ?? "ter_goedkeuring") as FactuurModus;

  if (!naam) throw new Error("Naam is verplicht");

  const supabase = await createClient();
  const { error } = await supabase
    .from("klanten")
    .insert({ naam, contactpersoon, email, telefoon, factuur_modus: factuurModus });
  if (error) throw new Error(error.message);

  revalidatePath("/klanten");
}

export async function updateFactuurModus(klantId: string, factuurModus: FactuurModus) {
  await requirePlannerOfBeheerder();
  const supabase = await createClient();
  const { error } = await supabase.from("klanten").update({ factuur_modus: factuurModus }).eq("id", klantId);
  if (error) throw new Error(error.message);
  revalidatePath("/klanten");
  revalidatePath(`/klanten/${klantId}`);
}

export async function zetKlantActief(klantId: string, actief: boolean) {
  await requirePlannerOfBeheerder();
  const supabase = await createClient();
  const { error } = await supabase.from("klanten").update({ actief }).eq("id", klantId);
  if (error) throw new Error(error.message);
  revalidatePath("/klanten");
  revalidatePath(`/klanten/${klantId}`);
}
