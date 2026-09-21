-- ============================================================================
-- Wiser Walk accounts: the whole database, in one file.
--
-- HOW TO RUN IT
--   1. Open supabase.com and choose your project.
--   2. In the left-hand menu, click SQL Editor, then New query.
--   3. Paste this entire file in and press Run.
--   4. "Success. No rows returned" is what success looks like. There is no result
--      table to read; the file only creates things.
--
-- It is safe to run more than once. Nothing here deletes anybody's data, and
-- running it again after a change just brings the database up to date.
--
-- WHAT IT HOLDS, AND WHAT IT DOES NOT
--   It holds the result CODE of a finished quiz, the date, personal bests from the
--   games, and the dates an account was made and a password was set. The code is
--   the same string that is already in the reader's own result URL.
--   It holds NO quiz answers: quizzes are scored in the browser and the answers
--   never leave it. It holds NO email addresses: those live in Supabase's own
--   auth.users table, which this file never copies from.
--
-- WHO CAN READ WHAT
--   Every table below has row-level security switched on, and every policy is
--   written for the "authenticated" role and matches on (select auth.uid()) — the
--   id of whoever is signed in. A signed-in person can therefore see their own
--   rows and nobody else's, and a signed-out visitor can see nothing at all. On
--   top of that, column grants decide which columns they may write: a person can
--   turn their own notes on and off, and cannot touch the dates the site keeps
--   about them.
-- ============================================================================


-- 1 ---------------------------------------------------------------- profiles
-- One row per account. Created by mark_password_set() below, not by a trigger on
-- auth.users: a trigger there that throws breaks sign-up itself, inside Supabase,
-- where nothing on this side can see it or report it.

create table if not exists public.profiles (
  id              uuid primary key references auth.users on delete cascade,
  created_at      timestamptz not null default now(),
  -- When they set a password. There is no field in Supabase that answers this, and
  -- the obvious substitutes are known to be unreliable, so the site keeps its own.
  password_set_at timestamptz,
  -- Their own switch for "notes about new quizzes and games".
  notes_off       boolean     not null default false,
  -- When the mailing list was last told about them. The site's bookkeeping.
  list_synced_at  timestamptz
);

-- Named separately so that re-running this file over an older version of the table
-- adds anything it was missing.
alter table public.profiles add column if not exists created_at      timestamptz not null default now();
alter table public.profiles add column if not exists password_set_at timestamptz;
alter table public.profiles add column if not exists notes_off       boolean     not null default false;
alter table public.profiles add column if not exists list_synced_at  timestamptz;

alter table public.profiles enable row level security;

drop policy if exists "profiles read own"   on public.profiles;
drop policy if exists "profiles insert own" on public.profiles;
drop policy if exists "profiles update own" on public.profiles;

create policy "profiles read own" on public.profiles
  for select to authenticated
  using      ((select auth.uid()) = id);

create policy "profiles insert own" on public.profiles
  for insert to authenticated
  with check ((select auth.uid()) = id);

create policy "profiles update own" on public.profiles
  for update to authenticated
  using      ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Column privileges, not clever policy conditions. password_set_at and
-- list_synced_at are the site's own record, so they are simply not grantable: a
-- person can read them and cannot write them, and that is enforced by Postgres
-- rather than by remembering to check something.
--
-- notes_off is insertable as well as updatable because the site writes that switch
-- as an upsert: there may be no row yet, and a person turning their notes off and
-- being told it worked while nothing was written is the failure that is worth a
-- column grant.
revoke all on public.profiles from anon, authenticated;
grant select                    on public.profiles to authenticated;
grant insert (id, notes_off)    on public.profiles to authenticated;
grant update (notes_off)        on public.profiles to authenticated;

-- The one thing that may write password_set_at. It runs as the function's owner
-- (security definer) so that it can, and with an empty search_path so that it can
-- only ever mean the tables named here in full.
create or replace function public.mark_password_set()
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.profiles (id, password_set_at)
  values ((select auth.uid()), now())
  on conflict (id) do update set password_set_at = now();
$$;

revoke all on function public.mark_password_set() from public, anon;
grant execute on function public.mark_password_set() to authenticated;


