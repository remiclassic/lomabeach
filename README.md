# LOMA Beach Resort (Vite + React)

Marketing site for **Loma Beach Resort**, rebuilt as a standard Vite app with Tailwind CSS v4.  
**Booking:** guests pay through **Stripe Checkout**; serverless routes live under `api/` (intended for **[Vercel](https://vercel.com)**). Static-only hosts (e.g. GitHub Pages) will **not** run `/api/*` — use Vercel or another host that supports serverless functions.

**AI Studio project:** [open in Google AI Studio](https://aistudio.google.com/app/apps/drive/1VGXwmozejX4g-KMyV2-Km6BwbsXkE0qT?showAssistant=true&showPreview=true)

## Run locally

**Prerequisites:** Node.js 18+

1. `npm install`
2. `npm run dev` — UI only (port `5173` by default). The booking “Pay” button calls `/api/create-checkout-session`, which is not served by Vite; use **`npm run vercel:dev`** (after linking the project) to exercise Stripe end-to-end.

**Production build:** `npm run build` then `npm run preview`.

## Deploy (Vercel) — share a stable URL with the client

1. Push this repo to GitHub (or GitLab / Bitbucket).
2. In Vercel: **Add New Project** → import the repo → root directory = this folder (`lomabeach`).
3. **Environment variables** (Production + Preview): see [Stripe & environment variables](#stripe--environment-variables) below.
4. Deploy. Use the `.vercel.app` URL for reviews; add the [custom domain](#domain--dns) when the registrar is final.

`vercel.json` includes a SPA fallback so client-side routes load `index.html`.

## Stripe & environment variables

Set these in the **Vercel** project (Settings → Environment Variables). Never commit real secrets.

| Variable | Purpose |
| --- | --- |
| `STRIPE_SECRET_KEY` | Secret API key (`sk_live_…` or `sk_test_…`). Required for checkout. |
| `STRIPE_WEBHOOK_SECRET` | Signing secret (`whsec_…`) from the webhook endpoint in Stripe Dashboard. |
| `STRIPE_CURRENCY` | Optional. Default `usd`. Use `thb` for Thai baht (and set `VITE_CURRENCY_SYMBOL=฿` in the Vite env). |
| `SITE_URL` | Optional. Canonical origin with `https`, no trailing slash (e.g. `https://www.lomabeach.com`). Used for Stripe success/cancel redirects. If omitted, the API uses the incoming request host. |

**Webhook URL** (after first deploy):  
`https://<your-domain>/api/stripe-webhook`  

In **Stripe Dashboard → Developers → Webhooks → Add endpoint**, choose events at least: **`checkout.session.completed`**. Copy the **signing secret** into `STRIPE_WEBHOOK_SECRET`.

**Nightly rates** are defined once in [`constants/pricing.ts`](constants/pricing.ts). The API recomputes totals from those values (guests cannot spoof the price).

### With the owner (Stripe checklist)

1. Create or complete a **Stripe** account; add **business details** and **payout bank**.
2. Confirm **currency** (USD vs THB) matches `STRIPE_CURRENCY` and display symbol in Vercel env.
3. Decide **policy**: full prepay vs deposit (today’s code uses full **one-time payment**; deposits need a product/process change).
4. **Test mode** first: test keys in Preview deployments, test card `4242 4242 4242 4242`.
5. When the site is on the final domain, switch to **live** keys and add the live **webhook** URL.
6. Ensure someone monitors **Stripe email notifications** or extends `api/stripe-webhook.ts` (e.g. Resend) to notify the front desk.

## Domain & DNS

1. **Register** the name (e.g. `lomabeach.com` or `lomabeachresort.com`) at Namecheap, GoDaddy, etc.
2. In **Vercel → Project → Settings → Domains**, add the apex (`example.com`) and/or `www`.
3. At the registrar, set **DNS** to whatever Vercel shows (A/CNAME records). HTTPS is automatic.
4. Set **`SITE_URL`** and optional **`VITE_PUBLIC_SITE_URL`** / **`VITE_CONTACT_EMAIL`** to match the live domain and inbox you want on the site.

## Professional email

1. Create **mailboxes** (e.g. `hello@`, `bookings@`) via **Google Workspace**, **Microsoft 365**, or **Zoho Mail**.
2. Add the provider’s **MX** (and any **SPF** / **DKIM** they require) at the DNS host.
3. Put the guest-facing address in **`VITE_CONTACT_EMAIL`** so the footer matches.
4. **Transactional mail** (custom booking emails) is optional: Stripe sends receipts; you can later add Resend/SendGrid from the webhook handler.

## Optional: Gemini

If you extend the app with Gemini APIs, copy `.env.example` to `.env` and set `GEMINI_API_KEY` (see `vite.config.ts`).

## Using your own images (from AI Studio / Drive)

The Google link above requires you to sign in; this environment cannot download files from your private Drive for you. Export or download the image bundle from AI Studio, then:

1. Copy `.env.example` to `.env` and set `VITE_USE_LOCAL_IMAGES=true`.
2. Add files under `public/images/` using **exactly** these names (`.jpg` or `.webp` — if you use `.webp`, update paths in `constants/images.ts`):

| Filename | Used for |
| --- | --- |
| `hero.jpg` | Home hero |
| `home-philosophy.jpg` | Home “Our Philosophy” |
| `home-experience-pool.jpg` | Home “Pool & Drinks” |
| `home-experience-hammock.jpg` | Home “Lazy Afternoons” |
| `home-experience-sunset.jpg` | Home “Sunset Views” |
| `gallery-01.jpg` … `gallery-06.jpg` | Gallery page |
| `resort-pool.jpg` | Resort life — Pool Moments |
| `resort-cocktails.jpg` | Resort life — Cocktails |
| `resort-loungers.jpg` | Resort life — Sun Loungers |
| `resort-mornings.jpg` | Resort life — Slow Mornings |
| `resort-golden-hour.jpg` | Resort life — Golden Hour |
| `location.jpg` | Location page map visual |
| `room-beachfront-double-main.jpg`, `room-beachfront-double-2.jpg`, `room-beachfront-double-3.jpg` | Beachfront Double |
| `room-beachfront-family-main.jpg`, `…-2.jpg`, `…-3.jpg`, `…-4.jpg` | Beachfront Family Suite |
| `room-triple-garden-main.jpg`, `room-triple-garden-2.jpg`, `room-triple-garden-3.jpg` | Triple Garden |
| `room-double-garden-main.jpg`, `room-double-garden-2.jpg`, `room-double-garden-3.jpg` | Double Garden |

3. Restart `npm run dev` so Vite picks up the env flag.
