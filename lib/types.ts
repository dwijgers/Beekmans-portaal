export type GebruikerRol = "monteur" | "planner" | "beheerder";
export type EigendomsType = "verkocht" | "onderhoud" | "verhuur";
export type Eigenaar = "beekmans" | "klant";
export type TruckStatus = "bij_klant" | "beschikbaar" | "in_onderhoud" | "buiten_dienst";
export type MeldingBron = "intake" | "handmatig";
export type Urgentie = "laag" | "gemiddeld" | "hoog" | "kritiek";
export type MeldingStatus = "gemeld" | "in_behandeling" | "opgelost";
export type FactuurType = "onderhoud" | "verhuur";
export type FactuurStatus = "concept" | "ter_goedkeuring" | "goedgekeurd" | "verzonden" | "betaald";
export type FactuurModus = "automatisch" | "ter_goedkeuring";

export type Gebruiker = {
  id: string;
  naam: string;
  rol: GebruikerRol;
  created_at: string;
};

export type Klant = {
  id: string;
  naam: string;
  contactpersoon: string | null;
  email: string | null;
  telefoon: string | null;
  factuur_modus: FactuurModus;
  actief: boolean;
  created_at: string;
};

/** Los van Klant gehouden — alleen leesbaar voor planner/beheerder, zie RLS in 0001_init.sql. */
export type KlantCredentials = {
  klant_id: string;
  api_key: string;
  webhook_secret: string;
  created_at: string;
};

export type Truck = {
  id: string;
  serienummer: string;
  merk: string | null;
  model: string | null;
  categorie: string | null;
  eigendomstype: EigendomsType;
  eigenaar: Eigenaar;
  huidige_klant_id: string | null;
  status: TruckStatus;
  created_at: string;
};

export type TruckToewijzing = {
  id: string;
  truck_id: string;
  klant_id: string;
  vanaf: string;
  tot: string | null;
  tarief: number | null;
  contract_referentie: string | null;
  created_at: string;
};

export type Melding = {
  id: string;
  klant_id: string;
  truck_id: string | null;
  bron: MeldingBron;
  externe_referentie: string | null;
  asset_naam: string;
  omschrijving: string | null;
  urgentie: Urgentie;
  status: MeldingStatus;
  ai_advies: string | null;
  gemeld_door: string | null;
  gemeld_op: string;
  opgelost_op: string | null;
  toegewezen_aan: string | null;
  created_at: string;
};

export type MeldingFoto = {
  id: string;
  melding_id: string;
  url: string;
  created_at: string;
};

export type Factuur = {
  id: string;
  klant_id: string;
  type: FactuurType;
  periode_van: string | null;
  periode_tot: string | null;
  melding_id: string | null;
  status: FactuurStatus;
  bedrag: number;
  goedgekeurd_door: string | null;
  goedgekeurd_op: string | null;
  verzonden_op: string | null;
  created_at: string;
};

export type Factuurregel = {
  id: string;
  factuur_id: string;
  omschrijving: string;
  aantal: number;
  tarief: number;
  bedrag: number;
};

type TableDef<Row> = {
  Row: Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      gebruikers: TableDef<Gebruiker>;
      klanten: TableDef<Klant>;
      klant_credentials: TableDef<KlantCredentials>;
      trucks: TableDef<Truck>;
      truck_toewijzingen: TableDef<TruckToewijzing>;
      meldingen: TableDef<Melding>;
      melding_fotos: TableDef<MeldingFoto>;
      facturen: TableDef<Factuur>;
      factuurregels: TableDef<Factuurregel>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
