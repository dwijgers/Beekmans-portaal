"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requirePlannerOfBeheerder } from "@/lib/auth";

/**
 * Maakt een onderhoudsfactuur voor een opgeloste melding, met één
 * factuurregel. klanten.factuur_modus bepaalt of 'm meteen als "verzonden"
 * geldt of eerst "ter_goedkeuring" blijft staan — zie 0001_init.sql.
 */
export async function maakOnderhoudsfactuur(formData: FormData) {
  await requirePlannerOfBeheerder();

  const meldingId = String(formData.get("meldingId") ?? "");
  const omschrijving = String(formData.get("omschrijving") ?? "").trim();
  const aantal = Number(formData.get("aantal") ?? 1);
  const tarief = Number(formData.get("tarief") ?? 0);
  if (!meldingId || !omschrijving || !tarief) throw new Error("Vul alle velden in");

  const supabase = await createClient();
  const { data: melding, error: meldingError } = await supabase
    .from("meldingen")
    .select("klant_id, klanten(factuur_modus)")
    .eq("id", meldingId)
    .single<{ klant_id: string; klanten: { factuur_modus: "automatisch" | "ter_goedkeuring" } | null }>();
  if (meldingError || !melding) throw new Error(meldingError?.message ?? "Melding niet gevonden");

  const automatisch = melding.klanten?.factuur_modus === "automatisch";
  const nu = new Date().toISOString();

  const { data: factuur, error } = await supabase
    .from("facturen")
    .insert({
      klant_id: melding.klant_id,
      type: "onderhoud",
      melding_id: meldingId,
      status: automatisch ? "verzonden" : "ter_goedkeuring",
      bedrag: aantal * tarief,
      verzonden_op: automatisch ? nu : null,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  const { error: regelError } = await supabase
    .from("factuurregels")
    .insert({ factuur_id: factuur.id, omschrijving, aantal, tarief });
  if (regelError) throw new Error(regelError.message);

  revalidatePath("/facturen");
}

export async function keurFactuurGoed(factuurId: string) {
  const gebruiker = await requirePlannerOfBeheerder();
  const supabase = await createClient();
  const nu = new Date().toISOString();
  const { error } = await supabase
    .from("facturen")
    .update({ status: "verzonden", goedgekeurd_door: gebruiker.id, goedgekeurd_op: nu, verzonden_op: nu })
    .eq("id", factuurId)
    .eq("status", "ter_goedkeuring");
  if (error) throw new Error(error.message);
  revalidatePath("/facturen");
}

export async function zetFactuurBetaald(factuurId: string) {
  await requirePlannerOfBeheerder();
  const supabase = await createClient();
  const { error } = await supabase.from("facturen").update({ status: "betaald" }).eq("id", factuurId).eq("status", "verzonden");
  if (error) throw new Error(error.message);
  revalidatePath("/facturen");
}
