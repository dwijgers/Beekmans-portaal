import { createClient } from "@/lib/supabase/server";
import { requirePlannerOfBeheerder } from "@/lib/auth";
import { FactuurForm } from "./factuur-form";
import { FactuurRow } from "./factuur-row";
import type { Factuur, Melding } from "@/lib/types";

export default async function FacturenPage() {
  await requirePlannerOfBeheerder();
  const supabase = await createClient();

  const { data: facturen } = await supabase
    .from("facturen")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<Factuur[]>();
  const { data: klanten } = await supabase.from("klanten").select("id, naam");
  const klantNaamPerId = new Map((klanten ?? []).map((k) => [k.id, k.naam]));

  const gefactureerdeMeldingIds = new Set((facturen ?? []).filter((f) => f.melding_id).map((f) => f.melding_id));
  const { data: opgelosteMeldingen } = await supabase
    .from("meldingen")
    .select("*")
    .eq("status", "opgelost")
    .order("opgelost_op", { ascending: false })
    .returns<Melding[]>();
  const meldingenZonderFactuur = (opgelosteMeldingen ?? [])
    .filter((m) => !gefactureerdeMeldingIds.has(m.id))
    .map((m) => ({
      id: m.id,
      label: `${m.asset_naam} — ${klantNaamPerId.get(m.klant_id) ?? "Onbekende klant"}`,
    }));

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <h1 className="text-xl font-semibold">Facturen</h1>

      <section className="glass rounded-2xl p-4">
        <h2 className="mb-3 font-medium">Nieuwe onderhoudsfactuur</h2>
        <FactuurForm meldingenZonderFactuur={meldingenZonderFactuur} />
      </section>

      <div className="flex flex-col gap-2.5">
        {(facturen ?? []).map((f) => (
          <FactuurRow key={f.id} factuur={f} klantNaam={klantNaamPerId.get(f.klant_id) ?? "Onbekende klant"} />
        ))}
        {(facturen ?? []).length === 0 && (
          <p className="glass rounded-2xl px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Nog geen facturen.
          </p>
        )}
      </div>
    </div>
  );
}
