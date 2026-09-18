import { createClient } from "@/lib/supabase/server";
import { requirePlannerOfBeheerder } from "@/lib/auth";
import { KlantForm } from "./klant-form";
import { KlantRow } from "./klant-row";

export default async function KlantenPage() {
  await requirePlannerOfBeheerder();
  const supabase = await createClient();

  const { data: klanten } = await supabase.from("klanten").select("*").order("naam");
  const { data: credentials } = await supabase.from("klant_credentials").select("klant_id, api_key");
  const apiKeyPerKlant = new Map((credentials ?? []).map((c) => [c.klant_id, c.api_key]));

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <h1 className="text-xl font-semibold">Klanten</h1>

      <section className="glass rounded-2xl p-4">
        <h2 className="mb-3 font-medium">Nieuwe klant</h2>
        <KlantForm />
      </section>

      <div className="flex flex-col gap-2.5">
        {(klanten ?? []).map((klant) => (
          <KlantRow key={klant.id} klant={klant} apiKey={apiKeyPerKlant.get(klant.id) ?? ""} />
        ))}
        {(klanten ?? []).length === 0 && (
          <p className="glass rounded-2xl px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Nog geen klanten.
          </p>
        )}
      </div>
    </div>
  );
}
