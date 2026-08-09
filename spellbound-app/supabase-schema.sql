-- ============================================================================
-- Bizzing Bee — database schema.  Paste into Supabase → SQL Editor → Run.
--
-- WHAT IS AND IS NOT STORED HERE
--   Stored: one adult's email (in Supabase's own auth.users), and per child an
--   opaque id, a display name the child invents, a spelling level, and a progress
--   blob.
--
--   NOT stored: the child's real name, their age, or anything else that could
--   identify them. That is enforced by this schema having nowhere to put it, not
--   by the client promising to behave — a column that does not exist cannot be
--   filled in by a future careless commit.
--
-- ROW-LEVEL SECURITY IS THE WHOLE SECURITY MODEL. The anon key ships in the client
-- and is public by design; these policies are what stop it reading anything. Every
-- policy below reduces to "the row belongs to the signed-in parent".
-- ============================================================================

-- ---------- children ----------
create table if not exists public.children (
  id            uuid primary key default gen_random_uuid(),
  parent_id     uuid not null references auth.users(id) on delete cascade,
  display_name  text not null default 'Speller',   -- a nickname the CHILD picks, not a legal name
  spell_level   int  not null default 1,           -- self-declared, then corrected by the placement test
  avatar        text,
  theme         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint display_name_len check (char_length(display_name) between 1 and 24),
  constraint spell_level_range check (spell_level between 1 and 20)
);
create index if not exists children_parent_idx on public.children(parent_id);

-- ---------- progress ----------
-- One JSONB blob per child rather than thirty normalised tables. The progress shape
-- changes every time a feature ships — lists, vocab, trail, ultra, trivia — and a
-- blob absorbs that where a schema would need a migration each time. Nothing here is
-- ever queried by its internals; it is written whole and read whole.
create table if not exists public.progress (
  child_id    uuid primary key references public.children(id) on delete cascade,
  parent_id   uuid not null references auth.users(id) on delete cascade,
  payload     jsonb not null default '{}'::jsonb,
  device_id   text,                                 -- which device wrote last, for conflict notes
  updated_at  timestamptz not null default now()
);
create index if not exists progress_parent_idx on public.progress(parent_id);

-- ---------- accounts (billing lives here later) ----------
create table if not exists public.accounts (
  id                  uuid primary key references auth.users(id) on delete cascade,
  tier                text not null default 'free',
  addons              jsonb not null default '{}'::jsonb,
  stripe_customer_id  text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint tier_known check (tier in ('free','beginner','regional'))
);

-- Create the account row automatically on sign-up, so the client never has to.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.accounts (id) values (new.id) on conflict do nothing;
  return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- row-level security ----------
alter table public.children enable row level security;
alter table public.progress enable row level security;
alter table public.accounts enable row level security;

drop policy if exists children_own on public.children;
create policy children_own on public.children
  for all using (parent_id = auth.uid()) with check (parent_id = auth.uid());

drop policy if exists progress_own on public.progress;
create policy progress_own on public.progress
  for all using (parent_id = auth.uid()) with check (parent_id = auth.uid());

-- Read and update your own account row; the TIER IS DELIBERATELY NOT UPDATABLE from
-- the client. Only the Stripe webhook (service role) may change it — otherwise
-- anyone could grant themselves Regional Speller from the browser console.
drop policy if exists accounts_read on public.accounts;
create policy accounts_read on public.accounts for select using (id = auth.uid());

drop policy if exists accounts_update on public.accounts;
create policy accounts_update on public.accounts for update
  using (id = auth.uid())
  with check (id = auth.uid() and tier = (select tier from public.accounts a where a.id = auth.uid()));

-- ---------- updated_at maintenance ----------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists children_touch on public.children;
create trigger children_touch before update on public.children
  for each row execute function public.touch_updated_at();

drop trigger if exists progress_touch on public.progress;
create trigger progress_touch before update on public.progress
  for each row execute function public.touch_updated_at();
