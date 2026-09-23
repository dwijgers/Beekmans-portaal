import type { PortalMelding } from "@/lib/demo/portal-types";

/**
 * Losse, statische demo-data voor de demo-pagina (/demo), verhuisd vanuit
 * R'EMS. Geen koppeling met Supabase of echte meldingen — puur om te laten
 * zien hoe Beekmans meldingen van hun klanten in één portaal te zien krijgt.
 *
 * Eén leverancier (Beekmans), meldingen van meerdere klant-bedrijven (R'EMS,
 * Van Doorn Logistiek, Dekker Warehousing) — dat is het echte model:
 * Beekmans' eigen portaal ontvangt meldingen van meerdere klant-CMMS-
 * systemen (R'EMS is klant 1 van de N), niet losse, per-leverancier
 * afgeschermde portalen.
 */

export type { PortalMelding, PortalFoto, PortalHistorieItem } from "@/lib/demo/portal-types";

export type PortalKlant = {
  naam: string;
  monogram: string;
  /** Vloot in beheer bij deze klant — puur voor de klant-overzichtskaarten, niet afgeleid uit meldingen. */
  aantalAssets: number;
  sindsJaar: number;
};

export type PortalTruck = {
  id: string;
  klant: string;
  naam: string;
  model: string;
  status: "actief" | "buiten_dienst";
  laatsteOnderhoud: string;
};

export type PortalOnderdeel = {
  naam: string;
  voorraad: number;
  minimum: number;
  /** Ontbreekt = generiek onderdeel, breed inzetbaar over klanten heen. */
  klant?: string;
};

export type PortalVerhuurTruck = {
  id: string;
  naam: string;
  model: string;
  /** Ontbreekt = staat op voorraad bij Beekmans zelf, nog aan niemand toegewezen. */
  klant?: string;
  /** Sinds wanneer deze truck in de huidige status staat (toegewezen, of terug op voorraad). */
  sinds: string;
  /** Klanten die deze truck eerder gehuurd hebben — koppelhistorie, ook zichtbaar als 'ie weer op voorraad staat. */
  eerdereKlanten: string[];
};

export type PortalFactuur = {
  id: string;
  klant: string;
  omschrijving: string;
  bedrag: number;
  status: "concept" | "verzonden" | "betaald";
  datum: string;
};

export const PORTAL_KLANTEN: PortalKlant[] = [
  { naam: "R'EMS", monogram: "R", aantalAssets: 14, sindsJaar: 2021 },
  { naam: "Van Doorn Logistiek", monogram: "V", aantalAssets: 9, sindsJaar: 2023 },
  { naam: "Dekker Warehousing", monogram: "D", aantalAssets: 6, sindsJaar: 2025 },
  { naam: "Jansen Transport", monogram: "J", aantalAssets: 11, sindsJaar: 2022 },
  { naam: "De Boer Logistiek", monogram: "B", aantalAssets: 18, sindsJaar: 2020 },
  { naam: "Verhoeven Warehousing", monogram: "V", aantalAssets: 5, sindsJaar: 2024 },
  { naam: "Hendriks Distributie", monogram: "H", aantalAssets: 22, sindsJaar: 2019 },
  { naam: "Bakker Fulfilment", monogram: "B", aantalAssets: 4, sindsJaar: 2026 },
  { naam: "Smits Cargo", monogram: "S", aantalAssets: 9, sindsJaar: 2021 },
  { naam: "Peeters Groep", monogram: "P", aantalAssets: 7, sindsJaar: 2023 },
];

