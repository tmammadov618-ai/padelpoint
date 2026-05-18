import { createClient } from '@/lib/supabase/server'
import { formatAZN } from '@/lib/utils'

export default async function ReportsPage({ searchParams }: { searchParams: { period?: string } }) {
  const supabase = await createClient()
  const period = searchParams.period ?? 'month'

  let since: Date
  const now = new Date()
  if (period === 'day')   { since = new Date(now); since.setHours(0,0,0,0) }
  else if (period === 'week') { since = new Date(now); since.setDate(now.getDate() - 7) }
  else { since = new Date(now); since.setDate(1) }

  const { data: bookings } = await supabase
    .from('bookings')
    .select('final_price_azn, status, booking_type, court_id, court:courts(name)')
    .gte('starts_at', since.toISOString())

  const confirmed   = bookings?.filter(b => b.status === 'confirmed') ?? []
  const cancelled   = bookings?.filter(b => b.status === 'cancelled') ?? []
  const totalRev    = confirmed.reduce((s, b) => s + Number(b.final_price_azn), 0)
  const avgBooking  = confirmed.length ? totalRev / confirmed.length : 0
  const cancelRate  = bookings?.length ? (cancelled.length / bookings.length * 100) : 0

  const courtRevenue: Record<string, number> = {}
  for (const b of confirmed) {
    const name = (b.court as any)?.name ?? 'Unknown'
    courtRevenue[name] = (courtRevenue[name] ?? 0) + Number(b.final_price_azn)
  }

  const { data: coachData } = await supabase
    .from('bookings')
    .select('final_price_azn, coach:profiles!coach_id(full_name)')
    .eq('booking_type', 'coach_training')
    .eq('status', 'confirmed')
    .gte('starts_at', since.toISOString())
    .not('coach_id', 'is', null)

  const coachRevenue: Record<string, number> = {}
  for (const b of coachData ?? []) {
    const name = (b.coach as any)?.full_name ?? 'Unknown'
    coachRevenue[name] = (coachRevenue[name] ?? 0) + Number(b.final_price_azn)
  }

  const { data: shopSales } = await supabase
    .from('order_items')
    .select('total_price, product:products(name, category)')
    .gte('sold_at', since.toISOString())
  const shopTotal = shopSales?.reduce((s, i) => s + Number(i.total_price), 0) ?? 0

  const periods = [
    { label: 'Today',      value: 'day' },
    { label: 'This Week',  value: 'week' },
    { label: 'This Month', value: 'month' },
  ]

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--forest)', marginBottom: '1.5rem' }}>Reports & Analytics</h1>

      {/* Period selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '2rem' }}>
        {periods.map(p => (
          <a key={p.value} href={`/admin/reports?period=${p.value}`} style={{
            fontFamily: 'var(--font-sans)', fontSize: '0.8rem', padding: '8px 18px', borderRadius: 20,
            border: '1px solid rgba(201,169,110,0.3)',
            background: period === p.value ? 'var(--forest)' : 'transparent',
            color: period === p.value ? 'var(--gold-light)' : 'var(--muted)',
            textDecoration: 'none',
          }}>{p.label}</a>
        ))}
      </div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Revenue',    value: formatAZN(totalRev) },
          { label: 'Confirmed Bookings', value: String(confirmed.length) },
          { label: 'Avg Booking Value',  value: formatAZN(avgBooking) },
          { label: 'Cancellation Rate',  value: `${cancelRate.toFixed(1)}%` },
        ].map(k => (
          <div key={k.label} style={{ background: 'var(--ivory)', border: '1px solid rgba(201,169,110,0.3)', borderRadius: 12, padding: '1.25rem' }}>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>{k.label}</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--forest)' }}>{k.value}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
        {/* Court revenue */}
        <div style={{ background: 'var(--ivory)', border: '1px solid rgba(201,169,110,0.3)', borderRadius: 12, padding: '1.5rem' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--forest)', marginBottom: '1rem' }}>Revenue by Court</h3>
          {Object.entries(courtRevenue).map(([court, rev]) => (
            <div key={court} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.82rem', color: 'var(--charcoal)' }}>{court}</span>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.82rem', color: 'var(--forest)', fontWeight: 500 }}>{formatAZN(rev)}</span>
              </div>
              <div style={{ height: 4, borderRadius: 2, background: 'rgba(201,169,110,0.15)' }}>
                <div style={{ height: '100%', borderRadius: 2, background: 'var(--sage)', width: `${Math.round(rev / (totalRev || 1) * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>

        {/* Coach revenue */}
        <div style={{ background: 'var(--ivory)', border: '1px solid rgba(201,169,110,0.3)', borderRadius: 12, padding: '1.5rem' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--forest)', marginBottom: '1rem' }}>Coach Sessions</h3>
          {Object.entries(coachRevenue).length === 0 && (
            <p style={{ fontFamily: 'var(--font-serif)', color: 'var(--muted)', fontStyle: 'italic', fontSize: '0.88rem' }}>No training sessions in this period.</p>
          )}
          {Object.entries(coachRevenue).map(([coach, rev]) => (
            <div key={coach} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(201,169,110,0.1)' }}>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.82rem' }}>{coach}</span>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.82rem', color: 'var(--forest)', fontWeight: 500 }}>{formatAZN(rev * 0.3)} <span style={{ color: 'var(--muted-light)', fontSize: '0.7rem' }}>share</span></span>
            </div>
          ))}
        </div>

        {/* Shop */}
        <div style={{ background: 'var(--ivory)', border: '1px solid rgba(201,169,110,0.3)', borderRadius: 12, padding: '1.5rem' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--forest)', marginBottom: '1rem' }}>Shop & Café</h3>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--forest)', marginBottom: 4 }}>{formatAZN(shopTotal)}</p>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.78rem', color: 'var(--muted)' }}>{shopSales?.length ?? 0} items sold</p>
          <div style={{ marginTop: 16, padding: '10px 14px', background: 'rgba(201,169,110,0.06)', borderRadius: 8 }}>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: 'var(--muted)' }}>
              Total Revenue (court + shop):<br />
              <strong style={{ color: 'var(--forest)', fontSize: '1rem' }}>{formatAZN(totalRev + shopTotal)}</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
