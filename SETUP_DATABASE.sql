-- ============================================================
-- PADELPOINT DATABASE SETUP
-- Run this ONCE in Supabase SQL Editor
-- supabase.com/dashboard/project/djkoatyfmbpxrqoupcxz/sql/new
-- ============================================================
-- ============================================================
-- PADEL CENTER BOOKING SYSTEM — FULL DATABASE SCHEMA
-- Run: supabase db push
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE user_role         AS ENUM ('admin', 'manager', 'coach', 'customer');
CREATE TYPE booking_status    AS ENUM ('pending_payment', 'confirmed', 'cancelled', 'completed', 'no_show');
CREATE TYPE booking_type      AS ENUM ('single', 'membership_session', 'coach_training');
CREATE TYPE payment_status    AS ENUM ('pending', 'succeeded', 'failed', 'refunded');
CREATE TYPE payment_method    AS ENUM ('stripe', 'cash', 'transfer');
CREATE TYPE membership_status AS ENUM ('active', 'expired', 'cancelled', 'paused');
CREATE TYPE discount_type     AS ENUM ('percentage', 'fixed_amount');
CREATE TYPE product_category  AS ENUM ('racket_rental', 'balls', 'shop', 'cafe');
CREATE TYPE notification_channel AS ENUM ('email', 'sms', 'whatsapp', 'telegram', 'push');
CREATE TYPE notification_type AS ENUM (
  'booking_confirmed','booking_reminder','booking_cancelled',
  'payment_received','membership_expiring','promo'
);

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role        user_role NOT NULL DEFAULT 'customer',
  full_name   TEXT NOT NULL,
  phone       TEXT UNIQUE,
  email       TEXT UNIQUE NOT NULL,
  avatar_url  TEXT,
  language    TEXT DEFAULT 'az' CHECK (language IN ('az','ru','en')),
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_read_own"    ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_read_staff"  ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','manager'))
);
CREATE POLICY "profiles_update_own"  ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_admin_all"   ON profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- COURTS
-- ============================================================
CREATE TABLE courts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT,
  is_active   BOOLEAN DEFAULT TRUE,
  image_url   TEXT,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE courts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "courts_read_all"   ON courts FOR SELECT USING (TRUE);
CREATE POLICY "courts_admin_only" ON courts FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','manager'))
);

-- Courts seeded in 002_seed.sql

-- ============================================================
-- PRICING RULES
-- ============================================================
CREATE TABLE pricing_rules (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  day_type    TEXT NOT NULL CHECK (day_type IN ('weekday','weekend','holiday')),
  time_from   TIME NOT NULL,
  time_to     TIME NOT NULL,
  price_azn   NUMERIC(10,2) NOT NULL,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE pricing_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pricing_read_all"  ON pricing_rules FOR SELECT USING (TRUE);
CREATE POLICY "pricing_admin_all" ON pricing_rules FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

INSERT INTO pricing_rules (name, day_type, time_from, time_to, price_azn) VALUES
  ('Weekday morning', 'weekday', '06:00', '18:00', 60.00),
  ('Weekday evening', 'weekday', '18:00', '23:59', 80.00),
  ('Weekend all day', 'weekend', '00:00', '23:59', 80.00);

-- ============================================================
-- PROMO CODES (must exist before bookings FK)
-- ============================================================
CREATE TABLE promo_codes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code            TEXT UNIQUE NOT NULL,
  description     TEXT,
  discount_type   discount_type NOT NULL,
  discount_value  NUMERIC(10,2) NOT NULL,
  max_uses        INTEGER,
  used_count      INTEGER DEFAULT 0,
  min_booking_azn NUMERIC(10,2) DEFAULT 0,
  valid_from      TIMESTAMPTZ DEFAULT NOW(),
  valid_to        TIMESTAMPTZ,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "promos_admin_all" ON promo_codes FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','manager'))
);
CREATE POLICY "promos_customer_read" ON promo_codes FOR SELECT USING (is_active = TRUE);

-- ============================================================
-- BOOKINGS
-- ============================================================
CREATE TABLE bookings (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id      UUID NOT NULL REFERENCES profiles(id),
  court_id         UUID NOT NULL REFERENCES courts(id),
  booking_type     booking_type NOT NULL DEFAULT 'single',
  coach_id         UUID REFERENCES profiles(id),
  starts_at        TIMESTAMPTZ NOT NULL,
  ends_at          TIMESTAMPTZ NOT NULL,
  duration_min     INTEGER NOT NULL DEFAULT 90,
  price_azn        NUMERIC(10,2) NOT NULL,
  discount_azn     NUMERIC(10,2) DEFAULT 0,
  final_price_azn  NUMERIC(10,2) GENERATED ALWAYS AS (price_azn - COALESCE(discount_azn,0)) STORED,
  status           booking_status DEFAULT 'pending_payment',
  promo_code_id    UUID REFERENCES promo_codes(id),
  notes            TEXT,
  cancelled_at     TIMESTAMPTZ,
  cancel_reason    TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT booking_no_time_travel CHECK (ends_at > starts_at),
  CONSTRAINT booking_no_overlap EXCLUDE USING gist (
    court_id WITH =,
    tstzrange(starts_at, ends_at, '[)') WITH &&
  ) WHERE (status NOT IN ('cancelled'))
);

