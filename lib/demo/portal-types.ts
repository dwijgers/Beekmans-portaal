import type { MeldingStatus, Urgentie } from "@/lib/types";

/* Types voor de statische demo (/demo), overgenomen uit R'EMS. */

export type PortalFoto = {
  id: string;
  label: string;
  /** Echte foto-URL (live data) — heeft voorrang op `tint` als beide gezet zijn. */
  url?: string;
  /** Tailwind gradient-klassen, voor de demo-placeholders zonder echte foto. */
  tint?: string;
};

export type PortalHistorieItem = {
  datum: string;
  omschrijving: string;
  type: "melding" | "actie";
};

export type PortalMelding = {
  id: string;
  /** Klant-bedrijf waar de melding vandaan komt (bv. "R'EMS") — alleen relevant
   * voor het Beekmans-portaal, dat meldingen van meerdere klanten samenbrengt.
   * Op de per-leverancier live pagina (/leverancier) is er maar één klant en
   * blijft dit veld weg; de klant-filter verschijnt dan ook niet. */
  klant?: string;
  assetNaam: string;
  assetModel: string;
  /** Trefwoord voor het juiste truck-silhouet in <AssetIcon>; standaard wordt assetNaam gebruikt. */
  assetIconHint?: string;
  urgentie: Urgentie;
  status: MeldingStatus;
  omschrijving: string;
  aiDiagnose: string | null;
  fotos: PortalFoto[];
  gemeldDoor: string;
  gemeldOp: string;
  /** Alleen gezet als status "opgelost" is — voor de gemiddelde-oplostijd-tegel. */
  opgelostOp?: string;
  historie: PortalHistorieItem[];
  /** Optioneel: een door Beekmans voorgesteld reparatie-/levermoment, dat de
   * klant in het portaal met één klik kan accepteren — alleen relevant voor
   * het Beekmans-portaal (optie 4 uit het voorstel), niet voor de live
   * /leverancier-pagina. `geaccepteerd: null` = nog geen reactie van de klant. */
  voorgesteldeAfspraak?: { datum: string; geaccepteerd: boolean | null };
};
