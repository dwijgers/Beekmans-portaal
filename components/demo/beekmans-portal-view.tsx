"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { AssetIcon } from "@/components/asset-icon";
import { MELDING_STATUS_LABELS, URGENTIE_LABELS } from "@/components/status-badge";
import { formatteerDatumTijd, formatteerDatum } from "@/lib/datum";
import type { MeldingStatus, Urgentie } from "@/lib/types";
import type { PortalFactuur, PortalKlant, PortalOnderdeel, PortalTruck, PortalVerhuurTruck } from "@/lib/demo/demo-data";
import type { PortalFoto, PortalHistorieItem } from "@/lib/demo/portal-types";

export type BeekmansMelding = {
  id: string;
  klant?: string;
  assetNaam: string;
  assetModel: string;
  assetIconHint?: string;
  urgentie: Urgentie;
  status: MeldingStatus;
  omschrijving: string;
  aiDiagnose: string | null;
  fotos: PortalFoto[];
  gemeldDoor: string;
  gemeldOp: string;
  opgelostOp?: string;
  historie: PortalHistorieItem[];
  voorgesteldeAfspraak?: { datum: string; geaccepteerd: boolean | null };
};

/* Eigen, herkenbare Beekmans-stijl i.p.v. de R'EMS-glasstijl (die blijft
   voorbehouden aan de echte, geauthenticeerde /leverancier-pagina): zwart/
   amber, hazardstrepen, hoekige kaarten — refereert aan de veiligheids-
   striping op een heftruck i.p.v. een generiek SaaS-dashboard.

   Opgebouwd als losse modules (Overzicht/Meldingen/Vloot/Voorraad/Facturatie)
   i.p.v. één lange pagina — dat is dichter bij wat een "volwaardig
   Beekmans-portaal" (optie 4 uit het voorstel) zou moeten zijn dan een los
   lijstje meldingen. */

const URGENTIE_RANG: Record<Urgentie, number> = { kritiek: 0, hoog: 1, gemiddeld: 2, laag: 3 };
const URGENTIE_CHIP: Record<Urgentie, string> = {
  kritiek: "bg-red-600 text-white",
  hoog: "bg-orange-500 text-white",
  gemiddeld: "bg-amber-400 text-zinc-900",
  laag: "bg-zinc-300 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200",
};
const URGENTIE_DOT: Record<Urgentie, string> = {
  kritiek: "bg-red-600",
  hoog: "bg-orange-500",
  gemiddeld: "bg-amber-400",
  laag: "bg-zinc-400",
};
const STATUS_CHIP: Record<MeldingStatus, string> = {
  gemeld: "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200",
  in_behandeling: "bg-sky-500 text-white",
  opgelost: "bg-emerald-500 text-white",
};
const FACTUUR_CHIP: Record<PortalFactuur["status"], string> = {
  concept: "bg-zinc-300 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200",
  verzonden: "bg-sky-500 text-white",
  betaald: "bg-emerald-500 text-white",
};

const STATUS_TABS: { value: MeldingStatus | "alle"; label: string }[] = [
  { value: "alle", label: "Alle" },
  { value: "gemeld", label: MELDING_STATUS_LABELS.gemeld },
  { value: "in_behandeling", label: MELDING_STATUS_LABELS.in_behandeling },
  { value: "opgelost", label: MELDING_STATUS_LABELS.opgelost },
];
const URGENTIE_OPTIES: (Urgentie | "alle")[] = ["alle", "kritiek", "hoog", "gemiddeld", "laag"];

type Sortering = "urgentie" | "nieuwste" | "klant";
type Module = "overzicht" | "meldingen" | "klanten" | "vloot" | "verhuur" | "voorraad" | "facturatie" | "instellingen";

const MODULES: { value: Module; label: string }[] = [
  { value: "overzicht", label: "Overzicht" },
  { value: "meldingen", label: "Meldingen" },
  { value: "klanten", label: "Klanten" },
  { value: "vloot", label: "Vloot" },
  { value: "verhuur", label: "Verhuur" },
  { value: "voorraad", label: "Voorraad" },
  { value: "facturatie", label: "Facturatie" },
  { value: "instellingen", label: "Instellingen" },
];

const MS_PER_DAG = 24 * 60 * 60 * 1000;
const MS_PER_WEEK = 7 * MS_PER_DAG;

function weekStart(datum: Date): Date {
  const d = new Date(datum);
  d.setHours(0, 0, 0, 0);
  const dagVanWeek = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - dagVanWeek);
  return d;
}

function formatWeekLabel(datum: Date): string {
  return datum.toLocaleDateString("nl-NL", { day: "numeric", month: "short" });
}

function berekenWeekTrend(meldingen: BeekmansMelding[], aantalWeken: number) {
  if (meldingen.length === 0) return [];
  const laatsteDatum = meldingen.reduce(
    (max, m) => (new Date(m.gemeldOp) > max ? new Date(m.gemeldOp) : max),
    new Date(meldingen[0].gemeldOp)
  );
  const laatsteWeek = weekStart(laatsteDatum).getTime();
  const buckets: { weekStart: number; aantal: number }[] = [];
  for (let i = aantalWeken - 1; i >= 0; i--) {
    buckets.push({ weekStart: laatsteWeek - i * MS_PER_WEEK, aantal: 0 });
  }
  for (const m of meldingen) {
    const w = weekStart(new Date(m.gemeldOp)).getTime();
    const bucket = buckets.find((b) => b.weekStart === w);
    if (bucket) bucket.aantal++;
  }
  return buckets;
}

/** Diagonale hazard-striping — de veiligheidsbelijning op een heftruck, hier als merkaccent. */
function HazardStrip({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`h-1.5 w-full ${className}`}
      style={{
        backgroundImage: "repeating-linear-gradient(135deg, #fbbf24 0, #fbbf24 10px, #18181b 10px, #18181b 20px)",
      }}
    />
  );
}

function ForkliftMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 40" className={className} fill="none" aria-hidden>
      <rect x="2" y="27" width="3" height="9" rx="1" fill="currentColor" />
      <rect x="2" y="4" width="3" height="32" rx="1" fill="currentColor" />
      <rect x="8" y="19" width="15" height="3" rx="1" fill="currentColor" />
      <rect x="8" y="4" width="3" height="18" rx="1" fill="currentColor" />
      <path d="M11 22h20a5 5 0 0 1 5 5v3H11a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2Z" fill="currentColor" />
      <rect x="30" y="12" width="9" height="10" rx="1.5" fill="currentColor" />
      <circle cx="15" cy="34" r="4.5" fill="currentColor" />
      <circle cx="34" cy="34" r="4.5" fill="currentColor" />
      <circle cx="15" cy="34" r="1.8" className="fill-current text-amber-400" />
      <circle cx="34" cy="34" r="1.8" className="fill-current text-amber-400" />
    </svg>
  );
}

