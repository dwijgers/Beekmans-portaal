import type { Urgentie, MeldingStatus, EigendomsType, TruckStatus, FactuurStatus } from "@/lib/types";

const URGENTIE_STYLES: Record<Urgentie, string> = {
  laag: "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300",
  gemiddeld: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  hoog: "bg-orange-100 text-orange-800 dark:bg-orange-500/15 dark:text-orange-300",
  kritiek: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300",
};
export const URGENTIE_LABELS: Record<Urgentie, string> = {
  laag: "Laag",
  gemiddeld: "Gemiddeld",
  hoog: "Hoog",
  kritiek: "Kritiek",
};
export function UrgentieBadge({ urgentie }: { urgentie: Urgentie }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${URGENTIE_STYLES[urgentie]}`}>
      {URGENTIE_LABELS[urgentie]}
    </span>
  );
}

const MELDING_STATUS_STYLES: Record<MeldingStatus, string> = {
  gemeld: "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300",
  in_behandeling: "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300",
  opgelost: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
};
export const MELDING_STATUS_LABELS: Record<MeldingStatus, string> = {
  gemeld: "Gemeld",
  in_behandeling: "In behandeling",
  opgelost: "Opgelost",
};
export function MeldingStatusBadge({ status }: { status: MeldingStatus }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${MELDING_STATUS_STYLES[status]}`}>
      {MELDING_STATUS_LABELS[status]}
    </span>
  );
}

const EIGENDOM_STYLES: Record<EigendomsType, string> = {
  verkocht: "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300",
  onderhoud: "bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300",
  verhuur: "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300",
};
export const EIGENDOM_LABELS: Record<EigendomsType, string> = {
  verkocht: "Verkocht",
  onderhoud: "Onderhoud-only",
  verhuur: "Verhuur/lease",
};
export function EigendomBadge({ type }: { type: EigendomsType }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${EIGENDOM_STYLES[type]}`}>
      {EIGENDOM_LABELS[type]}
    </span>
  );
}

const TRUCK_STATUS_STYLES: Record<TruckStatus, string> = {
  bij_klant: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  beschikbaar: "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300",
  in_onderhoud: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  buiten_dienst: "bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-slate-400",
};
export const TRUCK_STATUS_LABELS: Record<TruckStatus, string> = {
  bij_klant: "Bij klant",
  beschikbaar: "Beschikbaar",
  in_onderhoud: "In onderhoud",
  buiten_dienst: "Buiten dienst",
};
export function TruckStatusBadge({ status }: { status: TruckStatus }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${TRUCK_STATUS_STYLES[status]}`}>
      {TRUCK_STATUS_LABELS[status]}
    </span>
  );
}

const FACTUUR_STATUS_STYLES: Record<FactuurStatus, string> = {
  concept: "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300",
  ter_goedkeuring: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  goedgekeurd: "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300",
  verzonden: "bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300",
  betaald: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
};
export const FACTUUR_STATUS_LABELS: Record<FactuurStatus, string> = {
  concept: "Concept",
  ter_goedkeuring: "Ter goedkeuring",
  goedgekeurd: "Goedgekeurd",
  verzonden: "Verzonden",
  betaald: "Betaald",
};
export function FactuurStatusBadge({ status }: { status: FactuurStatus }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${FACTUUR_STATUS_STYLES[status]}`}>
      {FACTUUR_STATUS_LABELS[status]}
    </span>
  );
}
