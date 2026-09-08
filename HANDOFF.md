# Furnish — Developer Handoff

Everything you need to pick this project up, run it, and finish it.

Written for someone who has **not** worked on this codebase before. If a step
doesn't make sense, follow it literally first and read the explanation after.

---

## 1. What this is

An online store selling handcrafted wooden kitchenware. Customers browse
products, add to cart, pay with Razorpay, and the shop owner manages
everything from an admin panel.

**It is live right now at https://furnis.in**

| | |
|---|---|
| Frontend + backend | Next.js 16 (App Router, JavaScript — not TypeScript) |
| Database + login + images | Supabase |
| Payments | Razorpay (currently **test mode** — no real money) |
| Hosting | Cloudflare **Workers** (not Pages — this matters, see §7) |
| Email | Resend (installed, not switched on yet) |

---

## 2. Current status — read this first

The site is deployed and the storefront works. **But it is not ready to take
real customer money yet.** Section 5 is the list of what's missing.

| Works | Doesn't work yet |
|---|---|
| Storefront, cart, product pages | Order confirmation emails |
| Login / signup | The payment webhook (needs a secret set) |
| Admin panel: products, customers, orders, team | Search engines can't see the catalog (§6) |
| Test-mode checkout end to end | Saved addresses aren't used at checkout |

---

## 3. Getting it running on your machine

### What you need installed

- **Node.js 22 or newer.** Check with `node -v`. Version 20 will not work —
  Cloudflare's CLI refuses to run on it. Get it from nodejs.org (LTS).
- **Git**
- A code editor (VS Code is fine)

### What access you need — ask the project owner

You cannot run this without these. Ask for:

1. **Supabase** — invite to the project (database, logins, images)
2. **Cloudflare** — invite to the account (hosting)
3. **Razorpay** — test mode API keys
4. **GitHub** — write access to this repo

### Steps

```bash
git clone https://github.com/jagdishnjaggu/Furnish.git
cd Furnish
npm install
```

Create your environment file:

```bash
cp .env.local.example .env.local
```

Now open `.env.local` and fill in the real values. Get them from:

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same page. Safe to be public. |
| `SUPABASE_SERVICE_ROLE_KEY` | Same page. **SECRET — never share or commit** |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay → Settings → API Keys (test mode) |
| `RAZORPAY_KEY_ID` | Same value as above |
| `RAZORPAY_KEY_SECRET` | Same page. **SECRET** |

Leave `RAZORPAY_WEBHOOK_SECRET`, `RESEND_API_KEY` and `RESEND_FROM_EMAIL`
empty for now. The app handles them being blank.

Start it:

```bash
npm run dev
```

Open http://localhost:3000

### Making yourself an admin

Sign up on the site normally, then in Supabase → SQL Editor, run
`supabase/make_admin.sql` after changing the email inside it to yours.
Sign out, sign back in, and you can reach `/admin`.

---

## 4. What was recently done (context for the code you'll read)

The Razorpay integration originally saved the order **only** from the
customer's browser after payment. If someone closed the tab at the wrong
moment, Razorpay took their money and the shop had no record of the order.
Stock was also never reduced when something sold.

That was rewritten. **Orders now happen in two steps:**

```
1. Customer clicks Pay
   -> /api/razorpay/create-order saves the order as "pending"
      (with the items and shipping address) BEFORE payment happens

2. Customer pays

3. Confirmation - whichever of these arrives first:
      a) /api/razorpay/verify   (the customer's browser)
      b) /api/razorpay/webhook  (Razorpay's server, always fires)

   Both call the same confirm_order() database function, which flips the
   order to "confirmed" and reduces stock. It locks the row, so if both
   arrive at once only one does the work. The other is ignored safely.
```

**Why this matters:** the webhook is the safety net. It fires even if the
customer's browser dies. That's why the order has to be saved *before*
payment — the webhook has no browser to ask what was in the cart.

**One deliberate rule to know about:** if something sold out between payment
and confirmation, the order is still saved. Stock goes to zero (never
negative) and the order is flagged `needs_review` with a red badge in the
admin panel. Rejecting a paid order would leave a customer who paid with
nothing, which is worse. Someone has to handle those manually.

Other things fixed in the same change:

- `profiles.email` column didn't exist, so the admin Customers and Orders
  pages queried a missing column and always showed "no data"
- Admin dashboard numbers were all wrong (security rules hid the data from
  the very query counting it)
- Admins couldn't edit their own name/phone
- Adding the same product to the cart twice created two separate lines
- Admin can now actually fulfil orders (change status, see what was ordered)
- Admin can now promote/remove other admins from the Team page