CREATE INDEX idx_bookings_court_date  ON bookings (court_id, starts_at);
CREATE INDEX idx_bookings_customer    ON bookings (customer_id);
CREATE INDEX idx_bookings_status      ON bookings (status);
CREATE INDEX idx_bookings_coach       ON bookings (coach_id) WHERE coach_id IS NOT NULL;

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bookings_customer_own"  ON bookings FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "bookings_customer_insert" ON bookings FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "bookings_staff_all"     ON bookings FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','manager'))
);
CREATE POLICY "bookings_coach_own"     ON bookings FOR SELECT USING (
  auth.uid() = coach_id OR auth.uid() = customer_id
);

CREATE TRIGGER bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- PAYMENTS
-- ============================================================
CREATE TABLE payments (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id            UUID NOT NULL REFERENCES bookings(id),
  customer_id           UUID NOT NULL REFERENCES profiles(id),
  amount_azn            NUMERIC(10,2) NOT NULL,
  currency              TEXT DEFAULT 'AZN',
  status                payment_status DEFAULT 'pending',
  method                payment_method DEFAULT 'stripe',
  stripe_payment_intent TEXT UNIQUE,
  stripe_charge_id      TEXT,
  refund_amount_azn     NUMERIC(10,2) DEFAULT 0,
  refunded_at           TIMESTAMPTZ,
  metadata              JSONB DEFAULT '{}',
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_booking  ON payments (booking_id);
CREATE INDEX idx_payments_customer ON payments (customer_id);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payments_own"       ON payments FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "payments_admin_all" ON payments FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','manager'))
);

CREATE TRIGGER payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- MEMBERSHIP PLANS & SUBSCRIPTIONS
-- ============================================================
CREATE TABLE membership_plans (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  sessions_count  INTEGER NOT NULL,
  duration_days   INTEGER NOT NULL,
  price_azn       NUMERIC(10,2) NOT NULL,
  discount_pct    NUMERIC(5,2) DEFAULT 0,
  benefits        TEXT[],
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE membership_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "plans_read_all"    ON membership_plans FOR SELECT USING (TRUE);
CREATE POLICY "plans_admin_write" ON membership_plans FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

INSERT INTO membership_plans (name, sessions_count, duration_days, price_azn, discount_pct, benefits) VALUES
  ('Basic',   8,  30, 400.00, 17, ARRAY['8 sessions/month','Priority booking','Locker access']),
  ('Premium', 16, 30, 700.00, 27, ARRAY['16 sessions/month','Priority booking','Locker access','1 free coach session']),
  ('Elite',   30, 30,1200.00, 37, ARRAY['Unlimited sessions','Priority booking','Locker access','2 free coach sessions','Racket rental included']);

CREATE TABLE customer_memberships (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id     UUID NOT NULL REFERENCES profiles(id),
  plan_id         UUID NOT NULL REFERENCES membership_plans(id),
  status          membership_status DEFAULT 'active',
  starts_at       DATE NOT NULL,
  expires_at      DATE NOT NULL,
  sessions_used   INTEGER DEFAULT 0,
  sessions_total  INTEGER NOT NULL,
  stripe_sub_id   TEXT UNIQUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE customer_memberships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "memberships_own"        ON customer_memberships FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "memberships_admin_all"  ON customer_memberships FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','manager'))
);

-- ============================================================
-- COACH AVAILABILITY
-- ============================================================
CREATE TABLE coach_availability (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id     UUID NOT NULL REFERENCES profiles(id),
  day_of_week  INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  time_from    TIME NOT NULL,
  time_to      TIME NOT NULL,
  is_active    BOOLEAN DEFAULT TRUE
);

CREATE TABLE coach_blocked_times (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id      UUID NOT NULL REFERENCES profiles(id),
  blocked_from  TIMESTAMPTZ NOT NULL,
  blocked_to    TIMESTAMPTZ NOT NULL,
  reason        TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE coach_availability   ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_blocked_times  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "coach_avail_read_all"   ON coach_availability FOR SELECT USING (TRUE);
CREATE POLICY "coach_avail_own_write"  ON coach_availability FOR ALL USING (auth.uid() = coach_id);
CREATE POLICY "coach_avail_admin"      ON coach_availability FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','manager'))
);
CREATE POLICY "coach_blocked_own"      ON coach_blocked_times FOR ALL USING (auth.uid() = coach_id);
CREATE POLICY "coach_blocked_admin"    ON coach_blocked_times FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','manager'))
);