export const PORTAL_MELDINGEN: PortalMelding[] = [
  {
    id: "m-1042",
    klant: "R'EMS",
    assetNaam: "Heftruck 07",
    assetModel: "Linde H25 D",
    urgentie: "kritiek",
    status: "gemeld",
    omschrijving:
      "Truck maakt een hard tikkend geluid uit de hefmast zodra de vork boven de 2 meter komt. Bij de laatste keer stopte het heffen helemaal en zakte de vork een stukje terug.",
    aiDiagnose:
      "Patroon komt overeen met slijtage of onvoldoende smering van de mastkettingen bij grotere hefhoogte. Geadviseerd: mastkettingen en -rollen laten inspecteren voor verder gebruik boven 2 m; truck tot die tijd alleen inzetten op lage hefhoogte.",
    fotos: [
      { id: "f1", label: "Mast, zijaanzicht", tint: "from-amber-700 to-amber-950" },
      { id: "f2", label: "Ketting close-up", tint: "from-stone-600 to-stone-900" },
    ],
    gemeldDoor: "Sanne de Groot (teamleider)",
    gemeldOp: "2026-09-17T08:14:00+02:00",
    historie: [
      { datum: "2026-03-02T09:00:00+02:00", omschrijving: "Periodiek onderhoud uitgevoerd, mastketting gesmeerd.", type: "actie" },
      { datum: "2025-11-18T14:20:00+01:00", omschrijving: "Band voorzijde vervangen na slijtage.", type: "actie" },
    ],
  },
  {
    id: "m-1041",
    klant: "R'EMS",
    assetNaam: "Reachtruck 03",
    assetModel: "Toyota RRE160H",
    urgentie: "hoog",
    status: "in_behandeling",
    omschrijving:
      "Foutcode E-42 op display sinds vanochtend, truck rijdt maar hefhoogte is beperkt tot ca. 1,5 meter. Vaker uitgezet en weer aangezet, code blijft terugkomen.",
    aiDiagnose:
      "Foutcode E-42 wijst bij dit model doorgaans op een hydrauliek-sensorstoring in het hefcircuit. Waarschijnlijk defecte hoogtesensor of loszittende connector. Vervanging/herijking van de sensor door een monteur is aannemelijk nodig; geen indicatie van acuut veiligheidsrisico bij laag heffen.",
    fotos: [{ id: "f3", label: "Display met foutcode", tint: "from-sky-700 to-sky-950" }],
    gemeldDoor: "Mark Peeters (teamleider)",
    gemeldOp: "2026-09-16T11:02:00+02:00",
    historie: [
      { datum: "2026-06-10T10:00:00+02:00", omschrijving: "Jaarlijkse keuring, goedgekeurd.", type: "actie" },
      { datum: "2026-01-22T08:45:00+01:00", omschrijving: "Melding: piepend geluid bij optillen — verholpen na smeerbeurt.", type: "melding" },
    ],
  },
  {
    id: "v-2051",
    klant: "Van Doorn Logistiek",
    assetNaam: "EPT 04",
    assetModel: "BT Levio LWE140",
    urgentie: "kritiek",
    status: "gemeld",
    omschrijving:
      "Truck remt niet meer af bij het loslaten van de dissel, rijdt gewoon door. Direct uit gebruik genomen.",
    aiDiagnose:
      "Uitblijvende afremming bij het loslaten van de dissel duidt op een defecte dodemansfunctie/rem — dit is een direct veiligheidsrisico voor de bestuurder en omstanders. Truck moet buiten gebruik blijven tot een monteur de remfunctie heeft getest en hersteld.",
    fotos: [{ id: "v1", label: "Dissel, close-up", tint: "from-red-700 to-red-950" }],
    gemeldDoor: "Petra van Lint (teamleider)",
    gemeldOp: "2026-09-17T14:05:00+02:00",
    historie: [],
  },
  {
    id: "m-1039",
    klant: "R'EMS",
    assetNaam: "Laadstation E3",
    assetModel: "Vaste laadzuil, kanaal 3",
    urgentie: "gemiddeld",
    status: "in_behandeling",
    omschrijving:
      "Stekker van laadstation 3 wordt erg warm tijdens het laden, medewerkers durven 'm niet meer te gebruiken. Andere stations op dezelfde groep werken wel normaal.",
    aiDiagnose:
      "Sterke lokale warmteontwikkeling bij één stekker terwijl overige stations normaal functioneren wijst op een slecht contact of beginnende schade aan de connector/kabel, niet op een probleem met de groep. Advies: station direct buiten gebruik stellen tot een elektricien de stekker en kabel heeft gecontroleerd.",
    fotos: [
      { id: "f4", label: "Stekker laadstation", tint: "from-orange-700 to-orange-950" },
      { id: "f5", label: "Aansluitpunt", tint: "from-zinc-600 to-zinc-900" },
    ],
    gemeldDoor: "Ilse Bakker (teamleider)",
    gemeldOp: "2026-09-15T16:40:00+02:00",
    historie: [{ datum: "2025-09-01T09:00:00+02:00", omschrijving: "Installatie in gebruik genomen.", type: "actie" }],
  },
  {
    id: "v-2049",
    klant: "Van Doorn Logistiek",
    assetNaam: "Laadstation N2",
    assetModel: "Vaste laadzuil, noordhal",
    urgentie: "gemiddeld",
    status: "gemeld",
    omschrijving: "Laadstation start om de paar minuten opnieuw op, truck laadt daardoor maar half op per nacht.",
    aiDiagnose:
      "Periodiek herstarten tijdens het laden wijst eerder op een instabiele voeding of ooververhitting van de lader zelf dan op de truck — advies: lader laten controleren op ventilatie/voeding voor de volgende nachtlading.",
    fotos: [],
    gemeldDoor: "Joris Kramer (medewerker)",
    gemeldOp: "2026-09-14T07:40:00+02:00",
    historie: [{ datum: "2026-02-04T09:00:00+02:00", omschrijving: "Periodieke controle laadstations, alles akkoord.", type: "actie" }],
  },
  {
    id: "v-2044",
    klant: "Van Doorn Logistiek",
    assetNaam: "Strapmachine 1",
    assetModel: "Mosca RO-M",
    urgentie: "hoog",
    status: "in_behandeling",
    omschrijving: "Strapmachine breekt de band steeds af halverwege de cyclus, ongeveer 1 op de 3 pallets.",
    aiDiagnose:
      "Band die halverwege de cyclus afbreekt wijst vaak op een verkeerd ingestelde spanning of versleten geleiderail. Advies: spanning verlagen als tijdelijke maatregel en geleiderail laten inspecteren.",
    fotos: [{ id: "v2", label: "Afgebroken band", tint: "from-amber-700 to-amber-950" }],
    gemeldDoor: "Petra van Lint (teamleider)",
    gemeldOp: "2026-09-10T11:15:00+02:00",
    historie: [],
  },
  {
    id: "m-1037",
    klant: "R'EMS",
    assetNaam: "Heftruck 03",
    assetModel: "Linde H25 D",
    urgentie: "hoog",
    status: "gemeld",
    omschrijving: "Hydrauliekolie lekt zichtbaar onder de truck, plas wordt elke dag groter.",
    aiDiagnose:
      "Zichtbare, groeiende olieplas wijst op een lekkende slang of afdichting onder druk. Geadviseerd: truck niet meer inzetten tot een monteur het lek heeft opgespoord, om verlies van hefkracht tijdens gebruik te voorkomen.",
    fotos: [{ id: "f8", label: "Olieplas onder truck", tint: "from-stone-700 to-stone-950" }],
    gemeldDoor: "Sanne de Groot (teamleider)",
    gemeldOp: "2026-09-08T09:20:00+02:00",
    historie: [],
  },
  {
    id: "v-2038",
    klant: "Van Doorn Logistiek",
    assetNaam: "Bakwagen 2",
    assetModel: "Iveco Daily 35C16",
    urgentie: "laag",
    status: "in_behandeling",
    omschrijving: "Zijspiegel rechts staat los in de behuizing, trilt mee tijdens het rijden.",
    aiDiagnose: "Cosmetisch/comfort-issue zonder invloed op de veiligheid van de spiegel zelf; kan bij een reguliere onderhoudsbeurt mee.",
    fotos: [],
    gemeldDoor: "Joris Kramer (medewerker)",
    gemeldOp: "2026-09-03T15:50:00+02:00",
    historie: [],
  },
  {
    id: "m-1035",
    klant: "R'EMS",
    assetNaam: "EPT 12",
    assetModel: "Jungheinrich EJE M15",
    urgentie: "laag",
    status: "gemeld",
    omschrijving:
      "Kunststof beschermkap bij het bedieningspaneel is losgebroken aan één kant. Truck werkt verder prima, alleen de kap zit los.",
    aiDiagnose:
      "Uitsluitend cosmetische/behuizingsschade zonder invloed op de werking. Kan gecombineerd worden met een volgende geplande onderhoudsbeurt; geen spoedactie nodig.",
    fotos: [{ id: "f6", label: "Losse beschermkap", tint: "from-slate-600 to-slate-900" }],
    gemeldDoor: "Tom Willemsen (medewerker)",
    gemeldOp: "2026-09-01T13:25:00+02:00",
    historie: [],
  },
  {
    id: "v-2030",
    klant: "Van Doorn Logistiek",
    assetNaam: "EPT 04",
    assetModel: "BT Levio LWE140",
    urgentie: "gemiddeld",
    status: "opgelost",
    omschrijving: "Display geeft geen batterijpercentage meer weer, truck rijdt verder normaal.",
    aiDiagnose: "Vermoedelijk een loszittende sensor- of displaykabel; geen invloed op rijden/heffen, wel vervelend voor planning van laadmomenten.",
    fotos: [],
    gemeldDoor: "Petra van Lint (teamleider)",
    gemeldOp: "2026-08-22T10:30:00+02:00",
    opgelostOp: "2026-08-25T13:00:00+02:00",
    historie: [{ datum: "2026-08-25T13:00:00+02:00", omschrijving: "Displaykabel opnieuw aangesloten door leverancier, werkt weer.", type: "actie" }],
  },
  {
    id: "m-1028",
    klant: "R'EMS",
    assetNaam: "Heftruck 07",
    assetModel: "Linde H25 D",
    urgentie: "gemiddeld",
    status: "opgelost",
    omschrijving: "Lichte olielekkage onder de truck geconstateerd bij het opstarten in de ochtend.",
    aiDiagnose:
      "Kleine lekkage bij koude start kan duiden op een verharde afdichting; geadviseerd te laten beoordelen bij eerstvolgende onderhoudsmoment, niet acuut.",
    fotos: [],
    gemeldDoor: "Sanne de Groot (teamleider)",
    gemeldOp: "2026-08-29T07:55:00+02:00",
    opgelostOp: "2026-08-30T10:15:00+02:00",
    historie: [{ datum: "2026-08-30T10:15:00+02:00", omschrijving: "Afdichting vervangen door leverancier, lekkage verholpen.", type: "actie" }],
  },
  {
    id: "v-2019",
    klant: "Van Doorn Logistiek",
    assetNaam: "Strapmachine 1",
    assetModel: "Mosca RO-M",
    urgentie: "hoog",
    status: "opgelost",
    omschrijving: "Machine stopt volledig met een foutcode E-9, geen enkele pallet kan meer worden gestrapt.",
    aiDiagnose: "Foutcode E-9 wijst bij dit model doorgaans op een vastgelopen bandtoevoer; machine buiten gebruik stellen tot een monteur de toevoer heeft vrijgemaakt.",
    fotos: [{ id: "v3", label: "Display met E-9", tint: "from-sky-700 to-sky-950" }],
    gemeldDoor: "Joris Kramer (medewerker)",
    gemeldOp: "2026-08-05T08:50:00+02:00",
    opgelostOp: "2026-08-06T16:20:00+02:00",
    historie: [{ datum: "2026-08-06T16:20:00+02:00", omschrijving: "Bandtoevoer vrijgemaakt en machine getest door leverancier.", type: "actie" }],
  },
  {
    id: "m-1019",
    klant: "R'EMS",
    assetNaam: "Hoge orderpicker 02",
    assetModel: "Still EK-X 515k",
    assetIconHint: "hhopt",
    urgentie: "kritiek",
    status: "opgelost",
    omschrijving:
      "Kooi blijft af en toe hangen op ongeveer 4 meter hoogte, operator moest de noodstop gebruiken om veilig naar beneden te komen.",
    aiDiagnose:
      "Onverwacht blokkeren van de kooi op hoogte is een veiligheidskritiek signaal; sterke aanwijzing voor een probleem met de hefkabel, geleiderail of eindschakelaar. Truck direct buiten dienst gesteld in afwachting van inspectie geadviseerd.",
    fotos: [{ id: "f7", label: "Mast en kooi", tint: "from-red-700 to-red-950" }],
    gemeldDoor: "Rick Jansen (teamleider)",
    gemeldOp: "2026-08-12T09:10:00+02:00",
    opgelostOp: "2026-08-15T09:00:00+02:00",
    historie: [
      { datum: "2026-08-13T08:00:00+02:00", omschrijving: "Truck buiten dienst gesteld direct na melding.", type: "actie" },
      { datum: "2026-08-14T15:30:00+02:00", omschrijving: "Geleiderail vervangen en eindschakelaar afgesteld door leverancier.", type: "actie" },
      { datum: "2026-08-15T09:00:00+02:00", omschrijving: "Truck getest en weer vrijgegeven voor gebruik.", type: "actie" },
    ],
  },
  {
    id: "d-3001",
    klant: "Dekker Warehousing",
    assetNaam: "Heftruck D2",
    assetModel: "Toyota Traigo 48",
    urgentie: "kritiek",
    status: "gemeld",
    omschrijving:
      "Truck verliest plotseling hydrauliekdruk tijdens het heffen, vork zakt vanzelf terug zodra de hendel wordt losgelaten.",
    aiDiagnose:
      "Zelfstandig terugzakken van de vork bij loslaten van de hendel wijst op een lekkende hefcilinder of defecte terugslagklep — een direct veiligheidsrisico bij het heffen op hoogte. Truck buiten gebruik stellen tot een monteur het hydraulieksysteem heeft nagekeken.",
    fotos: [{ id: "d1", label: "Hefcilinder", tint: "from-amber-700 to-amber-950" }],
    gemeldDoor: "Femke Dekker (teamleider)",
    gemeldOp: "2026-09-17T10:30:00+02:00",
    historie: [],
  },
  {
    id: "d-3002",
    klant: "Dekker Warehousing",
    assetNaam: "Reachtruck D1",
    assetModel: "Crown ESR 1000",
    urgentie: "gemiddeld",
    status: "in_behandeling",
    omschrijving: "Claxon doet het niet meer, verder rijdt en heft de truck normaal.",
    aiDiagnose:
      "Geïsoleerd elektrisch defect (zekering of bedrading claxon), geen invloed op rijden/heffen. Kan bij eerstvolgende bezoek meegenomen worden, geen spoedactie nodig.",
    fotos: [],
    gemeldDoor: "Bram Hoekstra (medewerker)",
    gemeldOp: "2026-09-11T09:15:00+02:00",
    historie: [],
  },
  {
    id: "d-3003",
    klant: "Dekker Warehousing",
    assetNaam: "EPT D3",
    assetModel: "Hyster P2.0",
    urgentie: "laag",
    status: "opgelost",
    omschrijving: "Wiel maakt een piepend geluid bij het draaien, verder geen problemen.",
    aiDiagnose: "Vermoedelijk droog wiellager; smeren of vervangen bij regulier onderhoud volstaat.",
    fotos: [],
    gemeldDoor: "Femke Dekker (teamleider)",
    gemeldOp: "2026-08-20T13:00:00+02:00",
    opgelostOp: "2026-08-21T11:00:00+02:00",
    historie: [{ datum: "2026-08-21T11:00:00+02:00", omschrijving: "Wiellager gesmeerd door leverancier, geluid weg.", type: "actie" }],
  },
  {
    id: "jt-4001",
    klant: "Jansen Transport",
    assetNaam: "Heftruck J3",
    assetModel: "Linde H30 D",
    urgentie: "kritiek",
    status: "gemeld",
    omschrijving: "Truck slaat af zodra de vork wordt belast, motor valt helemaal stil.",
    aiDiagnose:
      "Afslaan specifiek bij belasting wijst op een overbelastingsbeveiliging die aanslaat, of een falende hydrauliekpomp onder druk. Truck buiten gebruik houden tot een monteur de pomp en beveiliging heeft gecontroleerd.",
    fotos: [],
    gemeldDoor: "Willem Jansen (teamleider)",
    gemeldOp: "2026-09-16T08:00:00+02:00",
    historie: [],
  },
  {
    id: "jt-4002",
    klant: "Jansen Transport",
    assetNaam: "Bakwagen J1",
    assetModel: "Mercedes Atego",
    urgentie: "gemiddeld",
    status: "in_behandeling",
    omschrijving: "Laadklep gaat met horten en stoten omhoog, soms moet het twee keer geprobeerd worden.",
    aiDiagnose: "Waarschijnlijk lucht in het hydraulieksysteem van de laadklep; ontluchten lost dit meestal op.",
    fotos: [],
    gemeldDoor: "Nienke de Wit (medewerker)",
    gemeldOp: "2026-09-12T10:30:00+02:00",
    historie: [],
  },
  {
    id: "jt-4003",
    klant: "Jansen Transport",
    assetNaam: "Heftruck J1",
    assetModel: "Toyota 8FBE20",
    urgentie: "laag",
    status: "opgelost",
    omschrijving: "Achteruitrijalarm is nauwelijks hoorbaar geworden.",
    aiDiagnose: "Vermoedelijk verstopte of verzwakte zoemer; vervangen is een kleine ingreep.",
    fotos: [],
    gemeldDoor: "Willem Jansen (teamleider)",
    gemeldOp: "2026-08-18T09:00:00+02:00",
    opgelostOp: "2026-08-19T14:00:00+02:00",
    historie: [{ datum: "2026-08-19T14:00:00+02:00", omschrijving: "Zoemer vervangen door leverancier.", type: "actie" }],
  },
  {
    id: "db-5001",
    klant: "De Boer Logistiek",
    assetNaam: "Reachtruck B2",
    assetModel: "Linde R14",
    urgentie: "hoog",
    status: "gemeld",
    omschrijving: "Mast schokt zichtbaar tijdens het heffen boven 3 meter, operator durft niet hoger te gaan.",
    aiDiagnose:
      "Schokkend heffen op hoogte wijst vaak op slijtage in de hefkettingen of een onregelmatig werkende hefcilinder. Geadviseerd: niet boven 3 meter inzetten tot inspectie.",
    fotos: [],
    gemeldDoor: "Karin de Boer (teamleider)",
    gemeldOp: "2026-09-15T13:20:00+02:00",
    historie: [],
  },
  {
    id: "db-5002",
    klant: "De Boer Logistiek",
    assetNaam: "Heftruck B5",
    assetModel: "Linde H25 D",
    urgentie: "gemiddeld",
    status: "in_behandeling",
    omschrijving: "Lekkage bij de vorkenversteller, kleine olieplekken op de vloer.",
    aiDiagnose: "Waarschijnlijk verharde afdichtring bij de versteller; vervangen voorkomt verdere lekkage.",
    fotos: [],
    gemeldDoor: "Erik Willemsen (medewerker)",
    gemeldOp: "2026-09-09T11:00:00+02:00",
    historie: [],
  },
  {
    id: "db-5003",
    klant: "De Boer Logistiek",
    assetNaam: "EPT B1",
    assetModel: "BT Levio LWE160",
    urgentie: "laag",
    status: "opgelost",
    omschrijving: "Display valt af en toe kort uit tijdens het rijden.",
    aiDiagnose: "Vermoedelijk een loszittende stekker bij het display; vastzetten verhelpt dit doorgaans.",
    fotos: [],
    gemeldDoor: "Karin de Boer (teamleider)",
    gemeldOp: "2026-08-25T08:40:00+02:00",
    opgelostOp: "2026-08-26T10:00:00+02:00",
    historie: [{ datum: "2026-08-26T10:00:00+02:00", omschrijving: "Stekker vastgezet, geen uitval meer.", type: "actie" }],
  },
  {
    id: "vw-6001",
    klant: "Verhoeven Warehousing",
    assetNaam: "Heftruck V1",
    assetModel: "Jungheinrich EFG 425",
    urgentie: "hoog",
    status: "gemeld",
    omschrijving: "Stuurbekrachtiging valt af en toe weg, truck wordt dan zwaar te sturen.",
    aiDiagnose: "Wegvallende stuurbekrachtiging wijst op een elektrisch contactprobleem of falende stuurmotor. Geadviseerd op korte termijn te laten nakijken vanwege het risico bij zwaar sturen.",
    fotos: [],
    gemeldDoor: "Tom Verhoeven (teamleider)",
    gemeldOp: "2026-09-14T15:10:00+02:00",
    historie: [],
  },
  {
    id: "vw-6002",
    klant: "Verhoeven Warehousing",
    assetNaam: "Orderpicker V2",
    assetModel: "Still EK-X 513",
    urgentie: "gemiddeld",
    status: "opgelost",
    omschrijving: "Hefplatform stopt willekeurig halverwege, moet opnieuw gestart worden.",
    aiDiagnose: "Vermoedelijk een storende eindschakelaar; herijken lost dit meestal op.",
    fotos: [],
    gemeldDoor: "Sanne Bos (medewerker)",
    gemeldOp: "2026-08-30T09:00:00+02:00",
    opgelostOp: "2026-08-31T13:00:00+02:00",
    historie: [{ datum: "2026-08-31T13:00:00+02:00", omschrijving: "Eindschakelaar opnieuw afgesteld.", type: "actie" }],
  },
  {
    id: "hd-7001",
    klant: "Hendriks Distributie",
    assetNaam: "Heftruck H8",
    assetModel: "Toyota Traigo 80",
    urgentie: "kritiek",
    status: "in_behandeling",
    omschrijving: "Remmen reageren vertraagd, truck heeft langere remweg dan normaal.",
    aiDiagnose: "Vertraagde remreactie is een direct veiligheidsrisico — waarschijnlijk lucht in het remcircuit of versleten remvoering. Truck tot reparatie alleen op lage snelheid inzetten.",
    fotos: [],
    gemeldDoor: "Peter Hendriks (teamleider)",
    gemeldOp: "2026-09-13T07:30:00+02:00",
    historie: [],
  },
  {
    id: "hd-7002",
    klant: "Hendriks Distributie",
    assetNaam: "Reachtruck H3",
    assetModel: "Toyota RRE160H",
    urgentie: "gemiddeld",
    status: "gemeld",
    omschrijving: "Vorken staan niet meer helemaal recht, lichte scheefstand zichtbaar.",
    aiDiagnose: "Lichte scheefstand van de vorken wijst meestal op een verstelling die is verschoven; opnieuw uitlijnen volstaat doorgaans.",
    fotos: [],
    gemeldDoor: "Lotte Mulder (medewerker)",
    gemeldOp: "2026-09-11T14:00:00+02:00",
    historie: [],
  },
  {
    id: "hd-7003",
    klant: "Hendriks Distributie",
    assetNaam: "Bakwagen H2",
    assetModel: "DAF LF",
    urgentie: "laag",
    status: "opgelost",
    omschrijving: "Zijruit bestuurdersdeur sluit niet helemaal goed, tochtgeluid bij rijden.",
    aiDiagnose: "Cosmetisch/comfort-issue, geen invloed op veiligheid; bij volgende onderhoudsbeurt mee te nemen.",
    fotos: [],
    gemeldDoor: "Peter Hendriks (teamleider)",
    gemeldOp: "2026-08-10T09:00:00+02:00",
    opgelostOp: "2026-08-12T11:00:00+02:00",
    historie: [{ datum: "2026-08-12T11:00:00+02:00", omschrijving: "Rubberafdichting vervangen.", type: "actie" }],
  },
  {
    id: "bf-8001",
    klant: "Bakker Fulfilment",
    assetNaam: "EPT F1",
    assetModel: "Hyster P2.0",
    urgentie: "gemiddeld",
    status: "gemeld",
    omschrijving: "Laadindicator van de accu klopt niet meer, geeft vol aan terwijl de truck snel leegloopt.",
    aiDiagnose: "Vermoedelijk een verouderde of losse accukabel-verbinding waardoor de meting niet klopt; controle van de bekabeling geadviseerd.",
    fotos: [],
    gemeldDoor: "Roos Faber (teamleider)",
    gemeldOp: "2026-09-10T10:00:00+02:00",
    historie: [],
  },
  {
    id: "sc-9001",
    klant: "Smits Cargo",
    assetNaam: "Heftruck S4",
    assetModel: "Linde H20 D",
    urgentie: "hoog",
    status: "gemeld",
    omschrijving: "Sterke dieselgeur in het rijdershokje, ruikbaar zodra de motor warm draait.",
    aiDiagnose: "Een dieselgeur bij een warme motor kan wijzen op een lekkend brandstofleiding of -filter — geadviseerd op korte termijn te laten controleren vanwege brandgevaar.",
    fotos: [],
    gemeldDoor: "Daan Smits (teamleider)",
    gemeldOp: "2026-09-08T13:45:00+02:00",
    historie: [],
  },
  {
    id: "sc-9002",
    klant: "Smits Cargo",
    assetNaam: "Strapmachine S1",
    assetModel: "Mosca RO-M",
    urgentie: "laag",
    status: "in_behandeling",
    omschrijving: "Machine maakt een piepend geluid bij het aanspannen van de band.",
    aiDiagnose: "Vermoedelijk een droge aandrijfriem; smeren of vervangen bij eerstvolgend bezoek volstaat.",
    fotos: [],
    gemeldDoor: "Iris Groen (medewerker)",
    gemeldOp: "2026-09-05T09:30:00+02:00",
    historie: [],
  },
  {
    id: "pg-1101",
    klant: "Peeters Groep",
    assetNaam: "Heftruck P2",
    assetModel: "Still RX 60",
    urgentie: "gemiddeld",
    status: "gemeld",
    omschrijving: "Claxon werkt met tussenpozen, soms wel en soms niet.",
    aiDiagnose: "Wisselend werkende claxon wijst meestal op een loszittende connector of beginnend defecte schakelaar.",
    fotos: [],
    gemeldDoor: "Bram Peeters (teamleider)",
    gemeldOp: "2026-09-07T08:15:00+02:00",
    historie: [],
  },
  {
    id: "pg-1102",
    klant: "Peeters Groep",
    assetNaam: "Laadstation P1",
    assetModel: "Vaste laadzuil, hal 2",
    urgentie: "kritiek",
    status: "opgelost",
    omschrijving: "Laadstation gaf een vonk bij het aansluiten van de stekker, direct buiten gebruik gesteld.",
    aiDiagnose:
      "Een vonk bij aansluiten wijst op een defect contactpunt of vochtinbraak — een direct veiligheidsrisico. Terecht direct buiten gebruik gesteld; volledige controle door een elektricien nodig geweest.",
    fotos: [],
    gemeldDoor: "Bram Peeters (teamleider)",
    gemeldOp: "2026-08-28T16:00:00+02:00",
    opgelostOp: "2026-08-30T09:00:00+02:00",
    historie: [{ datum: "2026-08-30T09:00:00+02:00", omschrijving: "Contactpunt vervangen en volledig getest door leverancier.", type: "actie" }],
  },
];