-- 2 ----------------------------------------------------------------- results
-- Exactly what the device already keeps: which quiz, the result code, and when.
--
-- taken_at is part of the primary key because the same code taken twice, months
-- apart, is two real finishes. Two saves of ONE finish inside a minute are one
-- finish, and that rule lives in the site's own code (mergeShelves in shelf.ts)
-- where it is already written and already tested, rather than being implemented a
-- second time here where the two could drift apart.
--
-- Nothing is ever deleted outright. "Clear my results" sets deleted_at, so the
-- reader's other phone learns those results are gone rather than pushing them
-- back up on its next visit and making the button look broken.

create table if not exists public.results (
  user_id    uuid        not null references auth.users on delete cascade,
  -- A quiz slug as the site spells them: lowercase letters, digits and hyphens.
  quiz       text        not null check (quiz ~ '^[a-z0-9-]{1,64}$'),
  -- A result code: digits, capitals and the dot the comparison codes use.
  code       text        not null check (code ~ '^[0-9A-Z.]{1,96}$'),
  taken_at   timestamptz not null,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (user_id, quiz, code, taken_at)
);

alter table public.results add column if not exists deleted_at timestamptz;
alter table public.results add column if not exists created_at timestamptz not null default now();

create index if not exists results_user_taken on public.results (user_id, taken_at desc);
-- The index the everyday read actually uses: one person's results that are still there.
create index if not exists results_user_live  on public.results (user_id, taken_at desc)
  where deleted_at is null;

alter table public.results enable row level security;

drop policy if exists "results read own"   on public.results;
drop policy if exists "results insert own" on public.results;
drop policy if exists "results update own" on public.results;

create policy "results read own" on public.results
  for select to authenticated
  using      ((select auth.uid()) = user_id);

create policy "results insert own" on public.results
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "results update own" on public.results
  for update to authenticated
  using      ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Read and add; mark as deleted; and nothing else. A finished result cannot be
-- edited into a different result, because deleted_at is the only column anyone is
-- allowed to write after the fact. There is no delete grant either: closing an
-- account removes the rows through "on delete cascade" above.
--
-- The insert grant names its four columns rather than the whole table. Without
-- that, anybody could insert rows with deleted_at already set — rows the ceiling
-- below would not have counted — and then clear the marks afterwards. created_at
-- is left out for the same reason in a smaller way: it is the server's record of
-- when a row arrived, not something the sender gets to choose.
revoke all on public.results from anon, authenticated;
grant select                                  on public.results to authenticated;
grant insert (user_id, quiz, code, taken_at)  on public.results to authenticated;
grant update (deleted_at)                     on public.results to authenticated;

-- A ceiling, so that a bug or a script cannot fill the free plan's database with
-- one person's rows. Two thousand results is far more than anyone will finish and
-- ten times what a device keeps.
--
-- It counts EVERY row the account holds, deleted or not. Counting only the live
-- ones made the ceiling meaningless: insert two thousand, mark them all deleted,
-- insert two thousand more, and nothing was ever refused.
--
-- It sits on public.results and nowhere else. It cannot affect signing up, signing
-- in or setting a password, because none of those inserts a result. The worst it
-- can do is refuse one save, and the reader still has that result on their device
-- and in their own URL.
create or replace function public.results_row_cap()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  held bigint;
begin
  -- An update can only ever write deleted_at, so it can never add a row, and the
  -- one kind that can raise the number of LIVE rows is one that takes a mark off
  -- again. Everything else, including "clear my results everywhere" marking two
  -- thousand rows at once, is waved through without counting anything.
  --
  -- OLD is read only inside this branch: in a row trigger firing on INSERT it has
  -- no tuple structure at all, and touching one of its columns there is an error.
  if tg_op = 'UPDATE' then
    if old.deleted_at is null or new.deleted_at is not null then
      return new;
    end if;
  end if;

  select count(*) into held
  from public.results
  where user_id = new.user_id;

  -- Before the row goes in there has to be room for it; afterwards it has to fit.
  if (tg_when = 'BEFORE' and held >= 2000) or (tg_when = 'AFTER' and held > 2000) then
    raise exception 'This account already holds 2000 results.'
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