-- ============================================================
-- LOYALTY POINTS
-- ============================================================
CREATE TABLE loyalty_points (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES profiles(id),
  points      INTEGER NOT NULL,
  reason      TEXT,
  booking_id  UUID REFERENCES bookings(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE VIEW customer_loyalty_totals AS
  SELECT customer_id, SUM(points) AS total_points
  FROM loyalty_points GROUP BY customer_id;

ALTER TABLE loyalty_points ENABLE ROW LEVEL SECURITY;
CREATE POLICY "loyalty_own"       ON loyalty_points FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "loyalty_admin_all" ON loyalty_points FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','manager'))
);

-- ============================================================
-- PRODUCTS (shop + cafe)
-- ============================================================
CREATE TABLE products (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  category    product_category NOT NULL,
  price_azn   NUMERIC(10,2) NOT NULL,
  stock_qty   INTEGER,
  image_url   TEXT,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE order_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id  UUID REFERENCES bookings(id),
  product_id  UUID NOT NULL REFERENCES products(id),
  customer_id UUID REFERENCES profiles(id),
  quantity    INTEGER NOT NULL DEFAULT 1,
  unit_price  NUMERIC(10,2) NOT NULL,
  total_price NUMERIC(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  sold_at     TIMESTAMPTZ DEFAULT NOW(),
  created_by  UUID REFERENCES profiles(id)
);

ALTER TABLE products    ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products_read_all"   ON products    FOR SELECT USING (TRUE);
CREATE POLICY "products_admin_all"  ON products    FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','manager'))
);
CREATE POLICY "orders_own"         ON order_items FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "orders_admin_all"   ON order_items FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','manager'))
);

INSERT INTO products (name, category, price_azn) VALUES
  ('Racket Rental (1 session)', 'racket_rental', 10.00),
  ('Premium Racket Rental',     'racket_rental', 20.00),
  ('Padel Balls (3-pack)',       'balls',         15.00),
  ('Energy Drink',              'cafe',            5.00),
  ('Water 0.5L',                'cafe',            2.00),
  ('Protein Bar',               'cafe',            4.00),
  ('Padel Gloves',              'shop',           25.00),
  ('Wristband',                 'shop',            8.00);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES profiles(id),
  booking_id  UUID REFERENCES bookings(id),
  type        notification_type NOT NULL,
  channel     notification_channel NOT NULL,
  subject     TEXT,
  body        TEXT,
  sent_at     TIMESTAMPTZ,
  delivered   BOOLEAN DEFAULT FALSE,
  error_msg   TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notif_own"       ON notifications FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "notif_admin_all" ON notifications FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','manager'))
);

-- ============================================================
-- ANALYTICS VIEWS
-- ============================================================
CREATE VIEW v_daily_revenue AS
  SELECT
    DATE_TRUNC('day', b.created_at) AS day,
    SUM(b.final_price_azn) AS revenue,
    COUNT(*) AS bookings_count,
    COUNT(DISTINCT b.customer_id) AS unique_customers
  FROM bookings b WHERE b.status IN ('confirmed','completed')
  GROUP BY 1;

CREATE VIEW v_court_occupancy AS
  SELECT
    c.name AS court_name,
    DATE_TRUNC('day', b.starts_at) AS day,
    COUNT(*) AS sessions,
    SUM(b.duration_min) AS booked_minutes,
    ROUND(SUM(b.duration_min)::NUMERIC / (16 * 60) * 100, 1) AS occupancy_pct
  FROM courts c
  LEFT JOIN bookings b ON b.court_id = c.id AND b.status IN ('confirmed','completed')
  GROUP BY c.name, DATE_TRUNC('day', b.starts_at);

CREATE VIEW v_peak_hours AS
  SELECT
    EXTRACT(HOUR FROM starts_at)::INTEGER AS hour,
    EXTRACT(DOW  FROM starts_at)::INTEGER AS day_of_week,
    COUNT(*) AS bookings
  FROM bookings WHERE status IN ('confirmed','completed')
  GROUP BY 1, 2;