/* Voorgestelde reparatie-/levermomenten op een paar open meldingen — laat
   zien hoe optie 4 (direct een moment voorstellen, klant accepteert met één
   klik) er in de praktijk uit zou zien. */
PORTAL_MELDINGEN.find((m) => m.id === "m-1042")!.voorgesteldeAfspraak = {
  datum: "2026-09-19T09:00:00+02:00",
  geaccepteerd: null,
};
PORTAL_MELDINGEN.find((m) => m.id === "v-2051")!.voorgesteldeAfspraak = {
  datum: "2026-09-18T13:30:00+02:00",
  geaccepteerd: true,
};
PORTAL_MELDINGEN.find((m) => m.id === "d-3001")!.voorgesteldeAfspraak = {
  datum: "2026-09-19T15:00:00+02:00",
  geaccepteerd: null,
};

export const PORTAL_VLOOT: PortalTruck[] = [
  { id: "t-1", klant: "R'EMS", naam: "Heftruck 07", model: "Linde H25 D", status: "actief", laatsteOnderhoud: "2026-03-02" },
  { id: "t-2", klant: "R'EMS", naam: "Heftruck 03", model: "Linde H25 D", status: "actief", laatsteOnderhoud: "2026-06-10" },
  { id: "t-3", klant: "R'EMS", naam: "Reachtruck 03", model: "Toyota RRE160H", status: "actief", laatsteOnderhoud: "2026-06-10" },
  { id: "t-4", klant: "R'EMS", naam: "EPT 12", model: "Jungheinrich EJE M15", status: "actief", laatsteOnderhoud: "2026-04-18" },
  { id: "t-5", klant: "R'EMS", naam: "Hoge orderpicker 02", model: "Still EK-X 515k", status: "actief", laatsteOnderhoud: "2026-08-15" },
  { id: "t-6", klant: "R'EMS", naam: "Laadstation E3", model: "Vaste laadzuil, kanaal 3", status: "actief", laatsteOnderhoud: "2025-09-01" },
  { id: "t-7", klant: "Van Doorn Logistiek", naam: "EPT 04", model: "BT Levio LWE140", status: "buiten_dienst", laatsteOnderhoud: "2026-08-25" },
  { id: "t-8", klant: "Van Doorn Logistiek", naam: "Strapmachine 1", model: "Mosca RO-M", status: "actief", laatsteOnderhoud: "2026-08-06" },
  { id: "t-9", klant: "Van Doorn Logistiek", naam: "Bakwagen 2", model: "Iveco Daily 35C16", status: "actief", laatsteOnderhoud: "2026-02-14" },
  { id: "t-10", klant: "Van Doorn Logistiek", naam: "Laadstation N2", model: "Vaste laadzuil, noordhal", status: "actief", laatsteOnderhoud: "2026-02-04" },
  { id: "t-11", klant: "Dekker Warehousing", naam: "Heftruck D2", model: "Toyota Traigo 48", status: "buiten_dienst", laatsteOnderhoud: "2026-05-30" },
  { id: "t-12", klant: "Dekker Warehousing", naam: "Reachtruck D1", model: "Crown ESR 1000", status: "actief", laatsteOnderhoud: "2026-07-01" },
  { id: "t-13", klant: "Dekker Warehousing", naam: "EPT D3", model: "Hyster P2.0", status: "actief", laatsteOnderhoud: "2026-08-21" },
  { id: "t-14", klant: "Jansen Transport", naam: "Heftruck J3", model: "Linde H30 D", status: "actief", laatsteOnderhoud: "2026-09-16" },
  { id: "t-15", klant: "Jansen Transport", naam: "Heftruck J1", model: "Toyota 8FBE20", status: "actief", laatsteOnderhoud: "2026-08-19" },
  { id: "t-16", klant: "Jansen Transport", naam: "Bakwagen J1", model: "Mercedes Atego", status: "actief", laatsteOnderhoud: "2026-09-12" },
  { id: "t-17", klant: "De Boer Logistiek", naam: "Reachtruck B2", model: "Linde R14", status: "actief", laatsteOnderhoud: "2026-09-15" },
  { id: "t-18", klant: "De Boer Logistiek", naam: "Heftruck B5", model: "Linde H25 D", status: "actief", laatsteOnderhoud: "2026-09-09" },
  { id: "t-19", klant: "De Boer Logistiek", naam: "EPT B1", model: "BT Levio LWE160", status: "actief", laatsteOnderhoud: "2026-08-26" },
  { id: "t-20", klant: "Verhoeven Warehousing", naam: "Heftruck V1", model: "Jungheinrich EFG 425", status: "actief", laatsteOnderhoud: "2026-09-14" },
  { id: "t-21", klant: "Verhoeven Warehousing", naam: "Orderpicker V2", model: "Still EK-X 513", status: "actief", laatsteOnderhoud: "2026-08-31" },
  { id: "t-22", klant: "Hendriks Distributie", naam: "Heftruck H8", model: "Toyota Traigo 80", status: "actief", laatsteOnderhoud: "2026-09-13" },
  { id: "t-23", klant: "Hendriks Distributie", naam: "Reachtruck H3", model: "Toyota RRE160H", status: "actief", laatsteOnderhoud: "2026-09-11" },
  { id: "t-24", klant: "Hendriks Distributie", naam: "Bakwagen H2", model: "DAF LF", status: "actief", laatsteOnderhoud: "2026-08-12" },
  { id: "t-25", klant: "Bakker Fulfilment", naam: "EPT F1", model: "Hyster P2.0", status: "actief", laatsteOnderhoud: "2026-09-10" },
  { id: "t-26", klant: "Smits Cargo", naam: "Heftruck S4", model: "Linde H20 D", status: "actief", laatsteOnderhoud: "2026-09-08" },
  { id: "t-27", klant: "Smits Cargo", naam: "Strapmachine S1", model: "Mosca RO-M", status: "actief", laatsteOnderhoud: "2026-09-05" },
  { id: "t-28", klant: "Peeters Groep", naam: "Heftruck P2", model: "Still RX 60", status: "actief", laatsteOnderhoud: "2026-09-07" },
  { id: "t-29", klant: "Peeters Groep", naam: "Laadstation P1", model: "Vaste laadzuil, hal 2", status: "actief", laatsteOnderhoud: "2026-08-30" },
];

