"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requirePlannerOfBeheerder } from "@/lib/auth";
import type { EigendomsType, Eigenaar } from "@/lib/types";

/**
 * Elke koppeling truck<->klant loopt via truck_toewijzingen (zie
 * 0001_init.sql) — ook voor verkocht/onderhoud, waar 'm in de praktijk maar
 * 1 keer verandert. Dat houdt de historie overal consistent, i.p.v. alleen
 * voor verhuur een aparte weg te hebben.
 */
export async function maakTruck(formData: FormData) {
  await requirePlannerOfBeheerder();

  const serienummer = String(formData.get("serienummer") ?? "").trim();
  const merk = String(formData.get("merk") ?? "").trim() || null;
  const model = String(formData.get("model") ?? "").trim() || null;
  const categorie = String(formData.get("categorie") ?? "").trim() || null;
  const eigendomstype = String(formData.get("eigendomstype") ?? "") as EigendomsType;
  const klantId = String(formData.get("klantId") ?? "").trim() || null;
  const tarief = formData.get("tarief") ? Number(formData.get("tarief")) : null;
  const contractReferentie = String(formData.get("contractReferentie") ?? "").trim() || null;

  if (!serienummer) throw new Error("Serienummer is verplicht");
  if (!["verkocht", "onderhoud", "verhuur"].includes(eigendomstype)) {
    throw new Error("Kies een geldig eigendomstype");
  }
  if (eigendomstype !== "verhuur" && !klantId) {
    throw new Error("Verkocht/onderhoud vereist een klant");
  }

  const eigenaar: Eigenaar = eigendomstype === "verhuur" ? "beekmans" : "klant";
  const supabase = await createClient();

  const { data: truck, error } = await supabase
    .from("trucks")
    .insert({
      serienummer,
      merk,
      model,
      categorie,
      eigendomstype,
      eigenaar,
      huidige_klant_id: klantId,
      status: klantId ? "bij_klant" : "beschikbaar",
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  if (klantId) {
    const { error: toewijzingError } = await supabase.from("truck_toewijzingen").insert({
      truck_id: truck.id,
      klant_id: klantId,
      tarief: eigendomstype === "verhuur" ? tarief : null,
      contract_referentie: contractReferentie,
    });
    if (toewijzingError) throw new Error(toewijzingError.message);
  }

  revalidatePath("/vloot");
}

export async function wijsToe(truckId: string, klantId: string, tarief: number | null, contractReferentie: string | null) {
  await requirePlannerOfBeheerder();
  const supabase = await createClient();

  const { error: beeindigError } = await supabase
    .from("truck_toewijzingen")
    .update({ tot: new Date().toISOString().slice(0, 10) })
    .eq("truck_id", truckId)
    .is("tot", null);
  if (beeindigError) throw new Error(beeindigError.message);

  const { error: toewijzingError } = await supabase.from("truck_toewijzingen").insert({
    truck_id: truckId,
    klant_id: klantId,
    tarief,
    contract_referentie: contractReferentie,
  });
  if (toewijzingError) throw new Error(toewijzingError.message);

  const { error: truckError } = await supabase
    .from("trucks")
    .update({ huidige_klant_id: klantId, status: "bij_klant" })
    .eq("id", truckId);
  if (truckError) throw new Error(truckError.message);

  revalidatePath("/vloot");
}

export async function beeindigToewijzing(truckId: string) {
  await requirePlannerOfBeheerder();
  const supabase = await createClient();

  const { error: beeindigError } = await supabase
    .from("truck_toewijzingen")
    .update({ tot: new Date().toISOString().slice(0, 10) })
    .eq("truck_id", truckId)
    .is("tot", null);
  if (beeindigError) throw new Error(beeindigError.message);

  const { error: truckError } = await supabase
    .from("trucks")
    .update({ huidige_klant_id: null, status: "beschikbaar" })
    .eq("id", truckId);
  if (truckError) throw new Error(truckError.message);

  revalidatePath("/vloot");
}
