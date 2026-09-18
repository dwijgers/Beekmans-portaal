import { createClient } from "@/lib/supabase/server";
import { MeldingenDashboard, type DashboardMelding } from "@/components/meldingen-dashboard";
import type { Melding } from "@/lib/types";

type MeldingMetRelaties = Melding & {
  klanten: { naam: string } | null;
  trucks: { serienummer: string } | null;
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: klanten } = await supabase.from("klanten").select("id, naam").order("naam");
  const { data: meldingenRaw } = await supabase
    .from("meldingen")
    .select("*, klanten(naam), trucks(serienummer)")
    .order("gemeld_op", { ascending: false })
    .returns<MeldingMetRelaties[]>();

  const meldingen: DashboardMelding[] = (meldingenRaw ?? []).map((m) => ({
    id: m.id,
    klantId: m.klant_id,
    klantNaam: m.klanten?.naam ?? "Onbekende klant",
    assetNaam: m.asset_naam,
    truckSerienummer: m.trucks?.serienummer ?? null,
    omschrijving: m.omschrijving,
    urgentie: m.urgentie,
    status: m.status,
    gemeldDoor: m.gemeld_door,
    gemeldOp: m.gemeld_op,
    opgelostOp: m.opgelost_op,
  }));

  return <MeldingenDashboard meldingen={meldingen} klanten={klanten ?? []} />;
}
