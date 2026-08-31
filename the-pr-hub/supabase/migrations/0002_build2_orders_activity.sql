-- The PR Hub CRM — Build 2 schema (Orders + activity_log)
-- Adds the two tables Build 2 needs on top of Build 1's people + contacts:
--   * orders        — what a person bought
--   * activity_log  — one row per Contacts status change (audit trail)
-- Same access model as Build 1: RLS on, no policies. The service-role key
-- (server only) bypasses RLS; the public anon key gets nothing.
--
-- Values enforced with CHECK constraints (kept in sync with lib/constants.ts).

-- --- Orders: what people bought -------------------------------------------
create table if not exists public.orders (
  id           uuid primary key default gen_random_uuid(),
  person_id    uuid not null references public.people(id) on delete cascade,
  product_name text not null,
  amount_cents integer not null default 0 check (amount_cents >= 0),
  currency     text not null default 'AUD',
  status       text not null default 'pending' check (status in (
                 'pending','paid','refunded','cancelled')),
  created_at   timestamptz not null default now()
);

create index if not exists orders_person_id_idx  on public.orders (person_id);
create index if not exists orders_created_at_idx on public.orders (created_at desc);

-- --- activity_log: every Contacts status change ---------------------------
create table if not exists public.activity_log (
  id          uuid primary key default gen_random_uuid(),
  contact_id  uuid not null references public.contacts(id) on delete cascade,
  person_id   uuid not null references public.people(id)   on delete cascade,
  from_status text,
  to_status   text not null,
  actor       text,
  note        text,
  created_at  timestamptz not null default now()
);

create index if not exists activity_log_contact_id_idx on public.activity_log (contact_id);
create index if not exists activity_log_person_id_idx  on public.activity_log (person_id);
create index if not exists activity_log_created_at_idx on public.activity_log (created_at desc);

-- Lock both tables down: RLS on, no policies.
alter table public.orders       enable row level security;
alter table public.activity_log enable row level security;
