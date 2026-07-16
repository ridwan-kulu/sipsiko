create extension if not exists "pgcrypto";

create type public.user_role as enum (
  'user',
  'expert',
  'admin'
);

create type public.consultation_status as enum (
  'draft',
  'completed',
  'flagged'
);

-- Profil pengguna
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role public.user_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Kondisi atau gangguan
create table public.conditions (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  slug text unique not null,
  description text not null,
  recommendation text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Gejala
create table public.symptoms (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  question text not null,
  explanation text,
  is_crisis boolean not null default false,
  is_active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Aturan sistem pakar
create table public.rules (
  id uuid primary key default gen_random_uuid(),
  condition_id uuid not null
    references public.conditions(id) on delete cascade,
  symptom_id uuid not null
    references public.symptoms(id) on delete cascade,
  expert_weight numeric(4, 3) not null
    check (expert_weight >= 0 and expert_weight <= 1),
  is_required boolean not null default false,
  minimum_duration_days integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (condition_id, symptom_id)
);

-- Sesi konsultasi
create table public.consultations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  status public.consultation_status not null default 'draft',
  consented_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Jawaban pengguna
create table public.answers (
  id uuid primary key default gen_random_uuid(),
  consultation_id uuid not null
    references public.consultations(id) on delete cascade,
  symptom_id uuid not null
    references public.symptoms(id) on delete cascade,
  user_weight numeric(4, 3) not null
    check (user_weight >= 0 and user_weight <= 1),
  duration_days integer check (
    duration_days is null or duration_days >= 0
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (consultation_id, symptom_id)
);

-- Hasil perhitungan
create table public.results (
  id uuid primary key default gen_random_uuid(),
  consultation_id uuid not null
    references public.consultations(id) on delete cascade,
  condition_id uuid not null
    references public.conditions(id) on delete cascade,
  score numeric(5, 4) not null
    check (score >= 0 and score <= 1),
  rank integer not null check (rank > 0),
  explanation jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),

  unique (consultation_id, condition_id)
);

-- Audit perubahan basis pengetahuan
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid not null,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now()
);

-- Index
create index consultations_user_id_idx
  on public.consultations(user_id);

create index answers_consultation_id_idx
  on public.answers(consultation_id);

create index rules_condition_id_idx
  on public.rules(condition_id);

create index rules_symptom_id_idx
  on public.rules(symptom_id);

create index results_consultation_id_idx
  on public.results(consultation_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger conditions_set_updated_at
before update on public.conditions
for each row execute function public.set_updated_at();

create trigger symptoms_set_updated_at
before update on public.symptoms
for each row execute function public.set_updated_at();

create trigger rules_set_updated_at
before update on public.rules
for each row execute function public.set_updated_at();

create trigger consultations_set_updated_at
before update on public.consultations
for each row execute function public.set_updated_at();

create trigger answers_set_updated_at
before update on public.answers
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (
    id,
    full_name,
    role
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    'user'
  );

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.conditions enable row level security;
alter table public.symptoms enable row level security;
alter table public.rules enable row level security;
alter table public.consultations enable row level security;
alter table public.answers enable row level security;
alter table public.results enable row level security;
alter table public.audit_logs enable row level security;

-- Pengguna dapat melihat profil sendiri
create policy "users can read own profile"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

-- Pengguna dapat mengubah nama sendiri, tetapi bukan role
create policy "users can update own profile"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

-- Basis pengetahuan aktif dapat dibaca aplikasi
create policy "active conditions are readable"
on public.conditions
for select
to anon, authenticated
using (is_active = true);

create policy "active symptoms are readable"
on public.symptoms
for select
to anon, authenticated
using (is_active = true);

create policy "rules are readable"
on public.rules
for select
to anon, authenticated
using (true);

-- Pengguna hanya dapat mengakses konsultasi sendiri
create policy "users can read own consultations"
on public.consultations
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "users can create own consultations"
on public.consultations
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "users can update own consultations"
on public.consultations
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "users can delete own consultations"
on public.consultations
for delete
to authenticated
using ((select auth.uid()) = user_id);

-- Jawaban harus berasal dari konsultasi pengguna
create policy "users can read own answers"
on public.answers
for select
to authenticated
using (
  exists (
    select 1
    from public.consultations
    where consultations.id = answers.consultation_id
      and consultations.user_id = (select auth.uid())
  )
);

create policy "users can create own answers"
on public.answers
for insert
to authenticated
with check (
  exists (
    select 1
    from public.consultations
    where consultations.id = answers.consultation_id
      and consultations.user_id = (select auth.uid())
  )
);

create policy "users can update own answers"
on public.answers
for update
to authenticated
using (
  exists (
    select 1
    from public.consultations
    where consultations.id = answers.consultation_id
      and consultations.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.consultations
    where consultations.id = answers.consultation_id
      and consultations.user_id = (select auth.uid())
  )
);

create policy "users can read own results"
on public.results
for select
to authenticated
using (
  exists (
    select 1
    from public.consultations
    where consultations.id = results.consultation_id
      and consultations.user_id = (select auth.uid())
  )
);