CREATE VIEW v_coach_revenue AS
  SELECT
    p.full_name AS coach_name,
    COUNT(b.id) AS sessions,
    SUM(b.final_price_azn) AS total_revenue,
    ROUND(SUM(b.final_price_azn) * 0.30, 2) AS coach_share_azn
  FROM bookings b
  JOIN profiles p ON p.id = b.coach_id
  WHERE b.booking_type = 'coach_training' AND b.status IN ('confirmed','completed')
  GROUP BY p.full_name;

-- ============================================================
-- SEED DATA — Run after 001_initial_schema.sql
-- ============================================================

-- Courts
INSERT INTO courts (id, name, description, is_active, sort_order) VALUES
  (gen_random_uuid(), 'Court 1', 'Main court with premium artificial turf and full LED lighting system.', true, 1),
  (gen_random_uuid(), 'Court 2', 'Competition-grade court with panoramic glass walls and spectator area.', true, 2),
  (gen_random_uuid(), 'Court 3', 'Training court — ideal for coaching sessions and practice drills.', true, 3);

-- Pricing rules
INSERT INTO pricing_rules (name, day_type, time_from, time_to, price_azn, is_active) VALUES
  ('Weekday morning', 'weekday', '07:00', '18:00', 60.00, true),
  ('Weekday evening', 'weekday', '18:00', '23:00', 80.00, true),
  ('Weekend all day',  'weekend', '07:00', '23:00', 80.00, true);

-- Membership plans
INSERT INTO membership_plans (name, sessions_count, duration_days, price_azn, discount_pct, benefits, is_active) VALUES
  ('Silver', 4,  30,  160.00, 0,    ARRAY['Priority booking', 'Locker room access'],       true),
  ('Gold',   8,  30,  280.00, 10.0, ARRAY['Priority booking', 'Locker room access', 'Free ball can per session', 'Guest pass (1/month)'], true),
  ('Elite',  16, 30,  480.00, 20.0, ARRAY['Priority booking', 'Locker room access', 'Free ball can per session', 'Unlimited guest passes', 'Monthly coaching session'], true);

-- Promo codes
INSERT INTO promo_codes (code, description, discount_type, discount_value, max_uses, min_booking_azn, valid_from, is_active) VALUES
  ('WELCOME10', 'New customer welcome discount', 'percentage',   10,  NULL, 0,  NOW(), true),
  ('SUMMER25',  'Summer 2025 promotion',          'percentage',   25,  200,  60, NOW(), true),
  ('FLAT20',    'Fixed 20 AZN discount',           'fixed_amount', 20,  100,  80, NOW(), true);

-- Products
INSERT INTO products (name, category, price_azn, stock_qty, is_active) VALUES
  ('Racket Rental (Wilson)',     'racket_rental', 10.00, NULL, true),
  ('Racket Rental (Head)',       'racket_rental', 12.00, NULL, true),
  ('Wilson Padel Balls (3-can)', 'balls',         8.00,  50,   true),
  ('Babolat Balls (3-can)',      'balls',         9.00,  30,   true),
  ('Padel Gloves',               'shop',          15.00, 20,   true),
  ('Grip Tape (pack of 3)',      'shop',          6.00,  40,   true),
  ('Espresso',                   'cafe',          3.00,  NULL, true),
  ('Americano',                  'cafe',          4.00,  NULL, true),
  ('Protein Bar',                'cafe',          4.50,  60,   true),
  ('Isotonic Drink 500ml',       'cafe',          3.50,  80,   true),
  ('Water 500ml',                'cafe',          1.50,  NULL, true);

-- Function for promo usage increment
CREATE OR REPLACE FUNCTION increment_promo_usage(promo_id UUID)
RETURNS VOID AS $$
  UPDATE promo_codes SET used_count = used_count + 1 WHERE id = promo_id;
$$ LANGUAGE SQL;

-- ============================================================
-- 003_rls_policies.sql
-- Additional RLS and helper functions not in 001_initial_schema.sql
-- Safe to run after 001 - does not duplicate existing policies
-- ============================================================

-- Helper function for promo usage increment (also in seed, idempotent)
CREATE OR REPLACE FUNCTION increment_promo_usage(promo_id UUID)
RETURNS VOID AS $$
  UPDATE promo_codes SET used_count = used_count + 1 WHERE id = promo_id;
$$ LANGUAGE SQL SECURITY DEFINER;

-- Helper: get customer loyalty point total
CREATE OR REPLACE VIEW customer_loyalty_totals AS
  SELECT customer_id, SUM(points) AS total_points
  FROM loyalty_points
  GROUP BY customer_id;

-- Function: auto-update updated_at on bookings
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER memberships_updated_at
  BEFORE UPDATE ON customer_memberships
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
