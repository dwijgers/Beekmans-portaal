"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { maakKlant } from "./actions";

export function KlantForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function submit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        await maakKlant(formData);
        router.refresh();
        (document.getElementById("nieuwe-klant-form") as HTMLFormElement | null)?.reset();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Aanmaken mislukt");
      }
    });
  }

  return (
    <form id="nieuwe-klant-form" action={submit} className="flex flex-wrap items-end gap-2">
      <label className="flex flex-col gap-1 text-xs text-slate-500">
        Naam
        <input type="text" name="naam" required className="rounded-md border px-2 py-1.5 text-sm" />
      </label>
      <label className="flex flex-col gap-1 text-xs text-slate-500">
        Contactpersoon
        <input type="text" name="contactpersoon" className="rounded-md border px-2 py-1.5 text-sm" />
      </label>
      <label className="flex flex-col gap-1 text-xs text-slate-500">
        E-mailadres
        <input type="email" name="email" className="rounded-md border px-2 py-1.5 text-sm" />
      </label>
      <label className="flex flex-col gap-1 text-xs text-slate-500">
        Telefoon
        <input type="text" name="telefoon" className="rounded-md border px-2 py-1.5 text-sm" />
      </label>
      <label className="flex flex-col gap-1 text-xs text-slate-500">
        Facturatie
        <select name="factuurModus" defaultValue="ter_goedkeuring" className="rounded-md border px-2 py-1.5 text-sm">
          <option value="ter_goedkeuring">Ter goedkeuring</option>
          <option value="automatisch">Automatisch</option>
        </select>
      </label>
      <button type="submit" disabled={isPending} className="rounded-md btn-primary px-3 py-1.5 text-sm font-medium disabled:opacity-50">
        {isPending ? "Bezig..." : "Klant toevoegen"}
      </button>
      {error && <p className="w-full text-sm text-red-600">{error}</p>}
    </form>
  );
}
