-- ============================================================
-- CamionRecrute — Incremental migration (Phase 1+ updates)
-- Run in: Supabase Dashboard → SQL Editor → New query
--
-- Safe to re-run: uses IF NOT EXISTS / ADD COLUMN IF NOT EXISTS.
-- Use this when schema.sql was already run on an older version.
-- ============================================================

-- ------------------------------------------------------------
-- company_applications — details jsonb, lead link, core columns
-- ------------------------------------------------------------
alter table public.company_applications
  add column if not exists contact_title text;

alter table public.company_applications
  add column if not exists website text;

alter table public.company_applications
  add column if not exists city_region text;

alter table public.company_applications
  add column if not exists position_type text;

alter table public.company_applications
  add column if not exists drivers_count text;

alter table public.company_applications
  add column if not exists details jsonb default '{}'::jsonb;

alter table public.company_applications
  add column if not exists locale text default 'fr';

alter table public.company_applications
  add column if not exists admin_notes text;

alter table public.company_applications
  add column if not exists synced_zoho boolean not null default false;

alter table public.company_applications
  add column if not exists synced_excel boolean not null default false;

alter table public.company_applications
  add column if not exists lead_id uuid;

-- Backfill null details before NOT NULL constraint
update public.company_applications
set details = '{}'::jsonb
where details is null;

alter table public.company_applications
  alter column details set default '{}'::jsonb;

alter table public.company_applications
  alter column details set not null;

-- Foreign key: company_applications.lead_id → company_leads.id
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'company_applications_lead_id_fkey'
  ) then
    alter table public.company_applications
      add constraint company_applications_lead_id_fkey
      foreign key (lead_id) references public.company_leads(id)
      on delete set null;
  end if;
end $$;

-- ------------------------------------------------------------
-- driver_applications — full driver form fields
-- ------------------------------------------------------------
alter table public.driver_applications
  add column if not exists city text;

alter table public.driver_applications
  add column if not exists province text;

alter table public.driver_applications
  add column if not exists years_experience text;

alter table public.driver_applications
  add column if not exists equipment text[] default '{}';

alter table public.driver_applications
  add column if not exists license_classes text[] default '{}';

alter table public.driver_applications
  add column if not exists transport_types text[] default '{}';

alter table public.driver_applications
  add column if not exists available_from date;

alter table public.driver_applications
  add column if not exists desired_salary text;

alter table public.driver_applications
  add column if not exists legal_right_to_work text;

alter table public.driver_applications
  add column if not exists legal_status text;

alter table public.driver_applications
  add column if not exists position_types text[] default '{}';

alter table public.driver_applications
  add column if not exists distance_regions text[] default '{}';

alter table public.driver_applications
  add column if not exists schedule text[] default '{}';

alter table public.driver_applications
  add column if not exists employment_types text[] default '{}';

alter table public.driver_applications
  add column if not exists languages text[] default '{}';

alter table public.driver_applications
  add column if not exists additional_notes text;

alter table public.driver_applications
  add column if not exists locale text default 'fr';

alter table public.driver_applications
  add column if not exists admin_notes text;

alter table public.driver_applications
  add column if not exists synced_zoho boolean not null default false;

alter table public.driver_applications
  add column if not exists synced_excel boolean not null default false;

-- ------------------------------------------------------------
-- company_leads — homepage contact + sync flags
-- ------------------------------------------------------------
alter table public.company_leads
  add column if not exists message text;

alter table public.company_leads
  add column if not exists locale text default 'fr';

alter table public.company_leads
  add column if not exists admin_notes text;

alter table public.company_leads
  add column if not exists synced_zoho boolean not null default false;

alter table public.company_leads
  add column if not exists synced_excel boolean not null default false;

-- ------------------------------------------------------------
-- Indexes (admin filters + JSONB search)
-- ------------------------------------------------------------
create index if not exists idx_leads_status
  on public.company_leads(status);

create index if not exists idx_leads_created
  on public.company_leads(created_at desc);

create index if not exists idx_drivers_status
  on public.driver_applications(status);

create index if not exists idx_drivers_created
  on public.driver_applications(created_at desc);

create index if not exists idx_drivers_class
  on public.driver_applications using gin(license_classes);

create index if not exists idx_drivers_region
  on public.driver_applications using gin(distance_regions);

create index if not exists idx_capps_status
  on public.company_applications(status);

create index if not exists idx_capps_created
  on public.company_applications(created_at desc);

create index if not exists idx_capps_details
  on public.company_applications using gin(details);

create index if not exists idx_capps_lead_id
  on public.company_applications(lead_id)
  where lead_id is not null;

-- ------------------------------------------------------------
-- app_settings — ensure integration keys exist
-- ------------------------------------------------------------
insert into public.app_settings (key, value) values
  ('smtp_host',              ''),
  ('smtp_port',              '587'),
  ('smtp_user',              ''),
  ('smtp_pass',              ''),
  ('smtp_from_email',        ''),
  ('smtp_from_name',         'CamionRecrute'),
  ('smtp_enabled',           'false'),
  ('zoho_client_id',         ''),
  ('zoho_client_secret',     ''),
  ('zoho_refresh_token',     ''),
  ('zoho_account_url',       'accounts.zoho.com'),
  ('zoho_enabled',           'false'),
  ('onedrive_tenant_id',     ''),
  ('onedrive_client_id',     ''),
  ('onedrive_client_secret', ''),
  ('onedrive_drive_id',      ''),
  ('onedrive_file_id',       ''),
  ('onedrive_sheet_name',    'Sheet1'),
  ('onedrive_enabled',       'false')
on conflict (key) do nothing;
