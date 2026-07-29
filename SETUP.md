# Setup guide (first-time deploy)

This app is code only until you connect it to Supabase, Vercel, and Shopify. None of the
steps below involve pasting secrets into a chat — every credential goes directly into
the Supabase, Vercel, or Shopify dashboard.

**Important:** if you previously pasted a Shopify Client Secret into a chat conversation,
rotate it in your Shopify Partner/Dev Dashboard (App -> Settings -> Credentials ->
"Rotate" next to Secret). This app doesn't actually use that Client ID/Secret pair though —
see the Shopify section below for the simpler token this app uses instead.

## 1. Supabase — the database

1. Go to supabase.com and create a new project (free tier is fine). Save the database
   password it gives you somewhere safe — you won't need it for this app, but don't lose it.
2. Once the project is ready, open **SQL Editor** in the left sidebar, click **New query**,
   paste in the entire contents of `supabase/schema.sql` from this repo, and click **Run**.
   This creates the tables the app needs.
3. Go to **Project Settings -> API**. You'll need three values from this page later:
   - **Project URL**
   - **anon public** key
   - **service_role** key (this one is powerful — never expose it in a browser or commit it)
4. Turn off public sign-ups so random people can't log in:
   **Authentication -> Providers -> Email -> toggle off "Allow new users to sign up"**.
5. Add your teammates: **Authentication -> Users -> Add user -> Invite user**, and enter
   each teammate's email. This is how you control who can log in — there's no separate
   allowlist to maintain in code.

## 2. Vercel — hosting

1. In Vercel, click **Add New -> Project**, and import the `TYPICAL` GitHub repository.
2. Set the branch to deploy from to `claude/influencer-gifting-dashboard-y44fa3` (or merge
   it into your main branch first, whichever you prefer).
3. Before the first deploy finishes, go to **Settings -> Environment Variables** and add:
   - `NEXT_PUBLIC_SUPABASE_URL` — from Supabase step 3
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from Supabase step 3
   - `SUPABASE_SERVICE_ROLE_KEY` — from Supabase step 3
   - `SHOPIFY_SHOP_DOMAIN` — e.g. `your-store.myshopify.com`
   - `SHOPIFY_ADMIN_ACCESS_TOKEN` — from the Shopify section below
   - `CRON_SECRET` — make up any long random string (e.g. run `openssl rand -hex 32`
     in a terminal) and paste the result here. Vercel automatically sends this as a
     Bearer token to your own cron endpoint, so nobody else can trigger it.
4. Redeploy after adding the variables (Vercel does this automatically on env var changes,
   or click **Deployments -> ... -> Redeploy**).

## 3. Shopify — connect your store

For a single internal store like this, a **Custom App** access token is the simplest and
standard approach — created directly in your store's admin, no OAuth or redirect URLs
needed (that's a different, more complex flow meant for apps other people install into
their own separate stores).

1. Log into your store's admin at `https://your-store.myshopify.com/admin`.
2. Go to **Settings** (bottom of the left sidebar) -> **Apps and sales channels**.
3. Click **Develop apps** (top right). If you see a one-time "Allow custom app
   development" button, click it.
4. Click **Create an app**, name it something like "Influencer Dashboard Sync".
5. Click **Configure Admin API scopes**, and check the boxes for:
   - `read_orders`
   - `read_customers`
   Click **Save**.
6. Click the **API credentials** tab, then click **Install app** (top right), confirm.
7. Under **Admin API access token**, click **Reveal token once** and copy it immediately —
   Shopify only shows it this one time. Paste it directly into Vercel's
   `SHOPIFY_ADMIN_ACCESS_TOKEN` variable, not into this chat.

## 4. Turn on the sync job

The `vercel.json` in this repo schedules `/api/cron/sync-shopify` to run once a day —
that's the most frequent cron Vercel allows on its free **Hobby** plan.

- **If you're on Vercel Pro**, edit the `schedule` in `vercel.json` to
  `"*/10 * * * *"` (every 10 minutes) and redeploy.
- **If you're on Hobby and want faster syncing without upgrading**, use a free
  external scheduler like cron-job.org to send a request every 5-10 minutes to
  `https://your-app.vercel.app/api/cron/sync-shopify` with the header
  `Authorization: Bearer <your CRON_SECRET value>`.

You can also trigger a sync manually any time by visiting that URL yourself with the
same header (e.g. via a tool like Postman, or `curl -H "Authorization: Bearer ..." <url>`).

## 5. Try it

1. Go to your Vercel URL. You should be redirected to `/login`.
2. Enter one of the emails you invited in Supabase step 5, and check your inbox for the
   sign-in link.
3. The dashboard will be empty until the first Shopify sync runs (or until you trigger
   it manually per step 4). New orders tagged "Influencer" or "marketing" in Shopify will
   appear as new cards automatically.

## Notes on fonts

The design mockup specifies TYPICAL's licensed brand fonts (Arizona Flare, Founders
Grotesk, Victor Serif). Those aren't publicly available, so this build uses close
free alternatives (Fraunces for display/editorial, Archivo for sans) via
`next/font/google` in `app/layout.tsx`. Swap in the real font files there once you
have a license for them.
