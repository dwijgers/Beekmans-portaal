-- Beekmans Portaal — initieel schema
--
-- Dit is Beekmans' eigen product: één centraal punt waar onderhoudsmeldingen
-- van meerdere klant-CMMS-systemen (zoals R'EMS — R'EMS is straks klant 1 van
-- de N) binnenkomen via een vast intake-contract, plus Beekmans' eigen
-- vlootregistratie (verkocht / alleen-onderhoud / verhuur-lease) en de
-- eerste opzet voor automatische facturatie.
--
-- Belangrijk architectuurverschil met R'EMS zelf: klanten loggen hier niet
-- in — ze koppelen hun eigen systeem via een API-key + HMAC-secret op de
-- intake-endpoint (zie app/api/intake/route.ts). De enige mensen die
-- inloggen zijn Beekmans' eigen medewerkers (`gebruikers`). Dat maakt de
-- RLS hieronder simpel: alles is "welke rol heeft de ingelogde
-- Beekmans-medewerker", er is geen "welke klant ben ik"-scoping nodig zoals
-- bij de leverancier-rol in R'EMS.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- gebruikers (Beekmans' eigen personeel — spiegelt auth.users, met rol)
-- ---------------------------------------------------------------------------
create table gebruikers (
  id uuid primary key references auth.users (id) on delete cascade,
  naam text not null,
  rol text not null default 'monteur' check (rol in ('monteur', 'planner', 'beheerder')),
  created_at timestamptz not null default now()
);

create function handle_new_auth_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.gebruikers (id, naam, rol)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'naam', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'rol', 'monteur')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_auth_user();

-- ---------------------------------------------------------------------------
-- klanten — bedrijven zoals REV'IT (R'EMS), elk met een eigen intake-koppeling.
-- Onboarden van klant N+1 is een nieuwe rij, geen nieuwe code.
-- ---------------------------------------------------------------------------
create table klanten (
  id uuid primary key default gen_random_uuid(),
  naam text not null unique,
  contactpersoon text,
  email text,
  telefoon text,
  factuur_modus text not null default 'ter_goedkeuring' check (factuur_modus in ('automatisch', 'ter_goedkeuring')),
  actief boolean not null default true,
  created_at timestamptz not null default now()
);

-- Losse tabel i.p.v. kolommen op klanten: intake-credentials zijn gevoelig
-- (geven een extern systeem schrijftoegang tot meldingen) en horen dus
-- strenger afgeschermd te zijn dan "naam/contactpersoon" — zie de RLS
-- hieronder: elke Beekmans-medewerker mag klanten lezen, maar alleen
-- planner/beheerder mag deze tabel zien.
create table klant_credentials (
  klant_id uuid primary key references klanten (id) on delete cascade,
  -- Het klantsysteem stuurt de api_key mee en ondertekent de payload met
  -- webhook_secret (zelfde HMAC-schema als R'EMS's lib/webhook.ts gebruikt).
  api_key text not null unique default encode(gen_random_bytes(24), 'hex'),
  webhook_secret text not null default encode(gen_random_bytes(32), 'hex'),
  created_at timestamptz not null default now()
);

create function handle_new_klant()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.klant_credentials (klant_id) values (new.id);
  return new;
end;
$$;

create trigger on_klant_created
  after insert on klanten
  for each row execute function handle_new_klant();

-- ---------------------------------------------------------------------------
-- trucks — Beekmans' vlootregistratie, met expliciet onderscheid in
-- eigendom: verkocht/onderhoud (klant is eigenaar, koppeling is permanent)
-- versus verhuur (Beekmans is eigenaar, koppeling is tijdelijk — zie
-- truck_toewijzingen).
-- ---------------------------------------------------------------------------
create table trucks (
  id uuid primary key default gen_random_uuid(),
  serienummer text not null unique,
  merk text,
  model text,
  categorie text,
  eigendomstype text not null check (eigendomstype in ('verkocht', 'onderhoud', 'verhuur')),
  eigenaar text not null check (eigenaar in ('beekmans', 'klant')),
  huidige_klant_id uuid references klanten (id) on delete set null,
  status text not null default 'bij_klant' check (status in ('bij_klant', 'beschikbaar', 'in_onderhoud', 'buiten_dienst')),
  created_at timestamptz not null default now(),
  constraint eigenaar_past_bij_eigendomstype check (
    (eigendomstype in ('verkocht', 'onderhoud') and eigenaar = 'klant')
    or (eigendomstype = 'verhuur' and eigenaar = 'beekmans')
  )
);
create index trucks_klant_idx on trucks (huidige_klant_id);

