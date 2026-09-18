"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  MeldingStatusBadge,
  UrgentieBadge,
  MELDING_STATUS_LABELS,
  URGENTIE_LABELS,
} from "@/components/status-badge";
import { formatteerDatumTijd } from "@/lib/datum";
import type { MeldingStatus, Urgentie } from "@/lib/types";

export type DashboardMelding = {
  id: string;
  klantId: string;
  klantNaam: string;
  assetNaam: string;
  truckSerienummer: string | null;
  omschrijving: string | null;
  urgentie: Urgentie;
  status: MeldingStatus;
  gemeldDoor: string | null;
  gemeldOp: string;
  opgelostOp: string | null;
};

const STATUS_TABS: { value: MeldingStatus | "alle"; label: string }[] = [
  { value: "alle", label: "Alle" },
  { value: "gemeld", label: MELDING_STATUS_LABELS.gemeld },
  { value: "in_behandeling", label: MELDING_STATUS_LABELS.in_behandeling },
  { value: "opgelost", label: MELDING_STATUS_LABELS.opgelost },
];
const URGENTIE_OPTIES: (Urgentie | "alle")[] = ["alle", "kritiek", "hoog", "gemiddeld", "laag"];
const URGENTIE_RANG: Record<Urgentie, number> = { kritiek: 0, hoog: 1, gemiddeld: 2, laag: 3 };
const URGENTIE_BAR_KLEUR: Record<Urgentie, string> = {
  kritiek: "bg-red-500",
  hoog: "bg-orange-500",
  gemiddeld: "bg-amber-500",
  laag: "bg-slate-400 dark:bg-slate-500",
};

const MS_PER_DAG = 24 * 60 * 60 * 1000;
const MS_PER_WEEK = 7 * MS_PER_DAG;

function weekStart(datum: Date): Date {
  const d = new Date(datum);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
}
function weekLabel(datum: Date): string {
  return datum.toLocaleDateString("nl-NL", { day: "numeric", month: "short" });
}
function weekTrend(meldingen: DashboardMelding[], aantalWeken: number) {
  if (meldingen.length === 0) return [];
  const laatste = meldingen.reduce(
    (max, m) => (new Date(m.gemeldOp) > max ? new Date(m.gemeldOp) : max),
    new Date(meldingen[0].gemeldOp)
  );
  const laatsteWeek = weekStart(laatste).getTime();
  const buckets: { weekStart: number; aantal: number }[] = [];
  for (let i = aantalWeken - 1; i >= 0; i--) buckets.push({ weekStart: laatsteWeek - i * MS_PER_WEEK, aantal: 0 });
  for (const m of meldingen) {
    const w = weekStart(new Date(m.gemeldOp)).getTime();
    const bucket = buckets.find((b) => b.weekStart === w);
    if (bucket) bucket.aantal++;
  }
  return buckets;
}

