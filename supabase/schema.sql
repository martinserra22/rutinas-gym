-- =============================================================
-- Rutinas Gym · Esquema para Supabase
-- Ejecutar completo en: Dashboard > SQL Editor > New query > Run
-- =============================================================

-- Registro serie por serie (modo entrenamiento).
-- "hecho" marca la serie completada; updated_at permite saber
-- cuál fue el último entrenamiento realizado.
create table if not exists public.registros_serie (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  dia text not null,            -- 'd1'..'d5' | 'abs'
  semana int not null check (semana between 1 and 8),
  ejercicio int not null,       -- índice del ejercicio dentro del día (0-based)
  orden int not null,           -- número de serie (0-based)
  kg text,
  reps text,
  hecho boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (user_id, dia, semana, ejercicio, orden)
);

-- Planilla semanal (el equivalente digital de la hoja de papel).
create table if not exists public.planilla (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  dia text not null,
  semana int not null check (semana between 1 and 8),
  ejercicio int not null,
  valor text,
  updated_at timestamptz not null default now(),
  unique (user_id, dia, semana, ejercicio)
);

-- Estado general del usuario (semana actual del programa).
create table if not exists public.estado (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  semana_actual int not null default 1 check (semana_actual between 1 and 8),
  updated_at timestamptz not null default now()
);

-- updated_at automático
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_touch_registros on public.registros_serie;
create trigger trg_touch_registros before update on public.registros_serie
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_touch_planilla on public.planilla;
create trigger trg_touch_planilla before update on public.planilla
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_touch_estado on public.estado;
create trigger trg_touch_estado before update on public.estado
  for each row execute function public.touch_updated_at();

-- =============================================================
-- RLS: cada usuario solo ve y toca sus propios datos
-- =============================================================
alter table public.registros_serie enable row level security;
alter table public.planilla enable row level security;
alter table public.estado enable row level security;

drop policy if exists "registros propios" on public.registros_serie;
create policy "registros propios" on public.registros_serie
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "planilla propia" on public.planilla;
create policy "planilla propia" on public.planilla
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "estado propio" on public.estado;
create policy "estado propio" on public.estado
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Índices para las consultas de la app
create index if not exists idx_registros_user_fecha
  on public.registros_serie (user_id, updated_at desc);
create index if not exists idx_planilla_user
  on public.planilla (user_id, dia, ejercicio, semana);
