import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requirePlannerOfBeheerder } from "@/lib/auth";
import { EigendomBadge, TruckStatusBadge, UrgentieBadge, MeldingStatusBadge } from "@/components/status-badge";
import { formatteerDatumTijd } from "@/lib/datum";
import type { Truck, Melding } from "@/lib/types";

export default async function KlantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePlannerOfBeheerder();
  const { id } = await params;
  const supabase = await createClient();

  const { data: klant } = await supabase.from("klanten").select("*").eq("id", id).maybeSingle();
  if (!klant) notFound();

  const { data: trucks } = await supabase
    .from("trucks")
    .select("*")
    .eq("huidige_klant_id", id)
    .returns<Truck[]>();
  const { data: meldingen } = await supabase
    .from("meldingen")
    .select("*")
    .eq("klant_id", id)
    .order("gemeld_op", { ascending: false })
    .limit(20)
    .returns<Melding[]>();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      <Link href="/klanten" className="text-sm text-slate-500 hover:underline dark:text-slate-400">
        ← Klanten
      </Link>
      <div className="glass rounded-2xl p-5">
        <h1 className="text-xl font-semibold">{klant.naam}</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          {klant.contactpersoon ?? "—"} {klant.email ? `· ${klant.email}` : ""} {klant.telefoon ? `· ${klant.telefoon}` : ""}
        </p>
      </div>

      <section>
        <h2 className="mb-2 font-medium">Trucks bij deze klant ({(trucks ?? []).length})</h2>
        <div className="flex flex-col gap-2">
          {(trucks ?? []).map((t) => (
            <div key={t.id} className="glass flex items-center justify-between rounded-xl px-4 py-2.5 text-sm">
              <span>
                {t.merk} {t.model} <span className="text-slate-400">· {t.serienummer}</span>
              </span>
              <span className="flex gap-1.5">
                <EigendomBadge type={t.eigendomstype} />
                <TruckStatusBadge status={t.status} />
              </span>
            </div>
          ))}
          {(trucks ?? []).length === 0 && <p className="text-sm text-slate-500 dark:text-slate-400">Geen trucks.</p>}
        </div>
      </section>

      <section>
        <h2 className="mb-2 font-medium">Recente meldingen</h2>
        <div className="flex flex-col gap-2">
          {(meldingen ?? []).map((m) => (
            <div key={m.id} className="glass flex items-center justify-between gap-3 rounded-xl px-4 py-2.5 text-sm">
              <span className="min-w-0 flex-1 truncate">
                {m.asset_naam} <span className="text-slate-400">— {m.omschrijving}</span>
              </span>
              <span className="shrink-0 text-xs text-slate-400">{formatteerDatumTijd(m.gemeld_op)}</span>
              <span className="flex shrink-0 gap-1.5">
                <UrgentieBadge urgentie={m.urgentie} />
                <MeldingStatusBadge status={m.status} />
              </span>
            </div>
          ))}
          {(meldingen ?? []).length === 0 && <p className="text-sm text-slate-500 dark:text-slate-400">Geen meldingen.</p>}
        </div>
      </section>
    </div>
  );
}
