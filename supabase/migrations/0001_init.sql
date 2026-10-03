-- Blind Ballot: tables, privileges, row-level security and reveal_round.
--
-- The database guards the answers; server code guards the party labels.
-- No table here has a party column: a card's party lives only in code
-- (lib/deck.ts), because RLS filters rows, not columns.

-- Tables

-- The party the user says they identify with, asked once before round 1.
create table public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  stated_party text not null check (stated_party in ('D', 'R', 'L', 'I', 'none')),
  created_at timestamptz not null default now()
);

-- A dealt round: the 12 card IDs are stored, so a refresh resumes it.
-- revealed_at stays null until reveal_round stamps it.
create table public.rounds (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  seed text not null,
  plank_ids text[] not null check (cardinality(plank_ids) = 12),
  created_at timestamptz not null default now(),
  revealed_at timestamptz,
  -- A player has only two seeds, {user_id}:0:0 and {user_id}:0:1, so this
  -- caps them at two rounds, even if two "start" requests race.
  unique (user_id, seed)
);

-- The policies filter on user_id, so index it.
create index rounds_user_id_idx on public.rounds (user_id);

-- One unrevealed round per user. Two "start" requests at once: the second
-- gets a unique violation (23505), and the server sends it to the first.
create unique index rounds_one_unrevealed_per_user
  on public.rounds (user_id)
  where revealed_at is null;

-- One row per card answered. Insert-only for users: no update or delete
-- privilege exists, so a vote can't be taken back.
create table public.answers (
  id uuid primary key default gen_random_uuid(),
  round_id uuid not null references public.rounds (id) on delete cascade,
  plank_id text not null,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  vote text not null check (vote in ('support', 'oppose', 'unsure')),
  guess text not null check (guess in ('D', 'R', 'L')),
  created_at timestamptz not null default now(),
  -- One answer per card per round: a double tap or a second tab gets 23505.
  unique (round_id, plank_id)
);

create index answers_user_id_idx on public.answers (user_id);

-- Privileges
--
-- Privileges decide which actions exist at all; RLS then decides which rows.
-- Supabase grants every new table to anon and authenticated by default, so
-- start from nothing and add back only what the app needs. Even a wrong
-- policy can't then let a user update or delete an answer, or create a round.
-- service_role (the secret key, used only by server code) keeps its grants
-- and bypasses RLS; it's how the server inserts rounds.

revoke all on public.profiles, public.rounds, public.answers from anon, authenticated;

-- Read own rounds. No insert: only the server deals rounds.
grant select on public.rounds to authenticated;
-- Read and add own answers. No update or delete: no take-backs.
grant select, insert on public.answers to authenticated;
-- Set and change the stated party (the server action upserts it).
grant select, insert, update on public.profiles to authenticated;

-- Row-level security
--
-- Every policy uses (select auth.uid()) rather than auth.uid(): the subselect
-- runs once per query instead of once per row.

alter table public.profiles enable row level security;
alter table public.rounds enable row level security;
alter table public.answers enable row level security;

-- A user sees only their own profile.
create policy "profiles: select own"
  on public.profiles for select to authenticated
  using (user_id = (select auth.uid()));

-- A user can create a profile only for themselves.
create policy "profiles: insert own"
  on public.profiles for insert to authenticated
  with check (user_id = (select auth.uid()));

-- A user can change only their own profile (using), and can't move it to
-- another user (with check).
create policy "profiles: update own"
  on public.profiles for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- A user sees only their own rounds; anyone else's round is invisible, so
-- its page is a 404.
create policy "rounds: select own"
  on public.rounds for select to authenticated
  using (user_id = (select auth.uid()));

-- A user sees only their own answers.
create policy "answers: select own"
  on public.answers for select to authenticated
  using (user_id = (select auth.uid()));

-- An answer is accepted only when all four hold:
--   1. the row's user_id is the caller (no answering as someone else);
--   2. the round belongs to the caller (no answering in someone else's round);
--   3. the card was dealt in that round (no answering cards outside it);
--   4. the round isn't revealed yet (no answering after seeing the parties).
create policy "answers: insert into own unrevealed round"
  on public.answers for insert to authenticated
  with check (
    answers.user_id = (select auth.uid())
    and exists (
      select 1
      from public.rounds r
      where r.id = answers.round_id
        and r.user_id = (select auth.uid())
        and answers.plank_id = any (r.plank_ids)
        and r.revealed_at is null
    )
  );

-- Reveal
--
-- Users can't update rounds, so this function is the only way to set
-- revealed_at. security definer runs it with the owner's rights, so it does
-- its own ownership check. search_path = '' plus schema-qualified names stop
-- a caller from swapping in their own tables or functions.
--
-- No answer can slip in after the stamp: the reveal needs all 12 cards
-- answered, and unique (round_id, plank_id) allows no 13th.

create function public.reveal_round(rid uuid)
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
  r public.rounds%rowtype;
  answered integer;
  stamp timestamptz;
begin
  -- Lock the caller's round. Two reveals at once: the second waits here,
  -- then sees the first one's stamp. Filtering on user_id means a caller
  -- never locks someone else's round.
  select * into r
  from public.rounds
  where id = rid and user_id = (select auth.uid())
  for update;

  -- Someone else's round and a missing round look the same.
  if not found then
    raise exception 'not_found';
  end if;

  -- Already revealed: return the same stamp, so a refresh is harmless.
  if r.revealed_at is not null then
    return r.revealed_at;
  end if;

  -- The insert policy only admits this round's cards, once each, so the
  -- count is the number of distinct cards answered.
  select count(*) into answered
  from public.answers
  where round_id = rid;

  if answered < cardinality(r.plank_ids) then
    raise exception 'round_incomplete';
  end if;

  update public.rounds
  set revealed_at = now()
  where id = rid
  returning revealed_at into stamp;

  return stamp;
end;
$$;

-- Functions are executable by public by default, and Supabase also grants
-- anon directly, so revoke both. Only signed-in users (guests included) reveal.
revoke execute on function public.reveal_round(uuid) from public, anon;
grant execute on function public.reveal_round(uuid) to authenticated;
