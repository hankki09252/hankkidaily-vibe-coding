-- 영업ON / Supabase schema v1
-- 각 사용자는 자신의 고객과 활동만 조회/수정할 수 있도록 RLS를 강제한다.

create extension if not exists pgcrypto;

create table if not exists public.saleson_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role_title text,
  company_name text,
  phone text,
  default_message_template text not null default '{고객명}님 안녕하세요. 오늘 인사드린 {회사} {내이름}입니다. 바쁘신 와중에 시간 내주셔서 감사합니다. 필요하신 부분 있으시면 언제든 편하게 연락주세요.',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.saleson_customers (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  company text,
  role_title text,
  phone text,
  phone_digits text,
  email text,
  stage text not null default 'new' check (stage in ('new','talk','quote','client','hold')),
  is_hot boolean not null default false,
  memo text,
  last_contact_at date,
  next_contact_at date,
  cadence_days integer not null default 30 check (cadence_days between 1 and 3650),
  business_card_path text,
  source text not null default 'manual' check (source in ('manual','card_scan','import')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists saleson_customer_phone_per_owner
  on public.saleson_customers(owner_id, phone_digits)
  where phone_digits is not null and phone_digits <> '';
create index if not exists saleson_customers_owner_next_idx
  on public.saleson_customers(owner_id, next_contact_at);
create index if not exists saleson_customers_owner_stage_idx
  on public.saleson_customers(owner_id, stage);

create table if not exists public.saleson_activities (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  customer_id uuid not null references public.saleson_customers(id) on delete cascade,
  activity_type text not null check (activity_type in ('registered','call','sms','visit','quote','memo','followup','other')),
  note text,
  happened_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists saleson_activities_customer_idx
  on public.saleson_activities(owner_id, customer_id, happened_at desc);

create table if not exists public.saleson_message_templates (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text not null,
  template_type text not null default 'custom' check (template_type in ('first_meeting','followup','seasonal','client_care','custom')),
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.saleson_push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null,
  p256dh text,
  auth_key text,
  user_agent text,
  created_at timestamptz not null default now(),
  unique(owner_id, endpoint)
);

alter table public.saleson_profiles enable row level security;
alter table public.saleson_customers enable row level security;
alter table public.saleson_activities enable row level security;
alter table public.saleson_message_templates enable row level security;
alter table public.saleson_push_subscriptions enable row level security;

create policy "saleson_profiles_select_own" on public.saleson_profiles for select using (auth.uid() = id);
create policy "saleson_profiles_insert_own" on public.saleson_profiles for insert with check (auth.uid() = id);
create policy "saleson_profiles_update_own" on public.saleson_profiles for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "saleson_customers_select_own" on public.saleson_customers for select using (auth.uid() = owner_id);
create policy "saleson_customers_insert_own" on public.saleson_customers for insert with check (auth.uid() = owner_id);
create policy "saleson_customers_update_own" on public.saleson_customers for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "saleson_customers_delete_own" on public.saleson_customers for delete using (auth.uid() = owner_id);

create policy "saleson_activities_select_own" on public.saleson_activities for select using (auth.uid() = owner_id);
create policy "saleson_activities_insert_own" on public.saleson_activities for insert with check (
  auth.uid() = owner_id and exists (
    select 1 from public.saleson_customers c where c.id = customer_id and c.owner_id = auth.uid()
  )
);
create policy "saleson_activities_update_own" on public.saleson_activities for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "saleson_activities_delete_own" on public.saleson_activities for delete using (auth.uid() = owner_id);

create policy "saleson_templates_select_own" on public.saleson_message_templates for select using (auth.uid() = owner_id);
create policy "saleson_templates_insert_own" on public.saleson_message_templates for insert with check (auth.uid() = owner_id);
create policy "saleson_templates_update_own" on public.saleson_message_templates for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "saleson_templates_delete_own" on public.saleson_message_templates for delete using (auth.uid() = owner_id);

create policy "saleson_push_select_own" on public.saleson_push_subscriptions for select using (auth.uid() = owner_id);
create policy "saleson_push_insert_own" on public.saleson_push_subscriptions for insert with check (auth.uid() = owner_id);
create policy "saleson_push_delete_own" on public.saleson_push_subscriptions for delete using (auth.uid() = owner_id);

create or replace function public.saleson_touch_updated_at()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists saleson_profiles_touch on public.saleson_profiles;
create trigger saleson_profiles_touch before update on public.saleson_profiles
for each row execute function public.saleson_touch_updated_at();

drop trigger if exists saleson_customers_touch on public.saleson_customers;
create trigger saleson_customers_touch before update on public.saleson_customers
for each row execute function public.saleson_touch_updated_at();

drop trigger if exists saleson_templates_touch on public.saleson_message_templates;
create trigger saleson_templates_touch before update on public.saleson_message_templates
for each row execute function public.saleson_touch_updated_at();

insert into storage.buckets (id, name, public)
values ('saleson-cards','saleson-cards',false)
on conflict (id) do nothing;

create policy "saleson_card_upload_own" on storage.objects for insert to authenticated
with check (bucket_id='saleson-cards' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "saleson_card_read_own" on storage.objects for select to authenticated
using (bucket_id='saleson-cards' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "saleson_card_delete_own" on storage.objects for delete to authenticated
using (bucket_id='saleson-cards' and (storage.foldername(name))[1] = auth.uid()::text);
