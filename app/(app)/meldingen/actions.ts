"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import type { MeldingStatus } from "@/lib/types";

export async function updateMeldingStatus(meldingId: string, status: MeldingStatus) {
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase
    .from("meldingen")
    .update({ status, opgelost_op: status === "opgelost" ? new Date().toISOString() : null })
    .eq("id", meldingId);
  if (error) throw new Error(error.message);
  revalidatePath("/meldingen");
  revalidatePath("/dashboard");
}

/** Een open melding aan jezelf toewijzen ("oppakken") — RLS staat dit alleen toe als 'm nog niemand had. */
export async function neemMeldingOp(meldingId: string) {
  const gebruiker = await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.from("meldingen").update({ toegewezen_aan: gebruiker.id }).eq("id", meldingId);
  if (error) throw new Error(error.message);
  revalidatePath("/meldingen");
}
