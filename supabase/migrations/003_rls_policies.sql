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
