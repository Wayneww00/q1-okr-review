create table if not exists public.report_content (
  report_id text primary key,
  content jsonb not null default '{"texts": {}}'::jsonb,
  version bigint not null default 1 check (version > 0),
  updated_at timestamptz not null default timezone('utc', now()),
  updated_by uuid references auth.users(id)
);

create index if not exists report_content_updated_by_idx
  on public.report_content (updated_by);

alter table public.report_content enable row level security;

revoke all on table public.report_content from anon, authenticated;
grant select, update on table public.report_content to authenticated;

drop policy if exists "authenticated viewers read vantage h1"
  on public.report_content;
create policy "authenticated viewers read vantage h1"
  on public.report_content
  for select
  to authenticated
  using (report_id = 'vantage-h1');

drop policy if exists "authenticated viewers update vantage h1"
  on public.report_content;
create policy "authenticated viewers update vantage h1"
  on public.report_content
  for update
  to authenticated
  using (report_id = 'vantage-h1')
  with check (
    report_id = 'vantage-h1'
    and updated_by = (select auth.uid())
  );

create or replace function public.set_report_content_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

revoke all on function public.set_report_content_updated_at()
  from public, anon, authenticated;

-- Supabase's optional automatic-RLS setup creates this event-trigger function
-- in `public`. It must not remain callable through the Data API.
do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    revoke all on function public.rls_auto_enable()
      from public, anon, authenticated;
  end if;
end;
$$;

drop trigger if exists report_content_updated_at on public.report_content;
create trigger report_content_updated_at
before update on public.report_content
for each row execute function public.set_report_content_updated_at();

insert into public.report_content (report_id)
values ('vantage-h1')
on conflict (report_id) do nothing;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'report_content'
  ) then
    alter publication supabase_realtime
      add table public.report_content;
  end if;
end;
$$;
