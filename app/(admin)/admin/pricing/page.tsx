import { createClient } from '@/lib/supabase/server'

export default async function PricingPage() {
  const supabase = await createClient()
  const { data: rules } = await supabase.from('pricing_rules').select('*').order('day_type').order('time_from')

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--forest)' }}>Pricing Rules</h1>
          <p style={{ fontFamily: 'var(--font-serif)', color: 'var(--muted)', fontStyle: 'italic', marginTop: 4 }}>Manage court pricing by day type and time slot</p>
        </div>
        <button style={{ padding: '10px 20px', background: 'var(--forest)', color: 'var(--gold-light)', fontFamily: 'var(--font-sans)', fontSize: '0.8rem', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
          + Add Rule
        </button>
      </div>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {rules?.map(rule => (
          <div key={rule.id} style={{ background: 'var(--ivory)', border: '1px solid rgba(201,169,110,0.3)', borderRadius: 12, padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--forest)', marginBottom: 4 }}>{rule.name}</p>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.78rem', color: 'var(--muted)' }}>
                {rule.day_type === 'weekday' ? 'Monday – Friday' : rule.day_type === 'weekend' ? 'Saturday – Sunday' : 'Public Holidays'} · {rule.time_from} – {rule.time_to}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--forest)' }}>
                {Number(rule.price_azn).toFixed(0)} <span style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>AZN</span>
              </p>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.7rem', color: 'var(--muted-light)' }}>per 90-min session</p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ padding: '6px 14px', border: '1px solid rgba(201,169,110,0.3)', borderRadius: 6, background: 'transparent', fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: 'var(--forest)', cursor: 'pointer' }}>Edit</button>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.68rem', padding: '4px 10px', borderRadius: 20, background: rule.is_active ? 'rgba(74,124,89,0.1)' : 'rgba(220,38,38,0.08)', color: rule.is_active ? 'var(--sage)' : '#DC2626', display: 'flex', alignItems: 'center' }}>
                {rule.is_active ? 'Active' : 'Off'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Info */}
      <div style={{ marginTop: '2rem', padding: '1.25rem', background: 'rgba(201,169,110,0.06)', border: '1px solid rgba(201,169,110,0.2)', borderRadius: 10 }}>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', color: 'var(--muted)', lineHeight: 1.6 }}>
          <strong style={{ color: 'var(--forest)' }}>Note:</strong> Prices are applied automatically during booking based on the session start time and day of week. Membership discounts are applied on top of these base prices. Changes take effect immediately for new bookings.
        </p>
      </div>
    </div>
  )
}
