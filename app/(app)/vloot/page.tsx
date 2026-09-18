import { createClient } from "@/lib/supabase/server";
import { requireUser, isPlannerOfBeheerder } from "@/lib/auth";
import { TruckForm } from "./truck-form";
import { TruckRow } from "./truck-row";
import type { Truck } from "@/lib/types";

export default async function VlootPage() {
  const gebruiker = await requireUser();
  const magBeheer = isPlannerOfBeheerder(gebruiker.rol);
  const supabase = await createClient();

  const { data: trucks } = await supabase.from("trucks").select("*").order("serienummer");
  const { data: klanten } = await supabase.from("klanten").select("id, naam").order("naam");
  const klantNaamPerId = new Map((klanten ?? []).map((k) => [k.id, k.naam]));

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <h1 className="text-xl font-semibold">Vloot</h1>

      {magBeheer && (
        <section className="glass rounded-2xl p-4">
          <h2 className="mb-3 font-medium">Nieuwe truck registreren</h2>
          <TruckForm klanten={klanten ?? []} />
        </section>
      )}

      <div className="flex flex-col gap-2.5">
        {((trucks as Truck[] | null) ?? []).map((truck) => (
          <TruckRow
            key={truck.id}
            truck={truck}
            klantNaam={truck.huidige_klant_id ? klantNaamPerId.get(truck.huidige_klant_id) ?? null : null}
            klanten={klanten ?? []}
            magBeheer={magBeheer}
          />
        ))}
        {(trucks ?? []).length === 0 && (
          <p className="glass rounded-2xl px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Nog geen trucks geregistreerd.
          </p>
        )}
      </div>
    </div>
  );
}
