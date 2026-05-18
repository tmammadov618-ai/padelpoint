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
