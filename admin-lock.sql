-- Magic Concert Archive: public read, authenticated admin write
-- IMPORTANT: Create only ONE Supabase Auth user for the archive owner.
-- Also disable public sign-ups in Authentication settings.

alter table public.tickets enable row level security;

-- Even if an old permissive policy still exists, anon cannot write anymore.
revoke insert, update, delete on table public.tickets from anon;
grant select on table public.tickets to anon;
grant select, insert, update, delete on table public.tickets to authenticated;

-- Public visitors can read tickets.
drop policy if exists "tickets_public_read" on public.tickets;
create policy "tickets_public_read"
on public.tickets for select
to anon, authenticated
using (true);

-- Only a signed-in account can create/update/delete.
drop policy if exists "tickets_admin_insert" on public.tickets;
create policy "tickets_admin_insert"
on public.tickets for insert
to authenticated
with check (auth.uid() is not null);

drop policy if exists "tickets_admin_update" on public.tickets;
create policy "tickets_admin_update"
on public.tickets for update
to authenticated
using (auth.uid() is not null)
with check (auth.uid() is not null);

drop policy if exists "tickets_admin_delete" on public.tickets;
create policy "tickets_admin_delete"
on public.tickets for delete
to authenticated
using (auth.uid() is not null);

-- Storage: visitors can view public ticket images, only authenticated admin can change files.
revoke insert, update, delete on table storage.objects from anon;
grant select on table storage.objects to anon;
grant select, insert, update, delete on table storage.objects to authenticated;

drop policy if exists "ticket_images_admin_insert" on storage.objects;
create policy "ticket_images_admin_insert"
on storage.objects for insert
to authenticated
with check (bucket_id = 'ticket-images' and auth.uid() is not null);

drop policy if exists "ticket_images_admin_update" on storage.objects;
create policy "ticket_images_admin_update"
on storage.objects for update
to authenticated
using (bucket_id = 'ticket-images' and auth.uid() is not null)
with check (bucket_id = 'ticket-images' and auth.uid() is not null);

drop policy if exists "ticket_images_admin_delete" on storage.objects;
create policy "ticket_images_admin_delete"
on storage.objects for delete
to authenticated
using (bucket_id = 'ticket-images' and auth.uid() is not null);