-- Koppelhistorie: vooral relevant voor verhuur (een truck kan van klant naar
-- klant gaan); bij verkocht/onderhoud is er typisch precies 1 rij die nooit
-- eindigt. Nooit meer dan 1 actieve (tot = null) toewijzing per truck.
create table truck_toewijzingen (
  id uuid primary key default gen_random_uuid(),
  truck_id uuid not null references trucks (id) on delete cascade,
  klant_id uuid not null references klanten (id) on delete cascade,
  vanaf date not null default current_date,
  tot date,
  tarief numeric(10, 2), -- per maand, alleen relevant bij verhuur
  contract_referentie text,
  created_at timestamptz not null default now(),
  constraint tot_na_vanaf check (tot is null or tot >= vanaf)
);
create index truck_toewijzingen_truck_idx on truck_toewijzingen (truck_id, vanaf desc);
create index truck_toewijzingen_klant_idx on truck_toewijzingen (klant_id);
create unique index truck_toewijzingen_een_actieve_per_truck
  on truck_toewijzingen (truck_id) where (tot is null);

-- ---------------------------------------------------------------------------
-- meldingen — binnengekomen via de intake-API (bron = 'intake') of
-- handmatig door Beekmans zelf aangemaakt (bron = 'handmatig').
-- ---------------------------------------------------------------------------
create table meldingen (
  id uuid primary key default gen_random_uuid(),
  klant_id uuid not null references klanten (id) on delete cascade,
  truck_id uuid references trucks (id) on delete set null,
  bron text not null default 'intake' check (bron in ('intake', 'handmatig')),
  -- id van de melding in het bronsysteem — voor traceerbaarheid en om te
  -- voorkomen dat een retry van het klantsysteem 'm dubbel aanmaakt.
  externe_referentie text,
  asset_naam text not null,
  omschrijving text,
  urgentie text not null check (urgentie in ('laag', 'gemiddeld', 'hoog', 'kritiek')),
  status text not null default 'gemeld' check (status in ('gemeld', 'in_behandeling', 'opgelost')),
  ai_advies text,
  gemeld_door text,
  gemeld_op timestamptz not null default now(),
  opgelost_op timestamptz,
  toegewezen_aan uuid references gebruikers (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint externe_referentie_uniek_per_klant unique (klant_id, externe_referentie)
);
create index meldingen_klant_idx on meldingen (klant_id, gemeld_op desc);
create index meldingen_open_idx on meldingen (status) where status <> 'opgelost';

create table melding_fotos (
  id uuid primary key default gen_random_uuid(),
  melding_id uuid not null references meldingen (id) on delete cascade,
  url text not null,
  created_at timestamptz not null default now()
);
create index melding_fotos_melding_idx on melding_fotos (melding_id);

-- ---------------------------------------------------------------------------
-- facturen + factuurregels — datamodel voor automatische facturatie bij
-- onderhoud (per opgeloste melding) of verhuur (per periode). Verzending
-- naar een externe boekhoudkoppeling is een losse vervolgstap; hier staat
-- alleen de status/goedkeuring-flow (concept -> evt. ter goedkeuring ->
-- verzonden -> betaald), zodat klanten.factuur_modus daar direct op aansluit.
-- ---------------------------------------------------------------------------
create table facturen (
  id uuid primary key default gen_random_uuid(),
  klant_id uuid not null references klanten (id) on delete cascade,
  type text not null check (type in ('onderhoud', 'verhuur')),
  periode_van date,
  periode_tot date,
  melding_id uuid references meldingen (id) on delete set null,
  status text not null default 'concept' check (status in ('concept', 'ter_goedkeuring', 'goedgekeurd', 'verzonden', 'betaald')),
  bedrag numeric(10, 2) not null default 0,
  goedgekeurd_door uuid references gebruikers (id) on delete set null,
  goedgekeurd_op timestamptz,
  verzonden_op timestamptz,
  created_at timestamptz not null default now(),
  constraint onderhoud_heeft_melding check (type <> 'onderhoud' or melding_id is not null),
  constraint verhuur_heeft_periode check (type <> 'verhuur' or (periode_van is not null and periode_tot is not null))
);
create index facturen_klant_idx on facturen (klant_id, created_at desc);

create table factuurregels (
  id uuid primary key default gen_random_uuid(),
  factuur_id uuid not null references facturen (id) on delete cascade,
  omschrijving text not null,
  aantal numeric(10, 2) not null default 1,
  tarief numeric(10, 2) not null,
  bedrag numeric(10, 2) generated always as (aantal * tarief) stored
);
create index factuurregels_factuur_idx on factuurregels (factuur_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table gebruikers enable row level security;
alter table klanten enable row level security;
alter table klant_credentials enable row level security;
alter table trucks enable row level security;
alter table truck_toewijzingen enable row level security;
alter table meldingen enable row level security;
alter table melding_fotos enable row level security;
alter table facturen enable row level security;
alter table factuurregels enable row level security;

create function is_beheerder()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (select 1 from public.gebruikers where id = auth.uid() and rol = 'beheerder');
$$;

create function is_planner_of_beheerder()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (select 1 from public.gebruikers where id = auth.uid() and rol in ('planner', 'beheerder'));
$$;

-- gebruikers: iedereen mag collega's zien (voor toewijzing/weergave); alleen
-- jezelf aanpassen, of een beheerder past iedereen aan.
create policy gebruikers_select on gebruikers for select to authenticated using (true);
create policy gebruikers_update on gebruikers for update to authenticated
  using (id = auth.uid() or is_beheerder())
  with check (id = auth.uid() or is_beheerder());

-- klanten: alle Beekmans-staff mag lezen (naam is nodig in elk
-- meldingen/dashboard-overzicht); alleen planner/beheerder mag aanmaken/
-- wijzigen.
create policy klanten_select on klanten for select to authenticated using (true);
create policy klanten_write on klanten for all to authenticated
  using (is_planner_of_beheerder()) with check (is_planner_of_beheerder());

-- klant_credentials: bewust NIET voor iedereen leesbaar — dit geeft
-- feitelijk schrijftoegang tot meldingen (via de intake-API), dus alleen
-- planner/beheerder mag deze inzien of opnieuw genereren.
create policy klant_credentials_select on klant_credentials for select to authenticated
  using (is_planner_of_beheerder());
create policy klant_credentials_write on klant_credentials for all to authenticated
  using (is_planner_of_beheerder()) with check (is_planner_of_beheerder());

-- trucks/toewijzingen: zelfde patroon.
create policy trucks_select on trucks for select to authenticated using (true);
create policy trucks_write on trucks for all to authenticated
  using (is_planner_of_beheerder()) with check (is_planner_of_beheerder());

create policy truck_toewijzingen_select on truck_toewijzingen for select to authenticated using (true);
create policy truck_toewijzingen_write on truck_toewijzingen for all to authenticated
  using (is_planner_of_beheerder()) with check (is_planner_of_beheerder());

-- meldingen: elke medewerker mag alles lezen, zelf melden en de eigen
-- toegewezen meldingen bijwerken (status/oplossing); alleen planner/beheerder
-- mag een melding aan iemand toewijzen of 'm verwijderen.
create policy meldingen_select on meldingen for select to authenticated using (true);
create policy meldingen_insert on meldingen for insert to authenticated with check (true);
-- "using" laat ook niet-toegewezen meldingen (toegewezen_aan is null) toe,
-- zodat een monteur een open melding aan zichzelf kan toewijzen ("oppakken")
-- — "with check" blijft strikt: een monteur mag 'm daarbij alleen aan
-- zichzelf toewijzen, nooit aan een collega.
create policy meldingen_update on meldingen for update to authenticated
  using (is_planner_of_beheerder() or toegewezen_aan = auth.uid() or toegewezen_aan is null)
  with check (is_planner_of_beheerder() or toegewezen_aan = auth.uid());
create policy meldingen_delete on meldingen for delete to authenticated using (is_beheerder());

create policy melding_fotos_select on melding_fotos for select to authenticated using (true);
create policy melding_fotos_insert on melding_fotos for insert to authenticated with check (true);

-- facturen: financiële data — lezen mag iedereen (transparantie binnen het
-- team), aanmaken/goedkeuren/versturen alleen planner/beheerder.
create policy facturen_select on facturen for select to authenticated using (true);
create policy facturen_write on facturen for all to authenticated
  using (is_planner_of_beheerder()) with check (is_planner_of_beheerder());

create policy factuurregels_select on factuurregels for select to authenticated using (true);
create policy factuurregels_write on factuurregels for all to authenticated
  using (is_planner_of_beheerder()) with check (is_planner_of_beheerder());
