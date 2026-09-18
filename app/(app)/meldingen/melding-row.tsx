"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { AssetIcon } from "@/components/asset-icon";
import { MeldingStatusBadge, UrgentieBadge, MELDING_STATUS_LABELS } from "@/components/status-badge";
import { formatteerDatumTijd } from "@/lib/datum";
import { updateMeldingStatus, neemMeldingOp } from "./actions";
import type { Melding, MeldingStatus } from "@/lib/types";

const STATUS_OPTIES: MeldingStatus[] = ["gemeld", "in_behandeling", "opgelost"];

export function MeldingRow({
  melding,
  klantNaam,
  toegewezenNaam,
  magBijwerken,
}: {
  melding: Melding;
  klantNaam: string;
  toegewezenNaam: string | null;
  magBijwerken: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleStatus(status: MeldingStatus) {
    startTransition(async () => {
      await updateMeldingStatus(melding.id, status);
      router.refresh();
    });
  }

  function handleOppakken() {
    startTransition(async () => {
      await neemMeldingOp(melding.id);
      router.refresh();
    });
  }

  return (
    <div id={`melding-${melding.id}`} className="glass flex flex-col gap-2 rounded-2xl px-4 py-3">
      <div className="flex items-start gap-3">
        <AssetIcon categorie={melding.asset_naam} className="h-11 w-11" />
        <div className="min-w-0 flex-1">
          <p className="font-medium">
            {melding.asset_naam} <span className="font-normal text-slate-400">· {klantNaam}</span>
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-300">{melding.omschrijving}</p>
          <p className="mt-1 text-xs text-slate-400">
            {melding.gemeld_door ?? "Onbekend"} · {formatteerDatumTijd(melding.gemeld_op)}
            {toegewezenNaam ? ` · toegewezen aan ${toegewezenNaam}` : ""}
          </p>
          {melding.ai_advies && (
            <p className="mt-2 max-w-md rounded-md bg-sky-50 px-2.5 py-1.5 text-xs text-sky-900 dark:bg-sky-950/50 dark:text-sky-200">
              <span className="font-medium">AI-advies:</span> {melding.ai_advies}
            </p>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <UrgentieBadge urgentie={melding.urgentie} />
          <MeldingStatusBadge status={melding.status} />
        </div>
      </div>

      {(magBijwerken || !melding.toegewezen_aan) && (
        <div className="flex flex-wrap items-center gap-2 border-t border-[var(--glass-border)] pt-2">
          {!melding.toegewezen_aan && (
            <button
              type="button"
              disabled={isPending}
              onClick={handleOppakken}
              className="rounded-md border px-2.5 py-1 text-xs font-medium disabled:opacity-50"
            >
              Oppakken
            </button>
          )}
          {magBijwerken && (
            <select
              value={melding.status}
              disabled={isPending}
              onChange={(e) => handleStatus(e.target.value as MeldingStatus)}
              className="rounded-md border px-2 py-1 text-xs"
            >
              {STATUS_OPTIES.map((s) => (
                <option key={s} value={s}>
                  {MELDING_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          )}
        </div>
      )}
    </div>
  );
}
