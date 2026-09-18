"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { maakOnderhoudsfactuur } from "./actions";

export function FactuurForm({
  meldingenZonderFactuur,
}: {
  meldingenZonderFactuur: { id: string; label: string }[];
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  if (meldingenZonderFactuur.length === 0) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">Geen opgeloste meldingen zonder factuur.</p>;
  }

  function submit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        await maakOnderhoudsfactuur(formData);
        router.refresh();
        (document.getElementById("nieuwe-factuur-form") as HTMLFormElement | null)?.reset();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Aanmaken mislukt");
      }
    });
  }

  return (
    <form id="nieuwe-factuur-form" action={submit} className="flex flex-wrap items-end gap-2">
      <label className="flex min-w-48 flex-col gap-1 text-xs text-slate-500">
        Melding
        <select name="meldingId" required className="rounded-md border px-2 py-1.5 text-sm">
          {meldingenZonderFactuur.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex min-w-48 flex-col gap-1 text-xs text-slate-500">
        Omschrijving
        <input type="text" name="omschrijving" required placeholder="Arbeid — sensor vervangen" className="rounded-md border px-2 py-1.5 text-sm" />
      </label>
      <label className="flex flex-col gap-1 text-xs text-slate-500">
        Aantal (uur)
        <input type="number" step="0.25" name="aantal" defaultValue="1" required className="w-24 rounded-md border px-2 py-1.5 text-sm" />
      </label>
      <label className="flex flex-col gap-1 text-xs text-slate-500">
        Tarief (per uur)
        <input type="number" step="0.01" name="tarief" required className="w-28 rounded-md border px-2 py-1.5 text-sm" />
      </label>
      <button type="submit" disabled={isPending} className="rounded-md btn-primary px-3 py-1.5 text-sm font-medium disabled:opacity-50">
        {isPending ? "Bezig..." : "Factuur aanmaken"}
      </button>
      {error && <p className="w-full text-sm text-red-600">{error}</p>}
    </form>
  );
}