drop trigger if exists results_row_cap on public.results;
create trigger results_row_cap
  before insert or update on public.results
  for each row execute function public.results_row_cap();

-- The same count again, once the rows are actually in. Belt and braces.
--
-- Postgres lets a BEFORE row trigger see the rows its own statement has already
-- put in, so the trigger above should stop a single insert of fifty thousand at
-- row two thousand by itself. This second look does not rest on that: it runs when
-- the rows are in place, counts what is really there, and if the ceiling has been
-- passed by any route it refuses and the whole statement is rolled back. It costs
-- one more count per row on a table that holds two thousand rows a person at most.
drop trigger if exists results_row_cap_after on public.results;
create trigger results_row_cap_after
  after insert on public.results
  for each row execute function public.results_row_cap();


-- 3 -------------------------------------------------------------- game_stats
-- One row per stored value, keyed exactly as each game keys its own storage, so
-- that the device and the account never need a translation table between them.
-- All seven keys are allowed; today the site syncs three of them.

create table if not exists public.game_stats (
  user_id    uuid        not null references auth.users on delete cascade,
  key        text        not null check (key in (
                'sls.best', 'sls.seen', 'sls.fooled', 'sls.canon',
                'wsi.best', 'wsi.seen', 'wsi.mix')),
  -- Small on purpose. What v1 puts in here is two numbers and one short word, so eight
  -- kilobytes is already far more than it needs. The first version of this file allowed
  -- just under 64 KB, which is Postgres's own limit for an index entry rather than a size
  -- anything here has a reason to be: one account could have filled the free plan's
  -- database on its own without a single row ever looking wrong.
  --
  -- Raise it when the seen-lists are kept in the account as well. sls.seen and wsi.seen
  -- are lists of the lines a player has already been shown, and those do grow.
  value      jsonb       not null constraint game_stats_value_small
                                  check (pg_column_size(value) < 8192),
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

-- And the same ceiling for a table that is already there from an earlier run of this file,
-- which would otherwise keep the old one. Both names are dropped: the first version left
-- the check unnamed, so Postgres called it game_stats_value_check.
alter table public.game_stats drop constraint if exists game_stats_value_check;
alter table public.game_stats drop constraint if exists game_stats_value_small;
alter table public.game_stats add  constraint game_stats_value_small
  check (pg_column_size(value) < 8192);

alter table public.game_stats enable row level security;

drop policy if exists "game read own"   on public.game_stats;
drop policy if exists "game insert own" on public.game_stats;
drop policy if exists "game update own" on public.game_stats;
drop policy if exists "game delete own" on public.game_stats;
-- An older name for the same thing, in case this file has been run before.
drop policy if exists "game write own"  on public.game_stats;

create policy "game read own" on public.game_stats
  for select to authenticated
  using      ((select auth.uid()) = user_id);

create policy "game insert own" on public.game_stats
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "game update own" on public.game_stats
  for update to authenticated
  using      ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "game delete own" on public.game_stats
  for delete to authenticated
  using      ((select auth.uid()) = user_id);

revoke all on public.game_stats from anon, authenticated;
grant select, insert, update, delete on public.game_stats to authenticated;


-- 4 ----------------------------------------------------------- auth_email_log
-- What the site sent on Supabase's behalf, so the health check can say whether the
-- email hook is actually firing.
--
-- It holds NO email address and no user id: the kind of message, whether it went,
-- and when. A list of who signed up and at what hour is precisely the thing this
-- site must not build by accident, and the only way to be sure of that is to have
-- nowhere to put it.

create table if not exists public.auth_email_log (
  webhook_id text        primary key,
  at         timestamptz not null default now(),
  action     text        not null,
  ok         boolean     not null,
  detail     text
);

create index if not exists auth_email_log_at on public.auth_email_log (at desc);

alter table public.auth_email_log enable row level security;
revoke all on public.auth_email_log from anon, authenticated;
-- No policies at all, deliberately. Only the site's secret key, on the server,
-- ever touches this table, and that key bypasses row-level security.


-- ============================================================================
-- That is everything. If it ran without a red error message, the database is
-- ready and the next step is back in Vercel, setting the environment variables.
-- ============================================================================
