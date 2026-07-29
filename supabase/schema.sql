-- Run this once in the Supabase SQL editor (Dashboard -> SQL Editor -> New query -> paste -> Run).

create extension if not exists "pgcrypto";

create type persona_type as enum ('Lifestyle', 'Home', 'Wellness', 'Personality', 'Environment');

create table if not exists influencer (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  location          text,
  ig_handle         text,
  tiktok_handle     text,
  followers         integer,
  persona           persona_type,
  notes             text,
  ig_post_link      text,
  tiktok_post_link  text,
  story_posted      boolean not null default false,
  created_at        timestamptz not null default now()
);

create unique index if not exists influencer_name_unique on influencer (lower(name));

create table if not exists shopify_order (
  id                  uuid primary key default gen_random_uuid(),
  influencer_id       uuid references influencer(id) on delete set null,
  shopify_order_id    text not null unique,
  order_number        text,
  fulfillment_status  text check (fulfillment_status in ('Unfulfilled', 'Partially complete / In transit', 'Delivered')),
  shipping_address    text,
  items               text,
  tracking            text,
  order_date          date,
  tags                text[] not null default '{}',
  last_synced_at      timestamptz not null default now()
);

create index if not exists shopify_order_influencer_id_idx on shopify_order (influencer_id);

alter table influencer enable row level security;
alter table shopify_order enable row level security;

-- Any logged-in team member (see SETUP.md for how logins are restricted) can read/write the dashboard data.
create policy "authenticated read influencer" on influencer for select to authenticated using (true);
create policy "authenticated write influencer" on influencer for insert to authenticated with check (true);
create policy "authenticated update influencer" on influencer for update to authenticated using (true);

create policy "authenticated read shopify_order" on shopify_order for select to authenticated using (true);

alter publication supabase_realtime add table influencer;
alter publication supabase_realtime add table shopify_order;
