"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { FactuurStatusBadge } from "@/components/status-badge";
import { formatteerBedrag, formatteerDatumTijd } from "@/lib/datum";
import { keurFactuurGoed, zetFactuurBetaald } from "./actions";
import type { Factuur } from "@/lib/types";

export function FactuurRow({ factuur, klantNaam }: { factuur: Factuur; klantNaam: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div className="glass flex items-center justify-between gap-3 rounded-2xl px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="font-medium">
          {klantNaam} <span className="font-normal text-slate-400">· {factuur.type === "onderhoud" ? "Onderhoud" : "Verhuur"}</span>
        </p>
        <p className="text-xs text-slate-400">{formatteerDatumTijd(factuur.created_at)}</p>
      </div>
      <span className="font-medium tabular-nums">{formatteerBedrag(factuur.bedrag)}</span>
      <FactuurStatusBadge status={factuur.status} />
      {factuur.status === "ter_goedkeuring" && (
        <button
          type="button"
          disabled={isPending}
          onClick={() => startTransition(async () => { await keurFactuurGoed(factuur.id); router.refresh(); })}
          className="rounded-md btn-primary px-2.5 py-1 text-xs font-medium disabled:opacity-50"
        >
          Goedkeuren
        </button>
      )}
      {factuur.status === "verzonden" && (
        <button
          type="button"
          disabled={isPending}
          onClick={() => startTransition(async () => { await zetFactuurBetaald(factuur.id); router.refresh(); })}
          className="rounded-md border px-2.5 py-1 text-xs font-medium disabled:opacity-50"
        >
          Markeer betaald
        </button>
      )}
    </div>
  );
}
