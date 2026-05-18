# Padel Center — Booking System

Premium padel court booking platform for Padel Center Baku.

## Stack
- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS (old money luxury design)
- **Database**: Supabase (PostgreSQL + Auth + RLS)
- **Payments**: Stripe
- **Email**: Resend
- **Hosting**: Vercel

---

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.local.example .env.local
# Fill in your Supabase, Stripe, and Resend keys
```

### 3. Set up Supabase
1. Create a new project at https://supabase.com
2. Install Supabase CLI: `npm install -g supabase`
3. Link project: `supabase link --project-ref YOUR_PROJECT_REF`
4. Push migrations:
```bash
supabase db push
# or run migrations manually in Supabase SQL editor:
# supabase/migrations/001_initial_schema.sql
# supabase/migrations/002_seed.sql
# supabase/migrations/003_rls_policies.sql
```

### 4. Configure Stripe
1. Create account at https://stripe.com
2. Get publishable + secret keys → add to `.env.local`
3. Set up webhook:
   - Endpoint: `https://yourapp.vercel.app/api/webhooks/stripe`
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Copy webhook secret → `STRIPE_WEBHOOK_SECRET`

### 5. Configure Resend
1. Create account at https://resend.com
2. Verify your sending domain
3. Add API key → `RESEND_API_KEY`

### 6. Run locally
```bash
npm run dev
# App at http://localhost:3000
```

For Stripe webhook testing locally:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

## Deployment (Vercel)

```bash
npm install -g vercel
vercel --prod
```

Set all environment variables in Vercel dashboard → Settings → Environment Variables.

The `vercel.json` cron job fires every 5 minutes to send booking reminders.

---

## Key URLs

| Route | Description |
|---|---|
| `/` | Homepage with courts, pricing |
| `/book` | Court selection |
| `/book/[courtId]` | Date & time slot picker |
| `/book/checkout` | Payment (Stripe) |
| `/bookings` | Customer's booking history |
| `/membership` | Membership plans |
| `/profile` | Account settings |
| `/login` | Sign in |
| `/register` | Create account |
| `/admin/dashboard` | Admin overview |
| `/admin/bookings` | All bookings management |
| `/admin/courts` | Court management |
| `/admin/coaches` | Coach management |
| `/admin/customers` | Customer list |
| `/admin/memberships` | Plans + subscriptions |
| `/admin/pricing` | Pricing rules |
| `/admin/promos` | Promo codes |
| `/admin/shop` | Shop & café products |
| `/admin/reports` | Analytics & reports |
| `/coach/schedule` | Coach availability |
| `/coach/sessions` | Coach's training sessions |

---

## Create Admin User

After a user signs up, run this in Supabase SQL editor:
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'admin@yourpadel.az';
```

## Pricing Logic

Prices are calculated automatically:
- **Weekday 07:00–18:00**: 60 AZN
- **Weekday 18:00–23:00**: 80 AZN  
- **Weekend (all day)**:   80 AZN

Promo codes and membership discounts apply on top.

## Notifications

- Booking confirmation → sent immediately after payment
- Reminder → sent 1 hour before session (via Vercel cron)
- Cancellation → sent on cancel

## Languages

Switch language by setting the `locale` cookie to `az`, `ru`, or `en`.
