"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { maakTruck } from "./actions";
import type { EigendomsType } from "@/lib/types";

export function TruckForm({ klanten }: { klanten: { id: string; naam: string }[] }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [eigendomstype, setEigendomstype] = useState<EigendomsType>("verkocht");
  const router = useRouter();

  function submit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        await maakTruck(formData);
        router.refresh();
        (document.getElementById("nieuwe-truck-form") as HTMLFormElement | null)?.reset();
        setEigendomstype("verkocht");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Aanmaken mislukt");
      }
    });
  }

  return (
    <form id="nieuwe-truck-form" action={submit} className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-2">
        <label className="flex flex-col gap-1 text-xs text-slate-500">
          Serienummer
          <input type="text" name="serienummer" required className="rounded-md border px-2 py-1.5 text-sm" />
        </label>
        <label className="flex flex-col gap-1 text-xs text-slate-500">
          Merk
          <input type="text" name="merk" className="rounded-md border px-2 py-1.5 text-sm" />
        </label>
        <label className="flex flex-col gap-1 text-xs text-slate-500">
          Model
          <input type="text" name="model" className="rounded-md border px-2 py-1.5 text-sm" />
        </label>
        <label className="flex flex-col gap-1 text-xs text-slate-500">
          Categorie
          <input type="text" name="categorie" placeholder="heftruck, ept, ..." className="rounded-md border px-2 py-1.5 text-sm" />
        </label>
      </div>
      <div className="flex flex-wrap items-end gap-2">
        <label className="flex flex-col gap-1 text-xs text-slate-500">
          Eigendomstype
          <select
            name="eigendomstype"
            value={eigendomstype}
            onChange={(e) => setEigendomstype(e.target.value as EigendomsType)}
            className="rounded-md border px-2 py-1.5 text-sm"
          >
            <option value="verkocht">Verkocht — klant is eigenaar</option>
            <option value="onderhoud">Onderhoud-only — was al van klant</option>
            <option value="verhuur">Verhuur/lease — Beekmans is eigenaar</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-slate-500">
          {eigendomstype === "verhuur" ? "Direct toewijzen aan (optioneel)" : "Klant"}
          <select name="klantId" required={eigendomstype !== "verhuur"} defaultValue="" className="rounded-md border px-2 py-1.5 text-sm">
            <option value="">{eigendomstype === "verhuur" ? "Nog niet toegewezen" : "Kies een klant…"}</option>
            {klanten.map((k) => (
              <option key={k.id} value={k.id}>
                {k.naam}
              </option>
            ))}
          </select>
        </label>
        {eigendomstype === "verhuur" && (
          <>
            <label className="flex flex-col gap-1 text-xs text-slate-500">
              Tarief (per maand)
              <input type="number" step="0.01" name="tarief" className="w-28 rounded-md border px-2 py-1.5 text-sm" />
            </label>
            <label className="flex flex-col gap-1 text-xs text-slate-500">
              Contractreferentie
              <input type="text" name="contractReferentie" className="rounded-md border px-2 py-1.5 text-sm" />
            </label>
          </>
        )}
        <button type="submit" disabled={isPending} className="rounded-md btn-primary px-3 py-1.5 text-sm font-medium disabled:opacity-50">
          {isPending ? "Bezig..." : "Truck toevoegen"}
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