The database changes are in `supabase/migration_01_go_live.sql`.
**It has already been run — do not run it again unless setting up a fresh
database.** (It is safe to re-run, but you shouldn't need to.)

---

## 5. WHAT YOU NEED TO DO — go-live checklist

Do these in order. Most are dashboard clicks, not code.

### Step 1 — Rotate the Supabase service key (do this first)

The current service-role key was exposed in a chat log. It bypasses every
security rule in the database, so it must be replaced.

1. Supabase → Project Settings → API → roll/regenerate the `service_role` key
2. Copy the new value into your `.env.local`
3. Push it to production:

```bash
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
```

It will prompt you to paste the value. Nothing is echoed to the screen.

### Step 2 — Set the other production secrets

```bash
npx wrangler secret put RAZORPAY_KEY_ID
npx wrangler secret put RAZORPAY_KEY_SECRET
```

> **Why:** your `.env.local` never leaves your laptop. These commands are how
> the live site gets the values. Variables starting with `NEXT_PUBLIC_` are
> different — they get compiled into the site during build, so you don't set
> those as secrets.

Check what's set with `npx wrangler secret list`.

### Step 3 — Allow the live URL in Supabase

Supabase → Authentication → URL Configuration → Redirect URLs → add:

```
https://furnis.in/**
```

Without this, signup confirmation emails send people to the wrong place.

### Step 4 — Create the Razorpay webhook

Razorpay Dashboard → Settings → Webhooks → Add New Webhook:

- **URL:** `https://furnis.in/api/razorpay/webhook`
- **Events:** tick `payment.captured` and `payment.failed`
- Razorpay shows you a **signing secret** — copy it

> This secret is **not** your API key secret. It's a separate value Razorpay
> generates for the webhook. Mixing them up is the most common mistake here.

```bash
npx wrangler secret put RAZORPAY_WEBHOOK_SECRET
```

Until this is set, the webhook endpoint returns "Webhook not configured" and
refuses requests. That's intentional — accepting unverified payment
notifications would let anyone fake an order.

### Step 5 — Test a real purchase on the live site

This is the most important step and nobody has done it yet.

1. Go to https://furnis.in, sign up, add something to the cart, check out
2. Use Razorpay test card `4111 1111 1111 1111`, any future expiry, any CVV
3. Confirm you land on the success screen
4. In `/admin/orders`, the order should appear as **confirmed**
5. Open it — you should see the items, the shipping address, and be able to
   change the status
6. Check the product's stock went down by the amount ordered

**Then test the webhook actually works:** do another purchase, but close the
tab immediately after paying (before the success screen). The order should
*still* appear in the admin panel within a few seconds. That proves the
safety net works. If it doesn't, check Razorpay → Webhooks for failed
delivery attempts.

### Step 6 — Turn on order emails

1. Sign up at resend.com, verify the `furnis.in` domain
2. Add the DNS records Resend gives you (the domain is on Cloudflare)
3. Then:

```bash
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put RESEND_FROM_EMAIL
```

Use something like `orders@furnis.in` for the from-address. Until this is
done, customers get no email after paying.

### Step 7 — Only after all of the above: switch to live payments

Do **not** do this until steps 1–6 are done and tested. Swap the Razorpay
test keys for live keys (they start `rzp_live_`), rebuild, and redeploy.
Razorpay also requires your business to be activated and usually wants
Terms, Refund, Shipping and Contact pages live on the site.

---

## 6. Remaining work (after go-live)

Roughly in order of value:

### A. Make the catalog visible to Google — biggest win

Right now if you view the page source of https://furnis.in/shop, there are no
products in it — just the text `LOADING LUXURY CATALOG`. The products are
fetched by the browser *after* the page loads.

Two problems: Google indexes an empty store, and customers on slow phones
stare at a loading message.

**The fix:** `src/app/page.js` and `src/features/products/components/ShopContent.js`
fetch data in the browser with `useEffect`. They should fetch on the server
instead. `src/app/products/[id]/page.js` already does it the right way —
copy that pattern.

### B. Delete dead code

These files are never used by anything:

- All 11 components under `src/features/*/components/` (`HeroSection`,
  `CheckoutForm`, `CartItem`, `SuccessPanel`, and so on). The pages have the
  same code copy-pasted inside them instead.
- `src/constants/productsData.js` — 583 lines of fake demo products from
  before the database existed
- `src/components/shared/ChatAssistant.module.css` — styling for a component
  that doesn't exist

This also matters for hosting: the site is at **96% of the Cloudflare free
plan's size limit** (2951 KB of 3072 KB). Deleting this buys breathing room.
If it ever goes over, deploys will start failing.

### C. Use saved addresses at checkout

`/account/addresses` is a fully working address book — 345 lines of code —
that checkout completely ignores. Customers retype 8 fields for every single
order. Checkout also doesn't fill in the name/email of the person already
logged in.

### D. Two smaller bugs

- **Stale cart prices.** The cart saves the whole product (price included) in
  the browser. Change a price in admin and returning customers see the old
  one in their cart, then get charged the new one. The charge is correct —
  the display is what's wrong.
- **Category pages always say "0 Items."** `src/lib/supabase/queries.js`
  reads a `count` column that doesn't exist on the `categories` table.

---

## 7. Deploying

### The one command

From inside the `Furnish` folder:

```bash
npm run cf:deploy
```

This builds and uploads. Takes about 2 minutes. Run it after **any** code
change — the live site does not update when you push to GitHub.

If you only changed a secret, you don't need this. `wrangler secret put`
redeploys by itself.

### First time on a new machine

```bash
npx wrangler login
```

Opens your browser to authorise Cloudflare.

### Important: this is Workers, not Pages

You may have deployed Next.js sites to **Cloudflare Pages** before. This
project uses **Cloudflare Workers**, and `wrangler pages deploy` will not
work.

Why: Pages is designed for static sites. This app runs real server code —
payment routes, admin permission checks, server-rendered pages. That needs
Workers. The tool that builds it (`@opennextjs/cloudflare`) produces a Worker
at `.open-next/worker.js`.

Don't "fix" `wrangler.toml` back to Pages settings. It was already tried and
it doesn't build.

### Useful commands

| Command | What it does |
|---|---|
| `npm run dev` | Run locally at localhost:3000 |
| `npm run cf:build` | Build for Cloudflare without deploying |
| `npm run cf:deploy` | Build **and** deploy to furnis.in |
| `npm run cf:preview` | Run the real Cloudflare build locally |
| `npx wrangler secret list` | See which secrets are set |
| `npm run lint` | Check code style |

---

## 8. Things that will trip you up

**"The site didn't change after I pushed to GitHub."**
Correct — pushing doesn't deploy. Run `npm run cf:deploy`.

**"furnis.in won't load but it works for everyone else."**
Your computer cached old DNS. Run `ipconfig /flushdns` (Windows).

**"npm run cf:build fails with a permission error on .open-next"**
A preview server is still running and holding the files. Close it. On Windows
you may need to kill leftover `workerd.exe` processes in Task Manager.

**"Wrangler says I need Node 22."**
You're on an old Node. Upgrade — there is no way around this.

**Secrets in `wrangler dev`.** Wrangler doesn't read `.env.local`, it reads
`.dev.vars`. Run `npm run cf:vars` to copy one to the other. Both files are
git-ignored.

**Never commit `.env.local`.** It's in `.gitignore` already. Don't force it.

**Don't touch the payment routes casually.** `create-order`, `verify` and
`webhook` handle real money and are deliberately paranoid — they recalculate
prices from the database and never trust what the browser sends. If you
change one, re-read §4 first.

---

## 9. Project map

```
src/
├── app/
│   ├── page.js              Homepage
│   ├── shop/                Product catalog
│   ├── products/[id]/       Product detail (correctly server-rendered)
│   ├── cart/  checkout/     Cart and checkout
│   ├── auth/                Login / signup
│   ├── account/             Customer area: profile, orders, addresses
│   ├── admin/               Admin panel
│   │   ├── products/          Add/edit/delete products
│   │   ├── orders/            Order list + detail + status changes
│   │   ├── customers/         Customer list
│   │   └── team/              Promote/remove admins
│   └── api/
│       ├── admin/             Admin-only APIs (always check requireAdmin)
│       └── razorpay/          create-order, verify, webhook
├── lib/
│   ├── supabase/            Database clients and queries
│   ├── checkout/            Price calculation + order confirmation
│   ├── email/               Order confirmation email
│   └── razorpay.js          Razorpay client
├── store/                   Cart and login state (React context)
└── proxy.js                 Runs on every request: sessions + route guards

supabase/
├── schema.sql                     Original database setup
├── migration_01_go_live.sql       Recent changes (already applied)
├── make_admin.sql                 Promote a user to admin
└── storage_setup.sql              Image storage bucket
```

**Two different database clients — know which to use:**

- `createClient()` — normal. Respects security rules. Use for anything a
  customer does.
- `createAdminClient()` — bypasses **all** security rules. Server-side only,
  admin routes only. Never import it into a page the browser loads.

---

## 10. Security rules — non-negotiable

1. Never commit `.env.local` or any real key
2. Never put a secret in code, even temporarily
3. Never use `createAdminClient()` in a file with `"use client"` at the top
4. Never trust a price sent from the browser — always recalculate from the
   database (the existing checkout code does this; keep it that way)
5. Every `/api/admin/*` route must call `requireAdmin()` as its first line

---

## 11. Who to ask

- **Live site:** https://furnis.in
- **Repo:** https://github.com/jagdishnjaggu/Furnish
- Cloudflare, Supabase and Razorpay dashboards — ask the project owner for
  access

If you're unsure whether something is safe to change, ask before deploying.
The site is live and takes payments.
