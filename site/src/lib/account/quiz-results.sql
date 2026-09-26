-- ============================================================================
-- THE RESULTS LOG (2026-09-26). Paste this whole file into Supabase's SQL editor
-- (Project > SQL Editor > New query) and press Run. It is safe to run twice.
-- ============================================================================
-- One row each time someone finishes a quiz, written by the site's server
-- (src/pages/api/result.ts). Nobody is named on it: no user id, no email, no IP
-- address. The Personality Test's twelve private answers are never in it, and
-- the Psalm quiz sends only the psalm.
create table if not exists public.quiz_results (
  id         bigint      generated always as identity primary key,
  created_at timestamptz not null default now(),
  quiz       text        not null check (quiz ~ '^[a-z0-9-]{1,64}$'),
  code       text        not null check (code ~ '^[0-9A-Z]{1,96}$'),
  result     text        check (result is null or length(result) <= 160),
  answers    text        check (answers is null or answers ~ '^[0-9,-]{1,400}$'),
  came_from  text        check (came_from is null or came_from ~ '^[a-z0-9.-]{1,80}$'),
  device     text        check (device is null or device in ('phone', 'tablet', 'computer'))
);
create index if not exists quiz_results_by_quiz on public.quiz_results (quiz, created_at desc);

-- Row-level security on, with no rules: the public can neither read nor write it.
-- Only the site's server (the secret key) can.
alter table public.quiz_results enable row level security;
grant select, insert on public.quiz_results to service_role;

-- A ceiling, as on the short links, so a flood of fake finishes cannot fill the
-- free plan's database: past it, new rows are simply not kept.
create or replace function public.quiz_results_cap()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select greatest(c.reltuples, 0) from pg_catalog.pg_class c
       where c.oid = 'public.quiz_results'::regclass) >= 500000 then
    raise exception 'The results log is full.'
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;
drop trigger if exists quiz_results_cap on public.quiz_results;
create trigger quiz_results_cap
  before insert on public.quiz_results
  for each row execute function public.quiz_results_cap();

-- What you open in the Table Editor: newest first, each row with a link to the
-- exact result page, to spot-check. security_invoker keeps the table's own rules,
-- so the public cannot read it through the view either.
create or replace view public.quiz_results_recent
with (security_invoker = true) as
  select created_at, quiz, result,
         'https://wiserwalk.com/r/' || quiz || '/' || code || '/' as link,
         came_from, device, answers
  from public.quiz_results
  order by created_at desc;

-- ============================================================================
-- Three questions worth saving in the SQL editor (paste one, Run, then Save):
-- ============================================================================
-- Finishes per quiz per day, the last 30 days:
--   select created_at::date as day, quiz, count(*) as finishes
--   from public.quiz_results
--   where created_at > now() - interval '30 days'
--   group by 1, 2 order by 1 desc, 3 desc;
--
-- What people got, most common first, per quiz:
--   select quiz, result, count(*) as people
--   from public.quiz_results
--   group by 1, 2 order by 1, 3 desc;
--
-- Where people came from, and on what:
--   select coalesce(came_from, 'unknown') as came_from, device, count(*) as finishes
--   from public.quiz_results
--   group by 1, 2 order by 3 desc;
