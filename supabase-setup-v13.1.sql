-- Chef Maurice Version 13.1 shared storefront configuration
create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);
alter table public.app_settings enable row level security;
drop policy if exists "Anyone can read storefront settings" on public.app_settings;
create policy "Anyone can read storefront settings" on public.app_settings for select using (key = 'storefront');
drop policy if exists "Owners manage storefront settings" on public.app_settings;
create policy "Owners manage storefront settings" on public.app_settings for all to authenticated
using (exists (select 1 from public.profiles p where p.id=auth.uid() and p.role in ('owner','manager') and coalesce(p.is_active,true)=true))
with check (exists (select 1 from public.profiles p where p.id=auth.uid() and p.role in ('owner','manager') and coalesce(p.is_active,true)=true));
grant select on public.app_settings to anon, authenticated;
grant insert, update, delete on public.app_settings to authenticated;
