# Furnish 🪵

A modern e-commerce web app for handcrafted wooden kitchenware — chopping boards, serving platters, kitchen organizers, and more. Built with a full backend powered by Supabase.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, JavaScript) |
| Database + Auth | Supabase (PostgreSQL + Row Level Security) |
| Storage | Supabase Storage (product images) |
| Payments | Razorpay *(integration pending)* |
| Email | Resend *(integration pending)* |
| Deployment | Cloudflare Pages (via `@opennextjs/cloudflare`) |
| Styling | CSS Modules + custom design system |

---

## Features

### Customer-facing
- Product catalog with live Supabase queries (shop, categories, product detail)
- Cart and wishlist (localStorage)
- Email + password authentication (Supabase Auth)
- Account dashboard — profile, saved addresses, order history
- Mobile-first responsive design

### Admin Panel (`/admin`)
- Role-based access (admin role in `profiles` table)
- Product management — create, edit, delete, image upload to Supabase Storage
- Customer list
- Orders list (ready for Razorpay connection)

---

## Project Structure

```
src/
├── app/
│   ├── admin/          # Admin panel pages
│   ├── account/        # Customer dashboard pages
│   ├── auth/           # Login, signup, callback
│   ├── api/admin/      # Admin API routes (product CRUD, image upload)
│   ├── shop/           # Shop page
│   ├── products/[id]/  # Product detail page
│   └── categories/     # Category pages
├── components/         # Shared UI components
├── features/           # Feature-specific components (shop, home)
├── lib/supabase/       # Supabase clients (browser, server, admin, queries)
├── store/              # React Context (Cart, Auth)
└── constants/          # Static data (hero images, testimonials, wood data)

supabase/
├── schema.sql          # Full DB schema, RLS policies, seed data
├── make_admin.sql      # Promote a user to admin role
└── storage_setup.sql   # Create product-images storage bucket
```

---

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables

Copy `.env.local.example` to `.env.local` and fill in your keys:

```bash
cp .env.local.example .env.local
```

Required variables:
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

### 3. Set up the database

Run `supabase/schema.sql` in your **Supabase SQL Editor**. This creates all tables, RLS policies, indexes, and seeds the product catalog.

Run `supabase/storage_setup.sql` to create the `product-images` public storage bucket.

### 4. Create your admin account

1. Sign up at `/auth/signup`
2. Run `supabase/make_admin.sql` in Supabase SQL Editor (update the email first)

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deployment (Cloudflare Pages)

```bash
# Build for Cloudflare
npm run pages:build

# Preview locally
npm run pages:preview

# Deploy
npm run pages:deploy
```

Add all environment variables in **Cloudflare Dashboard → Pages → furnish → Settings → Environment Variables**.

---

## Database Schema

| Table | Purpose |
|---|---|
| `profiles` | Extended user data (name, phone, role) |
| `categories` | Product categories |
| `products` | Product catalog |
| `product_images` | Product image URLs (linked to Supabase Storage) |
| `addresses` | Customer delivery addresses |
| `orders` | Order records |
| `order_items` | Line items within each order |

---

## Pending Integrations

- **Razorpay** — payment gateway (order creation, verification, webhook)
- **Resend** — transactional emails (order confirmation, status updates)

---

## License

Private — all rights reserved.