export function BeekmansPortalView({
  meldingen: alleMeldingen,
  klanten: klantenInitieel,
  vloot: vlootInitieel,
  verhuurvloot,
  voorraad: voorraadInitieel,
  facturen,
  label,
}: {
  meldingen: BeekmansMelding[];
  klanten: PortalKlant[];
  vloot: PortalTruck[];
  verhuurvloot: PortalVerhuurTruck[];
  voorraad: PortalOnderdeel[];
  facturen: PortalFactuur[];
  /** Klein label boven de titel, bv. "Demo — geen productiedata". */
  label?: string;
}) {
  const [module, setModule] = useState<Module>("overzicht");
  const [statusFilter, setStatusFilter] = useState<MeldingStatus | "alle">("alle");
  const [urgentieFilter, setUrgentieFilter] = useState<Urgentie | "alle">("alle");
  const [klantFilter, setKlantFilter] = useState<string>("alle");
  const [sortering, setSortering] = useState<Sortering>("urgentie");
  const [zoekterm, setZoekterm] = useState("");
  const [openId, setOpenId] = useState<string | null>(alleMeldingen[0]?.id ?? null);
  const [toonMailVoorbeeld, setToonMailVoorbeeld] = useState(false);
  const [vlootZoekterm, setVlootZoekterm] = useState("");
  const [globalZoek, setGlobalZoek] = useState("");
  /* Als state (i.p.v. rechtstreeks de props) zodat wat je in Instellingen
     toevoegt meteen overal in de demo verschijnt — klant-kaarten, filters,
     Vloot, Voorraad — precies zoals dat in een echt systeem zou werken. */
  const [klanten, setKlanten] = useState(klantenInitieel);
  const [vloot, setVloot] = useState(vlootInitieel);
  const [voorraad, setVoorraad] = useState(voorraadInitieel);

  const voorbeeldMail = alleMeldingen[0];

  const globalSuggesties = useMemo(() => {
    const term = globalZoek.trim().toLowerCase();
    if (term === "") return { klanten: [], trucks: [] };
    return {
      klanten: klanten.filter((k) => k.naam.toLowerCase().includes(term)).slice(0, 5),
      trucks: vloot.filter((t) => t.naam.toLowerCase().includes(term) || t.model.toLowerCase().includes(term)).slice(0, 5),
    };
  }, [globalZoek, klanten, vloot]);
  const heeftGlobalSuggesties = globalSuggesties.klanten.length > 0 || globalSuggesties.trucks.length > 0;

  const meldingen = useMemo(() => {
    const term = zoekterm.trim().toLowerCase();
    return alleMeldingen
      .filter((m) => statusFilter === "alle" || m.status === statusFilter)
      .filter((m) => urgentieFilter === "alle" || m.urgentie === urgentieFilter)
      .filter((m) => klantFilter === "alle" || m.klant === klantFilter)
      .filter(
        (m) =>
          term === "" ||
          m.assetNaam.toLowerCase().includes(term) ||
          m.assetModel.toLowerCase().includes(term) ||
          m.omschrijving.toLowerCase().includes(term) ||
          (m.klant?.toLowerCase().includes(term) ?? false)
      )
      .sort((a, b) => {
        if (sortering === "nieuwste") {
          return new Date(b.gemeldOp).getTime() - new Date(a.gemeldOp).getTime();
        }
        if (sortering === "klant") {
          return (a.klant ?? "").localeCompare(b.klant ?? "") || URGENTIE_RANG[a.urgentie] - URGENTIE_RANG[b.urgentie];
        }
        return (
          URGENTIE_RANG[a.urgentie] - URGENTIE_RANG[b.urgentie] ||
          new Date(b.gemeldOp).getTime() - new Date(a.gemeldOp).getTime()
        );
      });
  }, [alleMeldingen, statusFilter, urgentieFilter, klantFilter, sortering, zoekterm]);

  const tellingen = useMemo(() => {
    const base: Record<MeldingStatus, number> = { gemeld: 0, in_behandeling: 0, opgelost: 0 };
    for (const m of alleMeldingen) base[m.status]++;
    return base;
  }, [alleMeldingen]);

  const kritiekeOpenstaand = useMemo(
    () => alleMeldingen.filter((m) => m.status !== "opgelost" && m.urgentie === "kritiek").length,
    [alleMeldingen]
  );

  const urgentieVerdeling = useMemo(() => {
    const base: Record<Urgentie, number> = { kritiek: 0, hoog: 0, gemiddeld: 0, laag: 0 };
    for (const m of alleMeldingen) base[m.urgentie]++;
    return base;
  }, [alleMeldingen]);
  const totaalMeldingen = alleMeldingen.length;

  const gemiddeldeOplostijdDagen = useMemo(() => {
    const opgeloste = alleMeldingen.filter((m) => m.status === "opgelost" && m.opgelostOp);
    if (opgeloste.length === 0) return null;
    const totaalDagen = opgeloste.reduce(
      (som, m) => som + (new Date(m.opgelostOp!).getTime() - new Date(m.gemeldOp).getTime()) / MS_PER_DAG,
      0
    );
    return totaalDagen / opgeloste.length;
  }, [alleMeldingen]);

  const weekTrend = useMemo(() => berekenWeekTrend(alleMeldingen, 8), [alleMeldingen]);
  const weekTrendMax = Math.max(1, ...weekTrend.map((w) => w.aantal));

  const vraagtAandacht = useMemo(
    () =>
      alleMeldingen
        .filter((m) => m.status !== "opgelost" && (m.urgentie === "kritiek" || m.urgentie === "hoog"))
        .sort(
          (a, b) =>
            URGENTIE_RANG[a.urgentie] - URGENTIE_RANG[b.urgentie] ||
            new Date(b.gemeldOp).getTime() - new Date(a.gemeldOp).getTime()
        ),
    [alleMeldingen]
  );

  const klantStats = useMemo(
    () =>
      klanten.map((klant) => {
        const van = alleMeldingen.filter((m) => m.klant === klant.naam);
        return {
          klant,
          totaal: van.length,
          open: van.filter((m) => m.status !== "opgelost").length,
          kritiek: van.filter((m) => m.status !== "opgelost" && m.urgentie === "kritiek").length,
        };
      }),
    [klanten, alleMeldingen]
  );

  function springNaarMelding(id: string) {
    setModule("meldingen");
    setStatusFilter("alle");
    setUrgentieFilter("alle");
    setKlantFilter("alle");
    setZoekterm("");
    setOpenId(id);
    requestAnimationFrame(() => {
      document.getElementById(`bk-melding-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  function kiesKlant(klantNaam: string) {
    setKlantFilter(klantNaam);
    setModule("meldingen");
    setGlobalZoek("");
  }

  function kiesTruck(truck: PortalTruck) {
    setModule("vloot");
    setVlootZoekterm(truck.naam);
    setGlobalZoek("");
  }

  return (
    <div className="min-h-full bg-[#f4f2ec] text-zinc-900 dark:bg-[#0b0b0c] dark:text-zinc-50">
      <HazardStrip />
      <header className="bg-zinc-950 text-white">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <ForkliftMark className="h-9 w-11 text-amber-400" />
            <div>
              <p className="text-xl font-black uppercase tracking-wide">
                Beekmans<span className="text-amber-400">.</span>
              </p>
              <p className="text-xs font-medium uppercase tracking-widest text-zinc-400">Onderhoudsportaal</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="search"
                value={globalZoek}
                onChange={(e) => setGlobalZoek(e.target.value)}
                placeholder="Zoek klant of truck…"
                className="w-48 rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:border-amber-400 focus:outline-none sm:w-56"
              />
              {globalZoek.trim() !== "" && (
                <div className="absolute right-0 top-full z-10 mt-1 w-72 border border-zinc-700 bg-zinc-900 text-left shadow-lg">
                  {heeftGlobalSuggesties ? (
                    <>
                      {globalSuggesties.klanten.map((klant) => (
                        <button
                          key={klant.naam}
                          type="button"
                          onClick={() => kiesKlant(klant.naam)}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-zinc-200 hover:bg-zinc-800"
                        >
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-400 text-[10px] font-black text-zinc-900">
                            {klant.monogram}
                          </span>
                          <span>
                            <span className="font-semibold">{klant.naam}</span>
                            <span className="ml-1.5 text-zinc-500">klant</span>
                          </span>
                        </button>
                      ))}
                      {globalSuggesties.trucks.map((truck) => (
                        <button
                          key={truck.id}
                          type="button"
                          onClick={() => kiesTruck(truck)}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-zinc-200 hover:bg-zinc-800"
                        >
                          <AssetIcon categorie={truck.naam} className="h-6 w-6 shrink-0" />
                          <span>
                            <span className="font-semibold">{truck.naam}</span>
                            <span className="ml-1.5 text-zinc-500">{truck.klant}</span>
                          </span>
                        </button>
                      ))}
                    </>
                  ) : (
                    <p className="px-3 py-2 text-xs text-zinc-500">Geen klant of truck gevonden.</p>
                  )}
                </div>
              )}
            </div>
            {label && (
              <span className="hidden rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-300 md:inline-block">
                {label}
              </span>
            )}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-400 text-sm font-black text-zinc-900">
              B
            </div>
          </div>
        </div>
        <nav className="mx-auto flex w-full max-w-5xl gap-1 overflow-x-auto px-4">
          {MODULES.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setModule(m.value)}
              className={`whitespace-nowrap px-4 py-2.5 text-xs font-bold uppercase tracking-wide transition ${
                module === m.value ? "border-b-2 border-amber-400 text-amber-400" : "border-b-2 border-transparent text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {m.label}
            </button>
          ))}
        </nav>
      </header>
      <HazardStrip />

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6">
        {module === "overzicht" && (
          <>
            <div className="flex flex-col gap-2 border-l-4 border-amber-400 bg-white/60 px-4 py-3 dark:bg-white/5">
              <p className="text-sm text-zinc-700 dark:text-zinc-300">
                Eén centraal punt waar de onderhoudsmeldingen van al Beekmans&apos; klanten binnenkomen —{" "}
                <strong>R&apos;EMS is klant 1 van {klanten.length}</strong> — per klant en per truck direct
                overzichtelijk, urgentie en AI-diagnose in één oogopslag, in plaats van losse e-mails uitpluizen.
              </p>
              {voorbeeldMail && (
                <button
                  type="button"
                  onClick={() => setToonMailVoorbeeld((v) => !v)}
                  className="self-start rounded-none border border-zinc-400 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  {toonMailVoorbeeld ? "Verberg" : "Zo ging dit tot nu toe →"} het oude e-mailtje
                </button>
              )}
              {toonMailVoorbeeld && voorbeeldMail && (
                <div className="flex flex-col gap-2 border border-dashed border-zinc-400 bg-white p-3 text-xs text-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-400 sm:flex-row sm:items-stretch">
                  <div className="flex-1 rounded bg-zinc-50 p-3 font-mono shadow-inner dark:bg-black/30">
                    <p className="text-zinc-400">
                      Onderwerp: Onderhoudsmelding {voorbeeldMail.klant ?? "klant"} — {voorbeeldMail.assetNaam}
                    </p>
                    <div className="mt-2 space-y-0.5 text-zinc-600 dark:text-zinc-300">
                      <p>Asset: {voorbeeldMail.assetNaam}</p>
                      <p>Urgentie: {URGENTIE_LABELS[voorbeeldMail.urgentie]}</p>
                      <p>Gemeld op: {formatteerDatumTijd(voorbeeldMail.gemeldOp)}</p>
                      <p>Doorgezet door: {voorbeeldMail.gemeldDoor}</p>
                    </div>
                    <p className="mt-2 text-zinc-600 dark:text-zinc-300">{voorbeeldMail.omschrijving}</p>
                  </div>
                  <div className="flex items-center justify-center px-2 text-lg text-amber-500">→</div>
                  <div className="flex flex-1 flex-col justify-center gap-1 rounded bg-zinc-50 p-3 shadow-inner dark:bg-black/30">
                    <p className="font-semibold text-zinc-700 dark:text-zinc-200">In het portaal:</p>
                    <ul className="list-inside list-disc space-y-0.5">
                      <li>direct urgentie- en statusbadge zichtbaar</li>
                      <li>welke klant en welke truck in één oogopslag</li>
                      <li>AI-diagnose erbij, geen losse analyse nodig</li>
                      <li>historie van dit asset in één klik erbij</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {vraagtAandacht.length > 0 && (
              <div className="border-2 border-red-600/70 bg-white dark:bg-zinc-900">
                <div className="flex items-center gap-2 bg-red-600 px-4 py-2 text-white">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
                    <path d="M12 2 1 21h22L12 2Zm0 6.5 5.5 9.5h-11L12 8.5Z" />
                    <rect x="11" y="11.5" width="2" height="4.5" fill="white" />
                    <rect x="11" y="17" width="2" height="2" fill="white" />
                  </svg>
                  <p className="text-xs font-bold uppercase tracking-wide">Vraagt nu aandacht ({vraagtAandacht.length})</p>
                </div>
                <div className="flex flex-col divide-y divide-zinc-200 dark:divide-zinc-800">
                  {vraagtAandacht.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => springNaarMelding(m.id)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-left transition hover:bg-amber-50 dark:hover:bg-white/5"
                    >
                      <AssetIcon categorie={m.assetIconHint ?? m.assetNaam} className="h-9 w-9 shrink-0" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">
                          {m.assetNaam}
                          {m.klant && <span className="ml-1.5 font-normal text-zinc-400">· {m.klant}</span>}
                        </span>
                        <span className="block truncate text-xs text-zinc-500 dark:text-zinc-400">{m.omschrijving}</span>
                      </span>
                      <span className={`rounded-sm px-2 py-0.5 text-[11px] font-bold uppercase ${URGENTIE_CHIP[m.urgentie]}`}>
                        {URGENTIE_LABELS[m.urgentie]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <KpiTegel label={MELDING_STATUS_LABELS.gemeld} waarde={tellingen.gemeld} />
              <KpiTegel label={MELDING_STATUS_LABELS.in_behandeling} waarde={tellingen.in_behandeling} accent="text-sky-500" />
              <KpiTegel label={MELDING_STATUS_LABELS.opgelost} waarde={tellingen.opgelost} accent="text-emerald-500" />
              <KpiTegel label="Kritiek open" waarde={kritiekeOpenstaand} accent="text-red-600" />
              <KpiTegel label="Gem. oplostijd" waarde={gemiddeldeOplostijdDagen === null ? "–" : `${gemiddeldeOplostijdDagen.toFixed(1)}d`} />
              <KpiTegel label="Actieve klanten" waarde={klanten.length} accent="text-amber-500" />
            </div>

            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Klanten ({klanten.length}) — klik voor hun meldingen
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {klantStats.map(({ klant, totaal, open, kritiek }) => (
                  <button
                    key={klant.naam}
                    type="button"
                    onClick={() => kiesKlant(klant.naam)}
                    className="flex flex-col justify-between gap-3 border-2 border-zinc-200 bg-white p-4 text-left transition hover:border-amber-300 dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-sm font-black text-amber-400 dark:bg-amber-400 dark:text-zinc-900">
                          {klant.monogram}
                        </div>
                        <div>
                          <p className="font-bold leading-tight">{klant.naam}</p>
                          <p className="text-[11px] text-zinc-400">
                            klant sinds {klant.sindsJaar} · {klant.aantalAssets} trucks
                          </p>
                        </div>
                      </div>
                      {kritiek > 0 && (
                        <span className="rounded-sm bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white">{kritiek}</span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {open} open van {totaal} meldingen
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {totaalMeldingen > 0 && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-2 border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
                  <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Urgentie van alle {totaalMeldingen} meldingen
                  </span>
                  <div className="flex h-2.5 w-full overflow-hidden bg-zinc-200 dark:bg-zinc-800">
                    {(Object.keys(urgentieVerdeling) as Urgentie[]).map((urgentie) =>
                      urgentieVerdeling[urgentie] > 0 ? (
                        <div
                          key={urgentie}
                          className={URGENTIE_DOT[urgentie]}
                          style={{ width: `${(urgentieVerdeling[urgentie] / totaalMeldingen) * 100}%` }}
                          title={`${URGENTIE_LABELS[urgentie]}: ${urgentieVerdeling[urgentie]}`}
                        />
                      ) : null
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {(Object.keys(urgentieVerdeling) as Urgentie[]).map((urgentie) => (
                      <span key={urgentie} className="flex items-center gap-1.5">
                        <span className={`h-2 w-2 rounded-full ${URGENTIE_DOT[urgentie]}`} />
                        {URGENTIE_LABELS[urgentie]} ({urgentieVerdeling[urgentie]})
                      </span>
                    ))}
                  </div>
                </div>
                <WeekTrend buckets={weekTrend} max={weekTrendMax} />
              </div>
            )}
          </>
        )}

        {module === "meldingen" && (
          <>
            <div className="flex flex-col gap-3 border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
              <input
                type="search"
                value={zoekterm}
                onChange={(e) => setZoekterm(e.target.value)}
                placeholder="Zoek op klant, asset of omschrijving…"
                className="w-full rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-amber-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
              />
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex flex-wrap gap-1.5">
                  {STATUS_TABS.map((tab) => (
                    <button
                      key={tab.value}
                      type="button"
                      onClick={() => setStatusFilter(tab.value)}
                      className={`px-3 py-1 text-xs font-semibold uppercase tracking-wide transition ${
                        statusFilter === tab.value
                          ? "bg-zinc-900 text-amber-400 dark:bg-amber-400 dark:text-zinc-900"
                          : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                <div className="ml-auto flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <label htmlFor="bk-klant" className="text-xs text-zinc-500 dark:text-zinc-400">
                      Klant
                    </label>
                    <select
                      id="bk-klant"
                      value={klantFilter}
                      onChange={(e) => setKlantFilter(e.target.value)}
                      className="rounded border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
                    >
                      <option value="alle">Alle</option>
                      {klanten.map((klant) => (
                        <option key={klant.naam} value={klant.naam}>
                          {klant.naam}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <label htmlFor="bk-urgentie" className="text-xs text-zinc-500 dark:text-zinc-400">
                      Urgentie
                    </label>
                    <select
                      id="bk-urgentie"
                      value={urgentieFilter}
                      onChange={(e) => setUrgentieFilter(e.target.value as Urgentie | "alle")}
                      className="rounded border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
                    >
                      {URGENTIE_OPTIES.map((optie) => (
                        <option key={optie} value={optie}>
                          {optie === "alle" ? "Alle" : URGENTIE_LABELS[optie]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <label htmlFor="bk-sortering" className="text-xs text-zinc-500 dark:text-zinc-400">
                      Sortering
                    </label>
                    <select
                      id="bk-sortering"
                      value={sortering}
                      onChange={(e) => setSortering(e.target.value as Sortering)}
                      className="rounded border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
                    >
                      <option value="urgentie">Urgentie</option>
                      <option value="nieuwste">Nieuwste</option>
                      <option value="klant">Klant</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              {meldingen.map((melding) => (
                <MeldingKaart
                  key={melding.id}
                  melding={melding}
                  open={openId === melding.id}
                  onToggle={() => setOpenId((id) => (id === melding.id ? null : melding.id))}
                />
              ))}
              {meldingen.length === 0 && (
                <p className="border border-dashed border-zinc-300 bg-white px-4 py-6 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
                  {totaalMeldingen === 0 ? "Nog geen meldingen." : "Geen meldingen bij dit filter."}
                </p>
              )}
            </div>
          </>
        )}

        {module === "klanten" && (
          <KlantenModule
            klanten={klanten}
            meldingen={alleMeldingen}
            vloot={vloot}
            verhuurvloot={verhuurvloot}
            voorraad={voorraad}
            facturen={facturen}
          />
        )}
        {module === "vloot" && (
          <VlootModule vloot={vloot} klanten={klanten} zoekterm={vlootZoekterm} onZoektermChange={setVlootZoekterm} />
        )}
        {module === "verhuur" && <VerhuurModule verhuurvloot={verhuurvloot} klanten={klanten} />}
        {module === "voorraad" && <VoorraadModule voorraad={voorraad} />}
        {module === "facturatie" && <FacturenModule facturen={facturen} />}
        {module === "instellingen" && (
          <InstellingenModule
            klanten={klanten}
            onAddKlant={(klant) => setKlanten((prev) => [...prev, klant])}
            onAddTruck={(truck) => setVloot((prev) => [...prev, truck])}
            onAddOnderdeel={(onderdeel) => setVoorraad((prev) => [...prev, onderdeel])}
          />
        )}

        <p className="pb-2 text-center text-[11px] uppercase tracking-widest text-zinc-400">
          Beekmans onderhoudsportaal · demo — geen productiedata
        </p>
      </div>
    </div>
  );
}

function KpiTegel({ label, waarde, accent = "text-zinc-900 dark:text-zinc-50" }: { label: string; waarde: number | string; accent?: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 border border-zinc-200 bg-white px-2 py-3 text-center dark:border-zinc-800 dark:bg-zinc-900">
      <span className={`text-2xl font-black ${accent}`}>{waarde}</span>
      <span className="text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{label}</span>
    </div>
  );
}

function WeekTrend({ buckets, max }: { buckets: { weekStart: number; aantal: number }[]; max: number }) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  if (buckets.length === 0) return null;
  const gehoverd = hoverIdx !== null ? buckets[hoverIdx] : buckets[buckets.length - 1];

  return (
    <div className="flex flex-col gap-2 border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
        <span className="font-semibold uppercase tracking-wide">Meldingen per week</span>
        <span className="font-medium text-zinc-700 dark:text-zinc-200">
          {formatWeekLabel(new Date(gehoverd.weekStart))}: {gehoverd.aantal}
        </span>
      </div>
      <div className="flex h-14 items-end gap-1.5">
        {buckets.map((bucket, i) => (
          <button
            key={bucket.weekStart}
            type="button"
            onMouseEnter={() => setHoverIdx(i)}
            onMouseLeave={() => setHoverIdx(null)}
            onFocus={() => setHoverIdx(i)}
            onBlur={() => setHoverIdx(null)}
            aria-label={`${formatWeekLabel(new Date(bucket.weekStart))}: ${bucket.aantal} melding${bucket.aantal === 1 ? "" : "en"}`}
            className="flex h-full flex-1 items-end"
          >
            <span
              className={`w-full transition-colors ${hoverIdx === i ? "bg-amber-400" : "bg-zinc-300 hover:bg-amber-300 dark:bg-zinc-700 dark:hover:bg-amber-400/60"}`}
              style={{ height: `${Math.max(6, (bucket.aantal / max) * 100)}%` }}
            />
          </button>
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-zinc-400">
        <span>{formatWeekLabel(new Date(buckets[0].weekStart))}</span>
        <span>{formatWeekLabel(new Date(buckets[buckets.length - 1].weekStart))}</span>
      </div>
    </div>
  );
}

function FotoThumb({ foto }: { foto: PortalFoto }) {
  return (
    <a
      href={foto.url}
      target={foto.url ? "_blank" : undefined}
      rel={foto.url ? "noreferrer" : undefined}
      className={`flex flex-col items-center gap-1 ${foto.url ? "" : "pointer-events-none"}`}
    >
      {foto.url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={foto.url} alt={foto.label} className="h-16 w-20 rounded object-cover shadow-sm ring-1 ring-black/10" />
      ) : (
        <div
          title={foto.label}
          className={`flex h-16 w-20 items-center justify-center rounded bg-gradient-to-br shadow-sm ring-1 ring-black/10 ${foto.tint ?? "from-zinc-600 to-zinc-900"}`}
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6 text-white/80" fill="none">
            <path
              d="M4 8.5A1.5 1.5 0 0 1 5.5 7h1.6l.9-1.5A1.5 1.5 0 0 1 9.3 4.7h5.4a1.5 1.5 0 0 1 1.3.8L17 7h1.5A1.5 1.5 0 0 1 20 8.5v9A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5v-9Z"
              stroke="currentColor"
              strokeWidth="1.6"
            />
            <circle cx="12" cy="12.5" r="3.2" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        </div>
      )}
      <span className="max-w-20 truncate text-[10px] text-zinc-500 dark:text-zinc-400">{foto.label}</span>
    </a>
  );
}

function AfspraakBlok({ afspraak }: { afspraak: { datum: string; geaccepteerd: boolean | null } }) {
  const [geaccepteerd, setGeaccepteerd] = useState(afspraak.geaccepteerd);

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-2 border-l-4 px-3 py-2 text-sm ${
        geaccepteerd
          ? "border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-100"
          : "border-amber-400 bg-amber-50 text-zinc-800 dark:bg-amber-400/10 dark:text-amber-100"
      }`}
    >
      <span>
        <span className="font-semibold">{geaccepteerd ? "Reparatiemoment geaccepteerd: " : "Voorgesteld reparatiemoment: "}</span>
        {formatteerDatum(afspraak.datum)}
      </span>
      {!geaccepteerd && (
        <button
          type="button"
          onClick={() => setGeaccepteerd(true)}
          className="bg-zinc-900 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-400 transition hover:bg-zinc-800 dark:bg-amber-400 dark:text-zinc-900 dark:hover:bg-amber-300"
        >
          Accepteren (demo)
        </button>
      )}
    </div>
  );
}

function MeldingKaart({ melding, open, onToggle }: { melding: BeekmansMelding; open: boolean; onToggle: () => void }) {
  return (
    <div
      id={`bk-melding-${melding.id}`}
      className={`overflow-hidden border bg-white transition-shadow hover:shadow-md dark:bg-zinc-900 ${
        melding.urgentie === "kritiek" ? "border-red-600" : "border-zinc-200 dark:border-zinc-800"
      }`}
    >
      <button type="button" onClick={onToggle} className="flex w-full items-start gap-3 px-4 py-3 text-left">
        <AssetIcon categorie={melding.assetIconHint ?? melding.assetNaam} className="h-11 w-11" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold">{melding.assetNaam}</p>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">{melding.assetModel}</span>
            {melding.klant && (
              <span className="bg-zinc-900 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-400 dark:bg-amber-400 dark:text-zinc-900">
                {melding.klant}
              </span>
            )}
          </div>
          <p className="mt-0.5 truncate text-sm text-zinc-600 dark:text-zinc-300">{melding.omschrijving}</p>
          <p className="mt-1 text-xs text-zinc-400">
            {melding.gemeldDoor} · {formatteerDatumTijd(melding.gemeldOp)}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <span className={`rounded-sm px-2 py-0.5 text-[11px] font-bold uppercase ${URGENTIE_CHIP[melding.urgentie]}`}>
            {URGENTIE_LABELS[melding.urgentie]}
          </span>
          <span className={`rounded-sm px-2 py-0.5 text-[11px] font-bold uppercase ${STATUS_CHIP[melding.status]}`}>
            {MELDING_STATUS_LABELS[melding.status]}
          </span>
        </div>
      </button>

      {open && (
        <div className="flex flex-col gap-3 border-t border-zinc-200 px-4 py-3 dark:border-zinc-800">
          {melding.voorgesteldeAfspraak && <AfspraakBlok afspraak={melding.voorgesteldeAfspraak} />}
          {melding.aiDiagnose && (
            <div className="border-l-4 border-amber-400 bg-amber-50 px-3 py-2 text-sm text-zinc-800 dark:bg-amber-400/10 dark:text-amber-100">
              <span className="font-semibold">AI-diagnose: </span>
              {melding.aiDiagnose}
            </div>
          )}
          {melding.fotos.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {melding.fotos.map((foto) => (
                <FotoThumb key={foto.id} foto={foto} />
              ))}
            </div>
          )}
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Historie van {melding.assetNaam}
            </p>
            {melding.historie.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Geen eerdere meldingen of acties bekend.</p>
            ) : (
              <ul className="flex flex-col gap-1.5">
                {melding.historie.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${item.type === "melding" ? "bg-amber-400" : "bg-emerald-500"}`} />
                    <span className="text-zinc-600 dark:text-zinc-300">
                      <span className="text-xs text-zinc-400">{formatteerDatumTijd(item.datum)} · </span>
                      {item.omschrijving}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function VlootModule({
  vloot,
  klanten,
  zoekterm,
  onZoektermChange,
}: {
  vloot: PortalTruck[];
  klanten: PortalKlant[];
  zoekterm: string;
  onZoektermChange: (waarde: string) => void;
}) {
  const [klantFilter, setKlantFilter] = useState("alle");
  const term = zoekterm.trim().toLowerCase();
  const zichtbaar = vloot
    .filter((t) => klantFilter === "alle" || t.klant === klantFilter)
    .filter((t) => term === "" || t.naam.toLowerCase().includes(term) || t.model.toLowerCase().includes(term));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Vlootregistratie — {zichtbaar.length} trucks
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="search"
            value={zoekterm}
            onChange={(e) => onZoektermChange(e.target.value)}
            placeholder="Zoek op truck of model…"
            className="rounded border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-amber-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
          />
          <select
            value={klantFilter}
            onChange={(e) => setKlantFilter(e.target.value)}
            className="rounded border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
          >
            <option value="alle">Alle klanten</option>
            {klanten.map((k) => (
              <option key={k.naam} value={k.naam}>
                {k.naam}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex flex-col divide-y divide-zinc-200 border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
        {zichtbaar.map((truck) => (
          <div key={truck.id} className="flex items-center gap-3 px-4 py-3">
            <AssetIcon categorie={truck.naam} className="h-10 w-10 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{truck.naam}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {truck.model} · {truck.klant}
              </p>
            </div>
            <p className="hidden text-xs text-zinc-400 sm:block">Laatste onderhoud: {formatteerDatum(truck.laatsteOnderhoud)}</p>
            <span
              className={`rounded-sm px-2 py-0.5 text-[11px] font-bold uppercase ${
                truck.status === "actief" ? "bg-emerald-500 text-white" : "bg-zinc-400 text-white"
              }`}
            >
              {truck.status === "actief" ? "Actief" : "Buiten dienst"}
            </span>
          </div>
        ))}
        {zichtbaar.length === 0 && <p className="px-4 py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">Geen trucks bij dit filter.</p>}
      </div>
    </div>
  );
}

function VerhuurModule({ verhuurvloot, klanten }: { verhuurvloot: PortalVerhuurTruck[]; klanten: PortalKlant[] }) {
  const [trucks, setTrucks] = useState(verhuurvloot);
  const [toewijzenId, setToewijzenId] = useState<string | null>(null);
  const [gekozenKlant, setGekozenKlant] = useState("");
  const [nieuweKlant, setNieuweKlant] = useState("");

  const opVoorraad = trucks.filter((t) => !t.klant).length;
  const verhuurd = trucks.length - opVoorraad;

  function startToewijzen(truck: PortalVerhuurTruck) {
    setToewijzenId(truck.id);
    setGekozenKlant(klanten[0]?.naam ?? "");
    setNieuweKlant("");
  }

  function bevestigToewijzen(truckId: string) {
    const klant = nieuweKlant.trim() || gekozenKlant;
    if (!klant) return;
    const vandaag = new Date().toISOString().slice(0, 10);
    setTrucks((prev) => prev.map((t) => (t.id === truckId ? { ...t, klant, sinds: vandaag } : t)));
    setToewijzenId(null);
  }

  function neemTerug(truck: PortalVerhuurTruck) {
    const vandaag = new Date().toISOString().slice(0, 10);
    setTrucks((prev) =>
      prev.map((t) =>
        t.id === truck.id
          ? { ...t, klant: undefined, sinds: vandaag, eerdereKlanten: t.klant ? [...t.eerdereKlanten, t.klant] : t.eerdereKlanten }
          : t
      )
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1 border-l-4 border-amber-400 bg-white/60 px-4 py-3 dark:bg-white/5">
        <p className="text-sm text-zinc-700 dark:text-zinc-300">
          Beekmans&apos; eigen verhuurvloot — los van de trucks die klanten zelf al bezitten. Wijs een truck toe aan een
          nieuwe of bestaande klant, of neem &apos;m terug: dan gaat &apos;ie direct weer terug naar de eigen vloot,
          met de koppelhistorie erbij.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
        <KpiTegel label="Op voorraad (Beekmans)" waarde={opVoorraad} accent="text-emerald-500" />
        <KpiTegel label="Verhuurd" waarde={verhuurd} accent="text-amber-500" />
      </div>
      <div className="flex flex-col divide-y divide-zinc-200 border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
        {trucks.map((truck) => (
          <div key={truck.id} className="flex flex-col gap-2 px-4 py-3">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <AssetIcon categorie={truck.naam} className="h-10 w-10 shrink-0" />
              <div className="min-w-[140px] flex-1">
                <p className="font-semibold">{truck.naam}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {truck.model}
                  {truck.eerdereKlanten.length > 0 && (
                    <span className="text-zinc-400"> · eerder bij {truck.eerdereKlanten.join(", ")}</span>
                  )}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {truck.klant ? (
                  <span className="whitespace-nowrap bg-zinc-900 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-400 dark:bg-amber-400 dark:text-zinc-900">
                    Verhuurd aan {truck.klant}
                  </span>
                ) : (
                  <span className="whitespace-nowrap rounded-sm bg-emerald-500 px-2 py-0.5 text-[11px] font-bold uppercase text-white">
                    Op voorraad
                  </span>
                )}
                <p className="hidden text-xs text-zinc-400 sm:block">sinds {formatteerDatum(truck.sinds)}</p>
                {truck.klant ? (
                  <button
                    type="button"
                    onClick={() => neemTerug(truck)}
                    className="whitespace-nowrap border border-zinc-300 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  >
                    Terugnemen
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => startToewijzen(truck)}
                    className="whitespace-nowrap bg-zinc-900 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-400 transition hover:bg-zinc-800 dark:bg-amber-400 dark:text-zinc-900 dark:hover:bg-amber-300"
                  >
                    Toewijzen
                  </button>
                )}
              </div>
            </div>
            {toewijzenId === truck.id && (
              <div className="flex flex-wrap items-center gap-2 border-t border-zinc-100 pt-2 dark:border-zinc-800">
                <label className="text-xs text-zinc-500 dark:text-zinc-400">Bestaande klant:</label>
                <select
                  value={gekozenKlant}
                  onChange={(e) => {
                    setGekozenKlant(e.target.value);
                    setNieuweKlant("");
                  }}
                  className="rounded border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
                >
                  {klanten.map((k) => (
                    <option key={k.naam} value={k.naam}>
                      {k.naam}
                    </option>
                  ))}
                </select>
                <span className="text-xs text-zinc-400">of nieuwe klant:</span>
                <input
                  type="text"
                  value={nieuweKlant}
                  onChange={(e) => setNieuweKlant(e.target.value)}
                  placeholder="Naam nieuwe klant…"
                  className="rounded border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-amber-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
                />
                <button
                  type="button"
                  onClick={() => bevestigToewijzen(truck.id)}
                  className="bg-zinc-900 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-400 transition hover:bg-zinc-800 dark:bg-amber-400 dark:text-zinc-900 dark:hover:bg-amber-300"
                >
                  Bevestigen
                </button>
                <button
                  type="button"
                  onClick={() => setToewijzenId(null)}
                  className="px-2 py-1 text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                >
                  Annuleren
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function VoorraadModule({ voorraad }: { voorraad: PortalOnderdeel[] }) {
  const laag = voorraad.filter((o) => o.voorraad <= o.minimum);

  return (
    <div className="flex flex-col gap-3">
      {laag.length > 0 && (
        <div className="border-2 border-red-600/70 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wide text-red-700 dark:bg-zinc-900 dark:text-red-400">
          {laag.length} onderde{laag.length === 1 ? "el" : "len"} op of onder de minimumvoorraad
        </div>
      )}
      <div className="flex flex-col divide-y divide-zinc-200 border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
        {voorraad.map((onderdeel) => {
          const isLaag = onderdeel.voorraad <= onderdeel.minimum;
          return (
            <div key={onderdeel.naam} className="flex items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{onderdeel.naam}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{onderdeel.klant ?? "Generiek, alle klanten"}</p>
              </div>
              <div className="flex h-2 w-24 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                <div
                  className={isLaag ? "bg-red-600" : "bg-emerald-500"}
                  style={{ width: `${Math.min(100, (onderdeel.voorraad / Math.max(onderdeel.minimum * 2, 1)) * 100)}%` }}
                />
              </div>
              <span className={`w-24 shrink-0 text-right text-sm font-semibold ${isLaag ? "text-red-600" : "text-zinc-700 dark:text-zinc-200"}`}>
                {onderdeel.voorraad} / min. {onderdeel.minimum}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FacturenModule({ facturen }: { facturen: PortalFactuur[] }) {
  const totaalOpenstaand = facturen.filter((f) => f.status !== "betaald").reduce((som, f) => som + f.bedrag, 0);

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <KpiTegel label="Facturen" waarde={facturen.length} />
        <KpiTegel label="Openstaand" waarde={`€ ${totaalOpenstaand}`} accent="text-amber-500" />
        <KpiTegel label="Betaald" waarde={facturen.filter((f) => f.status === "betaald").length} accent="text-emerald-500" />
      </div>
      <div className="flex flex-col divide-y divide-zinc-200 border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
        {facturen.map((factuur) => (
          <div key={factuur.id} className="flex items-center gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{factuur.omschrijving}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {factuur.id} · {factuur.klant} · {formatteerDatum(factuur.datum)}
              </p>
            </div>
            <p className="font-semibold">€ {factuur.bedrag}</p>
            <span className={`rounded-sm px-2 py-0.5 text-[11px] font-bold uppercase ${FACTUUR_CHIP[factuur.status]}`}>{factuur.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function InstellingenModule({
  klanten,
  onAddKlant,
  onAddTruck,
  onAddOnderdeel,
}: {
  klanten: PortalKlant[];
  onAddKlant: (klant: PortalKlant) => void;
  onAddTruck: (truck: PortalTruck) => void;
  onAddOnderdeel: (onderdeel: PortalOnderdeel) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="border-l-4 border-amber-400 bg-white/60 px-4 py-3 dark:bg-white/5">
        <p className="text-sm text-zinc-700 dark:text-zinc-300">
          Zo zou Beekmans zelf klanten, trucks en onderdelen kunnen beheren — geen ontwikkelaar nodig voor een
          nieuwe klant of een truck erbij. Wat je hier toevoegt, verschijnt meteen in de rest van het portaal
          (Overzicht, Vloot, Voorraad).
        </p>
      </div>
      <NieuweKlantForm onAdd={onAddKlant} />
      <NieuweTruckForm klanten={klanten} onAdd={onAddTruck} />
      <NieuwOnderdeelForm klanten={klanten} onAdd={onAddOnderdeel} />
    </div>
  );
}

function InstellingenKaart({
  titel,
  children,
  bevestiging,
}: {
  titel: string;
  children: ReactNode;
  bevestiging: string | null;
}) {
  return (
    <div className="border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="mb-3 text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{titel}</p>
      <div className="flex flex-col gap-2">{children}</div>
      {bevestiging && <p className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">✓ {bevestiging}</p>}
    </div>
  );
}

const instellingInput =
  "rounded border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-amber-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50";
const instellingLabel = "text-xs text-zinc-500 dark:text-zinc-400";
const instellingKnop =
  "self-start bg-zinc-900 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-amber-400 transition hover:bg-zinc-800 dark:bg-amber-400 dark:text-zinc-900 dark:hover:bg-amber-300";

function NieuweKlantForm({ onAdd }: { onAdd: (klant: PortalKlant) => void }) {
  const [naam, setNaam] = useState("");
  const [aantalAssets, setAantalAssets] = useState("0");
  const [bevestiging, setBevestiging] = useState<string | null>(null);

  function submit(e: FormEvent) {
    e.preventDefault();
    const naamGetrimd = naam.trim();
    if (!naamGetrimd) return;
    onAdd({
      naam: naamGetrimd,
      monogram: naamGetrimd.charAt(0).toUpperCase(),
      aantalAssets: Number(aantalAssets) || 0,
      sindsJaar: new Date().getFullYear(),
    });
    setBevestiging(`${naamGetrimd} toegevoegd als klant.`);
    setNaam("");
    setAantalAssets("0");
  }

  return (
    <InstellingenKaart titel="Nieuwe klant toevoegen" bevestiging={bevestiging}>
      <form onSubmit={submit} className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1">
          <span className={instellingLabel}>Klantnaam</span>
          <input
            type="text"
            value={naam}
            onChange={(e) => setNaam(e.target.value)}
            placeholder="Bijv. Jansen Transport"
            className={`${instellingInput} w-56`}
            required
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className={instellingLabel}>Aantal trucks</span>
          <input
            type="number"
            min={0}
            value={aantalAssets}
            onChange={(e) => setAantalAssets(e.target.value)}
            className={`${instellingInput} w-24`}
          />
        </label>
        <button type="submit" className={instellingKnop}>
          Klant toevoegen
        </button>
      </form>
    </InstellingenKaart>
  );
}

function NieuweTruckForm({ klanten, onAdd }: { klanten: PortalKlant[]; onAdd: (truck: PortalTruck) => void }) {
  const [naam, setNaam] = useState("");
  const [model, setModel] = useState("");
  const [klant, setKlant] = useState(klanten[0]?.naam ?? "");
  const [bevestiging, setBevestiging] = useState<string | null>(null);

  function submit(e: FormEvent) {
    e.preventDefault();
    const naamGetrimd = naam.trim();
    const modelGetrimd = model.trim();
    if (!naamGetrimd || !modelGetrimd || !klant) return;
    onAdd({
      id: `t-nieuw-${Date.now()}`,
      klant,
      naam: naamGetrimd,
      model: modelGetrimd,
      status: "actief",
      laatsteOnderhoud: new Date().toISOString().slice(0, 10),
    });
    setBevestiging(`${naamGetrimd} toegevoegd aan de vloot van ${klant}.`);
    setNaam("");
    setModel("");
  }

  return (
    <InstellingenKaart titel="Nieuwe truck toevoegen (bij een klant)" bevestiging={bevestiging}>
      <form onSubmit={submit} className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1">
          <span className={instellingLabel}>Truck-naam</span>
          <input
            type="text"
            value={naam}
            onChange={(e) => setNaam(e.target.value)}
            placeholder="Bijv. Heftruck 09"
            className={`${instellingInput} w-44`}
            required
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className={instellingLabel}>Model</span>
          <input
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="Bijv. Linde H25 D"
            className={`${instellingInput} w-44`}
            required
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className={instellingLabel}>Klant</span>
          <select value={klant} onChange={(e) => setKlant(e.target.value)} className={`${instellingInput} w-44`}>
            {klanten.map((k) => (
              <option key={k.naam} value={k.naam}>
                {k.naam}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className={instellingKnop}>
          Truck toevoegen
        </button>
      </form>
    </InstellingenKaart>
  );
}

function NieuwOnderdeelForm({ klanten, onAdd }: { klanten: PortalKlant[]; onAdd: (onderdeel: PortalOnderdeel) => void }) {
  const [naam, setNaam] = useState("");
  const [voorraad, setVoorraad] = useState("0");
  const [minimum, setMinimum] = useState("1");
  const [klant, setKlant] = useState("");
  const [bevestiging, setBevestiging] = useState<string | null>(null);

  function submit(e: FormEvent) {
    e.preventDefault();
    const naamGetrimd = naam.trim();
    if (!naamGetrimd) return;
    onAdd({
      naam: naamGetrimd,
      voorraad: Number(voorraad) || 0,
      minimum: Number(minimum) || 0,
      klant: klant || undefined,
    });
    setBevestiging(`${naamGetrimd} toegevoegd aan de voorraad.`);
    setNaam("");
    setVoorraad("0");
    setMinimum("1");
  }

  return (
    <InstellingenKaart titel="Nieuw onderdeel toevoegen (voorraad)" bevestiging={bevestiging}>
      <form onSubmit={submit} className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1">
          <span className={instellingLabel}>Onderdeel</span>
          <input
            type="text"
            value={naam}
            onChange={(e) => setNaam(e.target.value)}
            placeholder="Bijv. Aandrijfriem, universeel"
            className={`${instellingInput} w-56`}
            required
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className={instellingLabel}>Voorraad</span>
          <input
            type="number"
            min={0}
            value={voorraad}
            onChange={(e) => setVoorraad(e.target.value)}
            className={`${instellingInput} w-20`}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className={instellingLabel}>Minimum</span>
          <input
            type="number"
            min={0}
            value={minimum}
            onChange={(e) => setMinimum(e.target.value)}
            className={`${instellingInput} w-20`}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className={instellingLabel}>Specifiek voor klant</span>
          <select value={klant} onChange={(e) => setKlant(e.target.value)} className={`${instellingInput} w-48`}>
            <option value="">Generiek, alle klanten</option>
            {klanten.map((k) => (
              <option key={k.naam} value={k.naam}>
                {k.naam}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className={instellingKnop}>
          Onderdeel toevoegen
        </button>
      </form>
    </InstellingenKaart>
  );
}

function KlantenModule({
  klanten,
  meldingen,
  vloot,
  verhuurvloot,
  voorraad,
  facturen,
}: {
  klanten: PortalKlant[];
  meldingen: BeekmansMelding[];
  vloot: PortalTruck[];
  verhuurvloot: PortalVerhuurTruck[];
  voorraad: PortalOnderdeel[];
  facturen: PortalFactuur[];
}) {
  const [geselecteerd, setGeselecteerd] = useState<string | null>(null);
  const klant = geselecteerd ? klanten.find((k) => k.naam === geselecteerd) : undefined;

  if (klant) {
    return (
      <KlantDetail
        klant={klant}
        meldingen={meldingen.filter((m) => m.klant === klant.naam)}
        vloot={vloot.filter((t) => t.klant === klant.naam)}
        verhuurtrucks={verhuurvloot.filter((t) => t.klant === klant.naam)}
        voorraad={voorraad.filter((o) => o.klant === klant.naam)}
        facturen={facturen.filter((f) => f.klant === klant.naam)}
        onTerug={() => setGeselecteerd(null)}
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        Klanten ({klanten.length}) — klik voor alle gegevens
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {klanten.map((k) => {
          const klantMeldingen = meldingen.filter((m) => m.klant === k.naam);
          const open = klantMeldingen.filter((m) => m.status !== "opgelost").length;
          return (
            <button
              key={k.naam}
              type="button"
              onClick={() => setGeselecteerd(k.naam)}
              className="flex flex-col justify-between gap-3 border-2 border-zinc-200 bg-white p-4 text-left transition hover:border-amber-300 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-sm font-black text-amber-400 dark:bg-amber-400 dark:text-zinc-900">
                  {k.monogram}
                </div>
                <div>
                  <p className="font-bold leading-tight">{k.naam}</p>
                  <p className="text-[11px] text-zinc-400">
                    klant sinds {k.sindsJaar} · {k.aantalAssets} trucks
                  </p>
                </div>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {open} open van {klantMeldingen.length} meldingen · bekijk alle gegevens →
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function KlantDetail({
  klant,
  meldingen,
  vloot,
  verhuurtrucks,
  voorraad,
  facturen,
  onTerug,
}: {
  klant: PortalKlant;
  meldingen: BeekmansMelding[];
  vloot: PortalTruck[];
  verhuurtrucks: PortalVerhuurTruck[];
  voorraad: PortalOnderdeel[];
  facturen: PortalFactuur[];
  onTerug: () => void;
}) {
  const [openMeldingId, setOpenMeldingId] = useState<string | null>(null);
  const openMeldingen = meldingen.filter((m) => m.status !== "opgelost").length;
  const kritiek = meldingen.filter((m) => m.status !== "opgelost" && m.urgentie === "kritiek").length;
  const openstaandBedrag = facturen.filter((f) => f.status !== "betaald").reduce((som, f) => som + f.bedrag, 0);

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={onTerug}
        className="self-start text-xs font-semibold uppercase tracking-wide text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        ← Terug naar alle klanten
      </button>

      <div className="flex items-center gap-3 border-l-4 border-amber-400 bg-white/60 px-4 py-3 dark:bg-white/5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-lg font-black text-amber-400 dark:bg-amber-400 dark:text-zinc-900">
          {klant.monogram}
        </div>
        <div>
          <p className="text-lg font-bold">{klant.naam}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Klant sinds {klant.sindsJaar} · {klant.aantalAssets} trucks in beheer
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiTegel label="Open meldingen" waarde={openMeldingen} />
        <KpiTegel label="Kritiek open" waarde={kritiek} accent="text-red-600" />
        <KpiTegel label="Trucks (eigen + verhuur)" waarde={vloot.length + verhuurtrucks.length} accent="text-amber-500" />
        <KpiTegel label="Openstaand" waarde={`€ ${openstaandBedrag}`} accent="text-amber-500" />
      </div>

      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Meldingen ({meldingen.length})
        </p>
        <div className="flex flex-col gap-2.5">
          {meldingen.map((m) => (
            <MeldingKaart
              key={m.id}
              melding={m}
              open={openMeldingId === m.id}
              onToggle={() => setOpenMeldingId((id) => (id === m.id ? null : m.id))}
            />
          ))}
          {meldingen.length === 0 && (
            <p className="border border-dashed border-zinc-300 bg-white px-4 py-4 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
              Geen meldingen bekend voor deze klant.
            </p>
          )}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Vloot ({vloot.length + verhuurtrucks.length})
        </p>
        <div className="flex flex-col divide-y divide-zinc-200 border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
          {vloot.map((t) => (
            <div key={t.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <AssetIcon categorie={t.naam} className="h-10 w-10 shrink-0" />
              <div className="min-w-[140px] flex-1">
                <p className="font-semibold">{t.naam}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{t.model} · eigen bezit</p>
              </div>
              <span
                className={`whitespace-nowrap rounded-sm px-2 py-0.5 text-[11px] font-bold uppercase ${
                  t.status === "actief" ? "bg-emerald-500 text-white" : "bg-zinc-400 text-white"
                }`}
              >
                {t.status === "actief" ? "Actief" : "Buiten dienst"}
              </span>
            </div>
          ))}
          {verhuurtrucks.map((t) => (
            <div key={t.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <AssetIcon categorie={t.naam} className="h-10 w-10 shrink-0" />
              <div className="min-w-[140px] flex-1">
                <p className="font-semibold">{t.naam}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {t.model} · gehuurd van Beekmans, sinds {formatteerDatum(t.sinds)}
                </p>
              </div>
              <span className="whitespace-nowrap bg-zinc-900 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-400 dark:bg-amber-400 dark:text-zinc-900">
                Verhuurd
              </span>
            </div>
          ))}
          {vloot.length + verhuurtrucks.length === 0 && (
            <p className="px-4 py-4 text-center text-sm text-zinc-500 dark:text-zinc-400">Geen trucks bekend bij deze klant.</p>
          )}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Klantspecifieke voorraad ({voorraad.length})
        </p>
        <div className="flex flex-col divide-y divide-zinc-200 border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
          {voorraad.map((o) => {
            const isLaag = o.voorraad <= o.minimum;
            return (
              <div key={o.naam} className="flex items-center gap-3 px-4 py-3">
                <p className="flex-1 font-semibold">{o.naam}</p>
                <span className={`text-sm font-semibold ${isLaag ? "text-red-600" : "text-zinc-700 dark:text-zinc-200"}`}>
                  {o.voorraad} / min. {o.minimum}
                </span>
              </div>
            );
          })}
          {voorraad.length === 0 && (
            <p className="px-4 py-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
              Geen klantspecifieke onderdelen — deze klant valt onder de generieke voorraad.
            </p>
          )}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Facturen ({facturen.length})
        </p>
        <div className="flex flex-col divide-y divide-zinc-200 border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
          {facturen.map((f) => (
            <div key={f.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{f.omschrijving}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {f.id} · {formatteerDatum(f.datum)}
                </p>
              </div>
              <p className="font-semibold">€ {f.bedrag}</p>
              <span className={`rounded-sm px-2 py-0.5 text-[11px] font-bold uppercase ${FACTUUR_CHIP[f.status]}`}>{f.status}</span>
            </div>
          ))}
          {facturen.length === 0 && (
            <p className="px-4 py-4 text-center text-sm text-zinc-500 dark:text-zinc-400">Geen facturen voor deze klant.</p>
          )}
        </div>
      </div>
    </div>
  );
}
