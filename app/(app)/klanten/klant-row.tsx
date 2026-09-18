"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateFactuurModus, zetKlantActief } from "./actions";
import type { Klant, FactuurModus } from "@/lib/types";

export function KlantRow({ klant, apiKey }: { klant: Klant; apiKey: string }) {
  const [isPending, startTransition] = useTransition();
  const [toonKey, setToonKey] = useState(false);
  const router = useRouter();

  function copyApiKey() {
    navigator.clipboard?.writeText(apiKey).catch(() => {});
  }

  function handleFactuurModus(modus: FactuurModus) {
    startTransition(async () => {
      await updateFactuurModus(klant.id, modus);
      router.refresh();
    });
  }

  return (
    <div className="glass flex flex-col gap-2 rounded-2xl px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link href={`/klanten/${klant.id}`} className="font-medium hover:underline">
          {klant.naam}
        </Link>
        <div className="flex items-center gap-2">
          <select
            value={klant.factuur_modus}
            disabled={isPending}
            onChange={(e) => handleFactuurModus(e.target.value as FactuurModus)}
            className="rounded-md border px-2 py-1 text-xs"
          >
            <option value="ter_goedkeuring">Ter goedkeuring</option>
            <option value="automatisch">Automatisch</option>
          </select>
          <button
            type="button"
            disabled={isPending}
            onClick={() => startTransition(async () => { await zetKlantActief(klant.id, !klant.actief); router.refresh(); })}
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              klant.actief
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300"
                : "bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-slate-400"
            }`}
          >
            {klant.actief ? "Actief" : "Gedeactiveerd"}
          </button>
        </div>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {klant.contactpersoon ?? "—"} {klant.email ? `· ${klant.email}` : ""} {klant.telefoon ? `· ${klant.telefoon}` : ""}
      </p>
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <span>Intake API-key:</span>
        <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono dark:bg-white/10">
          {toonKey ? apiKey : "•".repeat(16)}
        </code>
        <button type="button" onClick={() => setToonKey((v) => !v)} className="underline">
          {toonKey ? "verbergen" : "tonen"}
        </button>
        <button type="button" onClick={copyApiKey} className="underline">
          kopiëren
        </button>
      </div>
    </div>
  );
}
