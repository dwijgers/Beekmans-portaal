# Beekmans Portaal

Beekmans' eigen onderhoudsportaal: één centraal punt waar onderhoudsmeldingen
van meerdere klant-CMMS-systemen (zoals R'EMS — R'EMS is klant 1 van de N)
binnenkomen via een vast intake-contract, plus Beekmans' eigen
vlootregistratie (verkocht / alleen-onderhoud / verhuur-lease) en de eerste
opzet voor automatische facturatie.

Los product van R'EMS — eigen repo, eigen Supabase-project. Beekmans'
eigen medewerkers (monteur/planner/beheerder) loggen in; klanten loggen
nooit in, ze koppelen hun systeem via een API-key + HMAC-secret.

## Stack

Next.js (App Router) + Supabase (Postgres, Auth, RLS) + Tailwind — zelfde
patronen als R'EMS, voor een bewezen, snel te bouwen basis.

## Starten

```bash
npm install
cp .env.example .env.local   # vul in met je Supabase-project-gegevens
npm run dev
```

Migraties staan in `supabase/migrations/` — uitvoeren met de Supabase CLI
(`supabase db push`) of handmatig in de SQL Editor, in volgorde (0001 vóór
0002). `supabase/seed.sql` bevat voorbeelddata voor lokale ontwikkeling.

## Structuur

- `app/(app)/dashboard` — overzicht over alle klanten: open/in behandeling/
  opgelost, gemiddelde oplostijd, urgentieverdeling, meldingen-per-week,
  "vraagt nu aandacht".
- `app/(app)/klanten` — klanten aanmaken/beheren, intake-API-key per klant
  (alleen zichtbaar voor planner/beheerder).
- `app/(app)/vloot` — trucks registreren met eigendomstype (verkocht /
  onderhoud / verhuur) en, voor verhuur, de koppelhistorie per klant.
- `app/(app)/meldingen` — alle meldingen, filterbaar, oppakken/status
  bijwerken.
- `app/(app)/facturen` — conceptfacturen voor opgeloste onderhoudsmeldingen;
  automatisch "verzonden" of eerst "ter goedkeuring", per
  `klanten.factuur_modus`.
- `app/api/intake` — de endpoint waar klantsystemen hun meldingen posten.
  Zie de docstring bovenaan `app/api/intake/route.ts` voor het volledige
  contract (headers, body-vorm).

## Intake-contract (kort)

```
POST /api/intake
X-Beekmans-Api-Key: <klant.api_key>
X-Beekmans-Signature: hex(HMAC-SHA256(body, klant.webhook_secret))
Content-Type: application/json

{
  "externeReferentie": "id-in-bronsysteem",
  "assetNaam": "Heftruck 07",
  "serienummer": "optioneel, matcht een bestaande truck bij deze klant",
  "omschrijving": "...",
  "urgentie": "laag" | "gemiddeld" | "hoog" | "kritiek",
  "gemeldDoor": "Naam (rol)",
  "gemeldOp": "2026-09-18T08:00:00+02:00",
  "aiAdvies": "optioneel",
  "fotos": ["https://...", "..."]
}
```

R'EMS' eigen kant van deze koppeling staat al klaar in `lib/webhook.ts` /
`app/(veld)/meldingen/actions.ts` van de R'EMS-repo (`stuurWebhook`) —
zodra een klant hun `webhook_url` + `webhook_api_key` + `webhook_secret`
instelt op hun leverancier-rij, werkt de koppeling.
