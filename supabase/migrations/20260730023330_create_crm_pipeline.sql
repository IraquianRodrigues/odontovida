-- CRM da clínica: a IA/n8n atua somente até o agendamento confirmado.
-- As etapas operacionais e comerciais posteriores são responsabilidade humana.

create table if not exists public.crm_leads (
  id uuid primary key default gen_random_uuid(),
  cliente_id bigint not null references public.clientes(id) on delete restrict,
  appointment_id uuid references public.appointments(id) on delete set null,
  stage text not null default 'novo_lead'
    check (stage in (
      'novo_lead',
      'primeiro_contato',
      'follow_up',
      'qualificado',
      'agendamento_confirmado',
      'compareceu',
      'nao_compareceu',
      'atendimento_humano',
      'fechado',
      'perdido'
    )),
  source text,
  assigned_to uuid references auth.users(id) on delete set null,
  last_stage_actor text not null default 'ai'
    check (last_stage_actor in ('ai', 'human', 'system')),
  first_contact_at timestamptz,
  follow_up_at timestamptz,
  qualified_at timestamptz,
  appointment_confirmed_at timestamptz,
  human_takeover_at timestamptz,
  closed_at timestamptz,
  lost_reason text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint crm_leads_ai_cannot_own_human_stage check (
    stage not in ('compareceu', 'nao_compareceu', 'atendimento_humano', 'fechado', 'perdido')
    or last_stage_actor <> 'ai'
  )
);

create unique index if not exists crm_leads_appointment_id_unique
  on public.crm_leads (appointment_id)
  where appointment_id is not null;

create index if not exists crm_leads_cliente_id_updated_at_idx
  on public.crm_leads (cliente_id, updated_at desc);

create index if not exists crm_leads_active_stage_updated_at_idx
  on public.crm_leads (stage, updated_at desc)
  where stage not in ('fechado', 'perdido');

create table if not exists public.crm_lead_history (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.crm_leads(id) on delete cascade,
  from_stage text,
  to_stage text not null,
  actor_type text not null check (actor_type in ('ai', 'human', 'system')),
  actor_id uuid references auth.users(id) on delete set null,
  source text not null default 'dashboard',
  note text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists crm_lead_history_lead_id_created_at_idx
  on public.crm_lead_history (lead_id, created_at desc);

create or replace function public.set_crm_lead_updated_at()
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

drop trigger if exists crm_leads_set_updated_at on public.crm_leads;
create trigger crm_leads_set_updated_at
before update on public.crm_leads
for each row execute function public.set_crm_lead_updated_at();

alter table public.crm_leads enable row level security;
alter table public.crm_lead_history enable row level security;

grant select, insert, update, delete on table public.crm_leads to authenticated;
grant select, insert on table public.crm_lead_history to authenticated;
grant all on table public.crm_leads, public.crm_lead_history to service_role;

-- Cada projeto Supabase atende uma única clínica. Assim, qualquer usuário
-- autenticado daquele projeto é um membro da equipe da clínica.
drop policy if exists "Authenticated staff can manage CRM leads" on public.crm_leads;
create policy "Authenticated staff can manage CRM leads"
  on public.crm_leads
  for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated staff can view CRM lead history" on public.crm_lead_history;
create policy "Authenticated staff can view CRM lead history"
  on public.crm_lead_history
  for select
  to authenticated
  using (true);

drop policy if exists "Authenticated staff can append CRM lead history" on public.crm_lead_history;
create policy "Authenticated staff can append CRM lead history"
  on public.crm_lead_history
  for insert
  to authenticated
  with check (true);