export function MeldingenDashboard({
  meldingen: alle,
  klanten,
}: {
  meldingen: DashboardMelding[];
  klanten: { id: string; naam: string }[];
}) {
  const [klantFilter, setKlantFilter] = useState<string>("alle");
  const [statusFilter, setStatusFilter] = useState<MeldingStatus | "alle">("alle");
  const [urgentieFilter, setUrgentieFilter] = useState<Urgentie | "alle">("alle");
  const [zoekterm, setZoekterm] = useState("");
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const gescoped = useMemo(
    () => (klantFilter === "alle" ? alle : alle.filter((m) => m.klantId === klantFilter)),
    [alle, klantFilter]
  );

  const meldingen = useMemo(() => {
    const term = zoekterm.trim().toLowerCase();
    return gescoped
      .filter((m) => statusFilter === "alle" || m.status === statusFilter)
      .filter((m) => urgentieFilter === "alle" || m.urgentie === urgentieFilter)
      .filter(
        (m) =>
          term === "" ||
          m.assetNaam.toLowerCase().includes(term) ||
          m.klantNaam.toLowerCase().includes(term) ||
          (m.omschrijving ?? "").toLowerCase().includes(term)
      )
      .sort(
        (a, b) =>
          URGENTIE_RANG[a.urgentie] - URGENTIE_RANG[b.urgentie] ||
          new Date(b.gemeldOp).getTime() - new Date(a.gemeldOp).getTime()
      );
  }, [gescoped, statusFilter, urgentieFilter, zoekterm]);

  const tellingen = useMemo(() => {
    const base: Record<MeldingStatus, number> = { gemeld: 0, in_behandeling: 0, opgelost: 0 };
    for (const m of gescoped) base[m.status]++;
    return base;
  }, [gescoped]);

  const gemOplostijd = useMemo(() => {
    const opgelost = gescoped.filter((m) => m.status === "opgelost" && m.opgelostOp);
    if (opgelost.length === 0) return null;
    const totaal = opgelost.reduce(
      (som, m) => som + (new Date(m.opgelostOp!).getTime() - new Date(m.gemeldOp).getTime()) / MS_PER_DAG,
      0
    );
    return totaal / opgelost.length;
  }, [gescoped]);

  const urgentieVerdeling = useMemo(() => {
    const base: Record<Urgentie, number> = { kritiek: 0, hoog: 0, gemiddeld: 0, laag: 0 };
    for (const m of gescoped) base[m.urgentie]++;
    return base;
  }, [gescoped]);
  const totaal = gescoped.length;

  const trend = useMemo(() => weekTrend(gescoped, 8), [gescoped]);
  const trendMax = Math.max(1, ...trend.map((w) => w.aantal));

  const vraagtAandacht = useMemo(
    () =>
      gescoped
        .filter((m) => m.status !== "opgelost" && (m.urgentie === "kritiek" || m.urgentie === "hoog"))
        .sort(
          (a, b) =>
            URGENTIE_RANG[a.urgentie] - URGENTIE_RANG[b.urgentie] ||
            new Date(b.gemeldOp).getTime() - new Date(a.gemeldOp).getTime()
        ),
    [gescoped]
  );

  const gehoverd = hoverIdx !== null ? trend[hoverIdx] : trend[trend.length - 1];

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <select
          value={klantFilter}
          onChange={(e) => setKlantFilter(e.target.value)}
          className="ml-auto rounded-md border px-2 py-1.5 text-sm"
        >
          <option value="alle">Alle klanten ({klanten.length})</option>
          {klanten.map((k) => (
            <option key={k.id} value={k.id}>
              {k.naam}
            </option>
          ))}
        </select>
      </div>

      {vraagtAandacht.length > 0 && (
        <div className="glass flex flex-col gap-2 rounded-2xl border border-red-400/30 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-red-700 dark:text-red-300">
            Vraagt nu aandacht ({vraagtAandacht.length})
          </p>
          <div className="flex flex-col gap-1.5">
            {vraagtAandacht.slice(0, 8).map((m) => (
              <Link
                key={m.id}
                href={`/meldingen?highlight=${m.id}`}
                className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition hover:bg-black/5 dark:hover:bg-white/5"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {m.assetNaam} <span className="font-normal text-slate-400">· {m.klantNaam}</span>
                  </span>
                  <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                    {m.omschrijving}
                  </span>
                </span>
                <UrgentieBadge urgentie={m.urgentie} />
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTegel label="Gemeld" waarde={tellingen.gemeld} accent="text-slate-700 dark:text-slate-200" />
        <StatTegel label="In behandeling" waarde={tellingen.in_behandeling} accent="text-blue-700 dark:text-blue-300" />
        <StatTegel label="Opgelost" waarde={tellingen.opgelost} accent="text-emerald-700 dark:text-emerald-300" />
        <StatTegel
          label="Gem. oplostijd"
          waarde={gemOplostijd === null ? "–" : `${gemOplostijd.toFixed(1)}d`}
          accent="text-slate-700 dark:text-slate-200"
        />
      </div>

      {totaal > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="glass flex flex-col gap-2 rounded-2xl px-4 py-3">
            <span className="text-xs text-slate-500 dark:text-slate-400">Urgentie van alle {totaal} meldingen</span>
            <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
              {(Object.keys(urgentieVerdeling) as Urgentie[]).map((u) =>
                urgentieVerdeling[u] > 0 ? (
                  <div
                    key={u}
                    className={URGENTIE_BAR_KLEUR[u]}
                    style={{ width: `${(urgentieVerdeling[u] / totaal) * 100}%` }}
                    title={`${URGENTIE_LABELS[u]}: ${urgentieVerdeling[u]}`}
                  />
                ) : null
              )}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
              {(Object.keys(urgentieVerdeling) as Urgentie[]).map((u) => (
                <span key={u} className="flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${URGENTIE_BAR_KLEUR[u]}`} />
                  {URGENTIE_LABELS[u]} ({urgentieVerdeling[u]})
                </span>
              ))}
            </div>
          </div>

          {trend.length > 0 && (
            <div className="glass flex flex-col gap-2 rounded-2xl px-4 py-3">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Meldingen per week</span>
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  {weekLabel(new Date(gehoverd.weekStart))}: {gehoverd.aantal}
                </span>
              </div>
              <div className="flex h-14 items-end gap-1.5">
                {trend.map((bucket, i) => (
                  <button
                    key={bucket.weekStart}
                    type="button"
                    onMouseEnter={() => setHoverIdx(i)}
                    onMouseLeave={() => setHoverIdx(null)}
                    className="flex h-full flex-1 items-end"
                  >
                    <span
                      className={`w-full rounded-t transition-colors ${
                        hoverIdx === i ? "bg-slate-700 dark:bg-white" : "bg-slate-300 hover:bg-slate-400 dark:bg-white/20 dark:hover:bg-white/30"
                      }`}
                      style={{ height: `${Math.max(6, (bucket.aantal / trendMax) * 100)}%` }}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="glass flex flex-col gap-3 rounded-2xl px-4 py-3">
        <input
          type="search"
          value={zoekterm}
          onChange={(e) => setZoekterm(e.target.value)}
          placeholder="Zoek op klant, asset of omschrijving…"
          className="w-full rounded-md border px-3 py-1.5 text-sm"
        />
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-1.5">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setStatusFilter(tab.value)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  statusFilter === tab.value
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    : "bg-slate-200/70 text-slate-700 hover:bg-slate-300/70 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/20"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <select
            value={urgentieFilter}
            onChange={(e) => setUrgentieFilter(e.target.value as Urgentie | "alle")}
            className="ml-auto rounded-md border px-2 py-1 text-xs"
          >
            {URGENTIE_OPTIES.map((o) => (
              <option key={o} value={o}>
                {o === "alle" ? "Alle urgenties" : URGENTIE_LABELS[o]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        {meldingen.map((m) => (
          <div key={m.id} className="glass flex items-center justify-between gap-3 rounded-2xl px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="font-medium">
                {m.assetNaam} <span className="font-normal text-slate-400">· {m.klantNaam}</span>
              </p>
              <p className="truncate text-sm text-slate-600 dark:text-slate-300">{m.omschrijving}</p>
              <p className="text-xs text-slate-400">
                {m.gemeldDoor ?? "Onbekend"} · {formatteerDatumTijd(m.gemeldOp)}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1.5">
              <UrgentieBadge urgentie={m.urgentie} />
              <MeldingStatusBadge status={m.status} />
            </div>
          </div>
        ))}
        {meldingen.length === 0 && (
          <p className="glass rounded-2xl px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Geen meldingen voor dit filter.
          </p>
        )}
      </div>
    </div>
  );
}

function StatTegel({ label, waarde, accent }: { label: string; waarde: number | string; accent: string }) {
  return (
    <div className="glass flex flex-col items-center gap-0.5 rounded-2xl px-3 py-3 text-center">
      <span className={`text-2xl font-semibold ${accent}`}>{waarde}</span>
      <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
    </div>
  );
}
