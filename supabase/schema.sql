-- ============================================================
-- CamionRecrute.com — Supabase schema
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- Needed for gen_random_uuid()
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- 1) COMPANY LEADS  (short form on the landing page)
-- ------------------------------------------------------------
create table if not exists public.company_leads (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  company_name  text not null,
  contact_name  text not null,
  phone         text not null,
  email         text not null,
  region        text,
  position_type text,
  drivers_count text,
  message       text,
  locale        text default 'fr',
  -- pipeline: new -> contacted -> form_sent -> matched -> invoiced -> closed
  status        text not null default 'new',
  admin_notes   text,
  synced_zoho   boolean not null default false,
  synced_excel  boolean not null default false
);

-- ------------------------------------------------------------
-- 2) DRIVER APPLICATIONS  (driver application form)
--    Columns kept flat for fast filtering by class/region/etc.
-- ------------------------------------------------------------
create table if not exists public.driver_applications (
  id                 uuid primary key default gen_random_uuid(),
  created_at         timestamptz not null default now(),
  full_name          text not null,
  phone              text not null,
  email              text not null,
  city               text,
  province           text,
  years_experience   text,
  equipment          text[] default '{}',
  license_classes    text[] default '{}',
  transport_types    text[] default '{}',
  available_from     date,
  desired_salary     text,
  legal_right_to_work text,
  legal_status       text,
  position_types     text[] default '{}',
  distance_regions   text[] default '{}',
  schedule           text[] default '{}',
  employment_types   text[] default '{}',
  languages          text[] default '{}',
  locale             text default 'fr',
  status             text not null default 'new',
  admin_notes        text,
  synced_zoho        boolean not null default false,
  synced_excel       boolean not null default false
);

-- ------------------------------------------------------------
-- 3) COMPANY APPLICATIONS  (detailed 12-section form)
--    Core columns + full payload in JSONB.
-- ------------------------------------------------------------
create table if not exists public.company_applications (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  company_name   text not null,
  contact_name   text,
  contact_title  text,
  phone          text,
  email          text,
  website        text,
  city_region    text,
  position_type  text,
  drivers_count  text,
  details        jsonb not null default '{}'::jsonb,
  locale         text default 'fr',
  status         text not null default 'new',
  admin_notes    text,
  synced_zoho    boolean not null default false,
  synced_excel   boolean not null default false,
  -- optional link back to the originating lead
  lead_id        uuid references public.company_leads(id) on delete set null
);

-- helpful indexes for the admin filtering
create index if not exists idx_leads_status   on public.company_leads(status);
create index if not exists idx_leads_created   on public.company_leads(created_at desc);
create index if not exists idx_drivers_status  on public.driver_applications(status);
create index if not exists idx_drivers_created on public.driver_applications(created_at desc);
create index if not exists idx_drivers_class   on public.driver_applications using gin(license_classes);
create index if not exists idx_drivers_region  on public.driver_applications using gin(distance_regions);
create index if not exists idx_capps_status    on public.company_applications(status);
create index if not exists idx_capps_created   on public.company_applications(created_at desc);

-- ============================================================
-- ROW LEVEL SECURITY
-- Public (anon) may INSERT submissions only.
-- Only authenticated (admin) users may read / update / delete.
-- ============================================================
alter table public.company_leads        enable row level security;
alter table public.driver_applications   enable row level security;
alter table public.company_applications  enable row level security;

-- anon INSERT
create policy "anon_insert_leads"   on public.company_leads
  for insert to anon, authenticated with check (true);
create policy "anon_insert_drivers" on public.driver_applications
  for insert to anon, authenticated with check (true);
create policy "anon_insert_capps"   on public.company_applications
  for insert to anon, authenticated with check (true);

-- authenticated full read/manage
create policy "auth_all_leads"   on public.company_leads
  for all to authenticated using (true) with check (true);
create policy "auth_all_drivers" on public.driver_applications
  for all to authenticated using (true) with check (true);
create policy "auth_all_capps"   on public.company_applications
  for all to authenticated using (true) with check (true);

-- ============================================================
-- ADMIN USER
-- Create your admin login in:
--   Supabase Dashboard → Authentication → Users → Add user
-- (Disable public sign-ups under Authentication → Providers → Email)
-- ============================================================

-- ------------------------------------------------------------
-- 4) APP SETTINGS  (admin-managed config: SMTP, Zoho, OneDrive)
-- ------------------------------------------------------------
create table if not exists app_settings (
  key   text primary key,
  value text,
  updated_at timestamptz default now()
);

-- Seed default empty keys
insert into app_settings (key, value) values
  ('smtp_host',              ''),
  ('smtp_port',              '587'),
  ('smtp_user',              ''),
  ('smtp_pass',              ''),
  ('smtp_from_email',        ''),
  ('smtp_from_name',         'CamionRecrute'),
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
  ('onedrive_enabled',       'false'),
  ('smtp_enabled',           'false')
on conflict (key) do nothing;

-- ------------------------------------------------------------
-- SECURITY: app_settings holds SMTP / Zoho / OneDrive secrets.
-- Lock it down so the public anon key CANNOT read or write it.
-- Only authenticated (admin) users may access.
-- ------------------------------------------------------------
alter table public.app_settings enable row level security;

create policy "auth_only_settings" on public.app_settings
  for all to authenticated using (true) with check (true);