export const PORTAL_VOORRAAD: PortalOnderdeel[] = [
  { naam: "Mastketting (Linde H25 D)", voorraad: 2, minimum: 3, klant: "R'EMS" },
  { naam: "Hoogtesensor E-42 (Toyota RRE160H)", voorraad: 1, minimum: 2, klant: "R'EMS" },
  { naam: "Hydrauliekslang, universeel", voorraad: 14, minimum: 5 },
  { naam: "Remblok dissel (BT Levio)", voorraad: 0, minimum: 2, klant: "Van Doorn Logistiek" },
  { naam: "Strapband, rol", voorraad: 22, minimum: 8 },
  { naam: "Hefcilinder-pakking (Toyota Traigo)", voorraad: 1, minimum: 2, klant: "Dekker Warehousing" },
  { naam: "Wiellager, standaard", voorraad: 9, minimum: 4 },
  { naam: "Claxon-relais, universeel", voorraad: 6, minimum: 3 },
];

export const PORTAL_FACTUREN: PortalFactuur[] = [
  { id: "f-2026-041", klant: "R'EMS", omschrijving: "Reparatie Heftruck 07 — mastketting", bedrag: 640, status: "betaald", datum: "2026-08-31" },
  { id: "f-2026-044", klant: "Van Doorn Logistiek", omschrijving: "Reparatie Strapmachine 1 — bandtoevoer", bedrag: 385, status: "betaald", datum: "2026-08-07" },
  { id: "f-2026-047", klant: "Dekker Warehousing", omschrijving: "Onderhoud EPT D3 — wiellager", bedrag: 145, status: "verzonden", datum: "2026-08-22" },
  { id: "f-2026-051", klant: "Van Doorn Logistiek", omschrijving: "Onderhoud EPT 04 — displaykabel", bedrag: 95, status: "verzonden", datum: "2026-08-26" },
  { id: "f-2026-052", klant: "R'EMS", omschrijving: "Onderhoud Heftruck 07 — afdichting", bedrag: 210, status: "concept", datum: "2026-08-30" },
  { id: "f-2026-055", klant: "Jansen Transport", omschrijving: "Reparatie Heftruck J1 — zoemer", bedrag: 85, status: "betaald", datum: "2026-08-19" },
  { id: "f-2026-058", klant: "De Boer Logistiek", omschrijving: "Onderhoud EPT B1 — displaystekker", bedrag: 120, status: "betaald", datum: "2026-08-26" },
  { id: "f-2026-061", klant: "Verhoeven Warehousing", omschrijving: "Onderhoud Orderpicker V2 — eindschakelaar", bedrag: 165, status: "verzonden", datum: "2026-08-31" },
  { id: "f-2026-063", klant: "Hendriks Distributie", omschrijving: "Onderhoud Bakwagen H2 — portierrubber", bedrag: 90, status: "verzonden", datum: "2026-08-12" },
  { id: "f-2026-066", klant: "Peeters Groep", omschrijving: "Reparatie Laadstation P1 — contactpunt", bedrag: 480, status: "concept", datum: "2026-08-30" },
];

