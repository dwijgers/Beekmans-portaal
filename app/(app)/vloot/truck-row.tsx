"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AssetIcon } from "@/components/asset-icon";
import { EigendomBadge, TruckStatusBadge } from "@/components/status-badge";
import { wijsToe, beeindigToewijzing } from "./actions";
import type { Truck } from "@/lib/types";

export function TruckRow({
  truck,
  klantNaam,
  klanten,
  magBeheer,
}: {
  truck: Truck;
  klantNaam: string | null;
  klanten: { id: string; naam: string }[];
  magBeheer: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [toonToewijzen, setToonToewijzen] = useState(false);
  const [gekozenKlant, setGekozenKlant] = useState("");
  const [tarief, setTarief] = useState("");
  const router = useRouter();

  function handleToewijzen() {
    if (!gekozenKlant) return;
    startTransition(async () => {
      await wijsToe(truck.id, gekozenKlant, tarief ? Number(tarief) : null, null);
      setToonToewijzen(false);
      router.refresh();
    });
  }

  function handleBeeindigen() {
    startTransition(async () => {
      await beeindigToewijzing(truck.id);
      router.refresh();
    });
  }

  return (
    <div className="glass flex flex-col gap-2 rounded-2xl px-4 py-3">
      <div className="flex items-center gap-3">
        <AssetIcon categorie={truck.categorie ?? undefined} className="h-11 w-11" />
        <div className="min-w-0 flex-1">
          <p className="font-medium">
            {truck.merk} {truck.model}{" "}
            <span className="font-normal text-slate-400">· {truck.serienummer}</span>
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {klantNaam ?? "Geen klant gekoppeld"}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <EigendomBadge type={truck.eigendomstype} />
          <TruckStatusBadge status={truck.status} />
        </div>
      </div>

      {truck.eigendomstype === "verhuur" && magBeheer && (
        <div className="flex flex-wrap items-center gap-2 border-t border-[var(--glass-border)] pt-2 text-sm">
          {!toonToewijzen ? (
            <>
              <button type="button" onClick={() => setToonToewijzen(true)} className="rounded-md border px-2.5 py-1 text-xs font-medium">
                {truck.huidige_klant_id ? "Herverdelen" : "Toewijzen"}
              </button>
              {truck.huidige_klant_id && (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={handleBeeindigen}
                  className="rounded-md border px-2.5 py-1 text-xs font-medium text-red-700 disabled:opacity-50 dark:text-red-300"
                >
                  Terug naar pool
                </button>
              )}
            </>
          ) : (
            <>
              <select value={gekozenKlant} onChange={(e) => setGekozenKlant(e.target.value)} className="rounded-md border px-2 py-1 text-xs">
                <option value="">Kies een klant…</option>
                {klanten.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.naam}
                  </option>
                ))}
              </select>
              <input
                type="number"
                step="0.01"
                placeholder="Tarief/mnd"
                value={tarief}
                onChange={(e) => setTarief(e.target.value)}
                className="w-24 rounded-md border px-2 py-1 text-xs"
              />
              <button
                type="button"
                disabled={isPending || !gekozenKlant}
                onClick={handleToewijzen}
                className="rounded-md btn-primary px-2.5 py-1 text-xs font-medium disabled:opacity-50"
              >
                Bevestigen
              </button>
              <button type="button" onClick={() => setToonToewijzen(false)} className="text-xs underline">
                Annuleren
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
