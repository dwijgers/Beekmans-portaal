-- Voorbeelddata voor lokale ontwikkeling. Nooit tegen productie draaien.

insert into klanten (id, naam, contactpersoon, email, factuur_modus) values
  ('a0000000-0000-0000-0000-000000000001', 'REV''IT (R''EMS)', 'Dennis Wijgers', 'beheer@revit.eu', 'ter_goedkeuring'),
  ('a0000000-0000-0000-0000-000000000002', 'Van Doorn Logistiek', 'Petra van Lint', 'contact@vandoorn.nl', 'automatisch');

insert into trucks (id, serienummer, merk, model, categorie, eigendomstype, eigenaar, huidige_klant_id, status) values
  ('b0000000-0000-0000-0000-000000000001', 'LND-2021-0714', 'Linde', 'H25 D', 'heftruck', 'onderhoud', 'klant', 'a0000000-0000-0000-0000-000000000001', 'bij_klant'),
  ('b0000000-0000-0000-0000-000000000002', 'TOY-2022-3391', 'Toyota', 'RRE160H', 'reachtruck', 'verkocht', 'klant', 'a0000000-0000-0000-0000-000000000001', 'bij_klant'),
  ('b0000000-0000-0000-0000-000000000003', 'BT-2023-8820', 'BT', 'Levio LWE140', 'ept', 'verhuur', 'beekmans', 'a0000000-0000-0000-0000-000000000002', 'bij_klant'),
  ('b0000000-0000-0000-0000-000000000004', 'LND-2024-0055', 'Linde', 'H30 D', 'heftruck', 'verhuur', 'beekmans', null, 'beschikbaar');

insert into truck_toewijzingen (truck_id, klant_id, vanaf, tarief, contract_referentie) values
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002', '2026-03-01', 780.00, 'LEASE-2026-014');

insert into meldingen (id, klant_id, truck_id, bron, externe_referentie, asset_naam, omschrijving, urgentie, status, gemeld_door, gemeld_op) values
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'intake', 'rems-m-1042', 'Heftruck 07', 'Truck maakt een hard tikkend geluid uit de hefmast.', 'kritiek', 'gemeld', 'Sanne de Groot (teamleider)', now() - interval '1 day'),
  ('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000003', 'intake', 'extern-4471', 'EPT 04', 'Truck remt niet meer af bij het loslaten van de dissel.', 'kritiek', 'in_behandeling', 'Petra van Lint (teamleider)', now() - interval '3 hours');
