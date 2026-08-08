# Furnish

Handcrafted wooden kitchenware e-commerce store — chopping boards, serving platters, organizers, and more. Frontend is Next.js; backend is Supabase (auth, Postgres, Storage).

**Repo:** [github.com/jagdishnjaggu/Furnish](https://github.com/jagdishnjaggu/Furnish)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, JavaScript) |
| Auth | Supabase Auth (email + password) |
| Database | Supabase PostgreSQL + RLS |
| Media | Supabase Storage (`product-images` bucket) |
| Payments | Razorpay *(pending)* |
| Email | Resend / custom SMTP *(pending)* |
| Deploy target | Cloudflare Pages (`@opennextjs/cloudflare`) |

---

## Current Status

| Area | Status |
|---|---|
| Product catalog from Supabase | Done |
| Product + category images in Supabase Storage | Done |
| Homepage hero / Know Your Grain / logo from Storage | Done |
| Auth (login / signup) | Done |
| Admin panel (`/admin`) — product CRUD + image upload | Done |
| Customer dashboard (`/account`) | Done |
| Razorpay checkout | Pending |
| Order emails | Pending |
| Custom domain (`furnis.in`) | Blocked by GoDaddy Registrar Hold |

---

## Features

### Storefront
- Live products & categories from Supabase
- Cart + wishlist (localStorage)
- Product detail with related products from DB
- Auth-gated checkout path (payment wiring next)

### Admin (`/admin`)
- Admin-only (role check in middleware + layout)
- Create / edit / delete products
- Upload images to Supabase Storage
- Customers list + orders list (orders fill after Razorpay)

### Account (`/account`)
- Profile edit
- Saved addresses
- Order history (empty until payments)

---

## Project Structure

```
src/
├── app/
│   ├── admin/           # Admin UI
│   ├── account/         # Customer dashboard
│   ├── auth/            # Login, signup, callback
│   ├── api/admin/       # Product CRUD + upload APIs
│   ├── shop/            # Catalog
│   ├── products/[id]/   # Product detail
│   └── categories/      # Collections
├── components/          # Shared UI
├── features/            # Page feature modules
├── lib/supabase/        # Clients + queries + requireAdmin
├── store/               # AuthContext, CartContext
├── constants/           # Hero, wood data, media URLs
└── proxy.js             # Session + route protection

scripts/
├── migrate-images-to-supabase.mjs   # Upload product images + rewrite DB URLs
├── migrate-homepage-assets.mjs      # Upload hero/logo assets
└── verify-image-urls.mjs            # Confirm DB URLs are HTTPS Storage links

supabase/
├── schema.sql           # Tables, RLS, seed products
├── make_admin.sql       # Promote user → admin
└── storage_setup.sql    # Ensure public product-images bucket

images/                  # Optional local backup of media (not served by Next.js)
```

> **Important:** The live site loads media from Supabase Storage, not from `public/images`.  
> Local `images/` is only a backup copy.

---

## Getting Started

### 1. Install
```bash
npm install
```

### 2. Environment
```bash
cp .env.local.example .env.local
```

Fill in:
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_RAZORPAY_KEY_ID=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RESEND_API_KEY=
RESEND_FROM_EMAIL=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Never commit `.env.local`.

### 3. Database
1. Run `supabase/schema.sql` in Supabase SQL Editor  
2. Run `supabase/storage_setup.sql` (public `product-images` bucket)

### 4. Admin user
1. Sign up at `/auth/signup`  
2. Run `supabase/make_admin.sql` (set your email)  
3. Sign in → you should land on `/admin`

### 5. Dev server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

---

## Media / Storage

All product, category, hero, and logo assets are served from:

```
https://<project>.supabase.co/storage/v1/object/public/product-images/...
```

Homepage URLs are defined in `src/constants/media.js`.

### Migration scripts (already run on this project)
```bash
# Re-upload product/category images and update DB URLs
npm run migrate:images

# Upload hero + logo assets
node scripts/migrate-homepage-assets.mjs

# Verify no local /images/... URLs remain in product_images
node scripts/verify-image-urls.mjs
```

---

## Cloudflare Pages

```bash
npm run pages:build
npm run pages:preview
npm run pages:deploy
```

Add the same env vars in Cloudflare Pages → Settings → Environment Variables.

**Custom domain note:** `furnis.in` is currently on GoDaddy **Registrar Hold**. Nameserver changes are blocked until GoDaddy clears the hold (WHOIS / account verification). You can still deploy to the default `*.pages.dev` URL.

---

## Database Tables

| Table | Purpose |
|---|---|
| `profiles` | User name, phone, role (`customer` / `admin`) |
| `categories` | Collections |
| `products` | Catalog |
| `product_images` | Image URLs (Supabase Storage) |
| `addresses` | Delivery addresses |
| `orders` | Orders |
| `order_items` | Line items |

---

## Next Steps

1. Wire Razorpay on checkout (create order → pay → verify → save order)
2. Send order emails (Resend or company SMTP)
3. Clear GoDaddy Registrar Hold → attach `furnis.in` to Cloudflare Pages
4. Production QA + deploy

---

## License

Private — all rights reserved.
