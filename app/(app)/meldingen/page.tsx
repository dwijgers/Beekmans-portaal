import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireUser, isPlannerOfBeheerder } from "@/lib/auth";
import { MeldingRow } from "./melding-row";
import { MELDING_STATUS_LABELS } from "@/components/status-badge";
import type { Melding, MeldingStatus } from "@/lib/types";

const TABS: { value: MeldingStatus | "alle"; label: string }[] = [
  { value: "alle", label: "Alle" },
  { value: "gemeld", label: MELDING_STATUS_LABELS.gemeld },
  { value: "in_behandeling", label: MELDING_STATUS_LABELS.in_behandeling },
  { value: "opgelost", label: MELDING_STATUS_LABELS.opgelost },
];

export default async function MeldingenPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const gebruiker = await requireUser();
  const magBeheer = isPlannerOfBeheerder(gebruiker.rol);
  const { status } = await searchParams;
  const filter = TABS.some((t) => t.value === status) ? (status as MeldingStatus | "alle") : "alle";

  const supabase = await createClient();
  let query = supabase.from("meldingen").select("*").order("gemeld_op", { ascending: false });
  if (filter !== "alle") query = query.eq("status", filter);
  const { data: meldingen } = await query.returns<Melding[]>();

  const { data: klanten } = await supabase.from("klanten").select("id, naam");
  const klantNaamPerId = new Map((klanten ?? []).map((k) => [k.id, k.naam]));

  const { data: gebruikers } = await supabase.from("gebruikers").select("id, naam");
  const gebruikerNaamPerId = new Map((gebruikers ?? []).map((g) => [g.id, g.naam]));

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <h1 className="text-xl font-semibold">Meldingen</h1>

      <div className="flex gap-2 rounded-md bg-slate-100 p-1 dark:bg-white/5">
        {TABS.map((tab) => (
          <Link
            key={tab.value}
            href={tab.value === "alle" ? "/meldingen" : `/meldingen?status=${tab.value}`}
            className={`flex-1 rounded px-3 py-1.5 text-center text-sm font-medium ${
              filter === tab.value ? "bg-white shadow-sm dark:bg-white/10" : "text-slate-500 dark:text-slate-400"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="flex flex-col gap-2.5">
        {(meldingen ?? []).map((m) => (
          <MeldingRow
            key={m.id}
            melding={m}
            klantNaam={klantNaamPerId.get(m.klant_id) ?? "Onbekende klant"}
            toegewezenNaam={m.toegewezen_aan ? gebruikerNaamPerId.get(m.toegewezen_aan) ?? null : null}
            magBijwerken={magBeheer || m.toegewezen_aan === gebruiker.id}
          />
        ))}
        {(meldingen ?? []).length === 0 && (
          <p className="glass rounded-2xl px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Geen meldingen.
          </p>
        )}
      </div>
    </div>
  );
}