/* Beekmans' eigen verhuurvloot — los van de trucks die klanten zelf al
   bezitten (die staan in PORTAL_VLOOT). Deze trucks zijn van Beekmans zelf
   en worden toegewezen aan een klant (nieuw of bestaand) of staan op
   voorraad; bij terugname gaan ze weer terug naar "op voorraad" i.p.v. naar
   een specifieke klant. */
export const PORTAL_VERHUURVLOOT: PortalVerhuurTruck[] = [
  { id: "vh-1", naam: "Verhuurtruck 12", model: "Linde H20 D", klant: "R'EMS", sinds: "2026-06-01", eerdereKlanten: [] },
  { id: "vh-2", naam: "Verhuurtruck 05", model: "Toyota Traigo 24", klant: "Van Doorn Logistiek", sinds: "2026-08-15", eerdereKlanten: ["Dekker Warehousing"] },
  { id: "vh-3", naam: "Verhuurtruck 08", model: "Jungheinrich EFG 316", sinds: "2026-09-10", eerdereKlanten: ["R'EMS"] },
  { id: "vh-4", naam: "Verhuurtruck 02", model: "Still RX 20", sinds: "2026-04-22", eerdereKlanten: [] },
  { id: "vh-5", naam: "Verhuurtruck 14", model: "Hyster H2.5FT", klant: "Dekker Warehousing", sinds: "2026-07-03", eerdereKlanten: [] },
];
