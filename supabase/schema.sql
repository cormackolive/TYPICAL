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
  line_items_total    numeric,
  last_synced_at      timestamptz not null default now()
);

-- Safe to re-run: adds the column if this table already existed before it was introduced.
alter table shopify_order add column if not exists line_items_total numeric;

create index if not exists shopify_order_influencer_id_idx on shopify_order (influencer_id);

create table if not exists assignment (
  id                 uuid primary key default gen_random_uuid(),
  influencer_name    text,
  team_member        text,
  message            text,
  due_date           date,
  status             text not null default 'Pending' check (status in ('Pending', 'In progress', 'Complete')),
  created_at         timestamptz not null default now()
);

alter table assignment enable row level security;
-- No policies: this table is only ever accessed via the service_role key from
-- server code (see app/api/assignments), consistent with influencer/shopify_order.

-- Single-row table holding the Shopify OAuth token for the connected store.
-- Only ever read/written by server-side code using the service_role key — never exposed to the browser.
create table if not exists shopify_shop (
  id              int primary key default 1,
  shop_domain     text not null,
  access_token    text not null,
  installed_at    timestamptz not null default now(),
  last_synced_at  timestamptz,
  constraint shopify_shop_singleton check (id = 1)
);

alter table influencer enable row level security;
alter table shopify_order enable row level security;
alter table shopify_shop enable row level security;

-- These "authenticated" policies are intentionally dead weight: the app no longer creates
-- Supabase Auth sessions (access is gated by a shared password in middleware.ts instead),
-- so they never match anyone. That's correct — it means the anon key can't read/write
-- anything. All real app access goes through server code using the service_role key.
create policy "authenticated read influencer" on influencer for select to authenticated using (true);
create policy "authenticated write influencer" on influencer for insert to authenticated with check (true);
create policy "authenticated update influencer" on influencer for update to authenticated using (true);

create policy "authenticated read shopify_order" on shopify_order for select to authenticated using (true);

-- No policies on shopify_shop: it is only ever accessed via the service_role key (bypasses RLS),
-- so it stays unreadable to every browser client, authenticated or not.

alter publication supabase_realtime add table influencer;
alter publication supabase_realtime add table shopify_order;
