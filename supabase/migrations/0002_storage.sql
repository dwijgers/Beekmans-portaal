-- Storage bucket voor foto's bij meldingen (zelfde patroon als R'EMS).
insert into storage.buckets (id, name, public)
values ('melding-fotos', 'melding-fotos', true)
on conflict (id) do nothing;

create policy melding_fotos_bucket_select on storage.objects for select to authenticated
  using (bucket_id = 'melding-fotos');

create policy melding_fotos_bucket_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'melding-fotos');
