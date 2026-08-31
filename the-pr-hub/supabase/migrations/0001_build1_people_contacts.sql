-- The PR Hub CRM — Build 1 schema (People + Contacts)
-- Scope: the smallest data model that proves the submit -> admin loop.
-- Data is accessed server-side with the service-role key only; RLS is on
-- with no policies so the anon key can never read these tables.

-- Values enforced with CHECK constraints (kept in sync with lib/constants.ts).

create table if not exists public.people (
  id            uuid primary key default gen_random_uuid(),
  email         text not null unique,
  name          text,
  phone         text,
  company       text,
  role          text,
  source_site   text,
  ok_to_contact boolean not null default false,
  attributes    jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists public.contacts (
  id         uuid primary key default gen_random_uuid(),
  person_id  uuid not null references public.people(id) on delete cascade,
  type       text not null check (type in (
               'ongoing_partnership','project','speaking_workshop',
               'strategic_partnership','media_other')),
  subject    text,
  message    text,
  source     text check (source in (
               'existing_client','former_client','eo_network','event',
               'website','outbound','strategic_partner','referral')),
  status     text not null default 'new_lead' check (status in (
               'new_lead','contacted','discovery_call','proposal','won','lost')),
  metadata   jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists contacts_created_at_idx on public.contacts (created_at desc);
create index if not exists contacts_person_id_idx  on public.contacts (person_id);

-- Keep people.updated_at fresh on every update.
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists people_set_updated_at on public.people;
create trigger people_set_updated_at
  before update on public.people
  for each row execute function public.set_updated_at();

-- Lock the tables down: RLS on, no policies. The service-role key (server
-- only) bypasses RLS; the public anon key gets nothing.
alter table public.people   enable row level security;
alter table public.contacts enable row level security;
