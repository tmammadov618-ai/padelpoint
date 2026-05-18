import { createClient } from '@/lib/supabase/server'
import { formatAZN } from '@/lib/utils'
import AdminRevenueChart from '@/components/admin/RevenueChart'
import OccupancyHeatmap from '@/components/admin/OccupancyHeatmap'

export default async function DashboardPage() {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  // Revenue today
  const { data: todayRevenue } = await supabase
    .from('bookings')
    .select('final_price_azn')
    .eq('status', 'confirmed')
    .gte('starts_at', `${today}T00:00:00`)
    .lte('starts_at', `${today}T23:59:59`)

  // Revenue this month
  const monthStart = new Date(); monthStart.setDate(1)
  const { data: monthRevenue } = await supabase
    .from('bookings')
    .select('final_price_azn')
    .eq('status', 'confirmed')
    .gte('starts_at', monthStart.toISOString())

  // Today's bookings count
  const { count: todayCount } = await supabase
    .from('bookings')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'confirmed')
    .gte('starts_at', `${today}T00:00:00`)
    .lte('starts_at', `${today}T23:59:59`)

  // Total customers
  const { count: customerCount } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('role', 'customer')

  // Recent bookings
  const { data: recentBookings } = await supabase
    .from('bookings')
    .select('*, customer:profiles!customer_id(full_name, email), court:courts(name)')
    .order('created_at', { ascending: false })
    .limit(8)

  // 30-day revenue for chart
  const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const { data: chartData } = await supabase
    .from('bookings')
    .select('starts_at, final_price_azn')
    .eq('status', 'confirmed')
    .gte('starts_at', thirtyDaysAgo.toISOString())
    .order('starts_at')

  const todayAZN  = todayRevenue?.reduce((s, b) => s + Number(b.final_price_azn), 0) ?? 0
  const monthAZN  = monthRevenue?.reduce((s, b) => s + Number(b.final_price_azn), 0) ?? 0

  const stats = [
    { label: 'Revenue Today',    value: formatAZN(todayAZN),  sub: `${todayCount ?? 0} sessions` },
    { label: 'Revenue This Month', value: formatAZN(monthAZN), sub: 'confirmed bookings' },
    { label: 'Total Customers',  value: String(customerCount ?? 0), sub: 'registered accounts' },
  ]

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--forest)', marginBottom: 4 }}>
          Dashboard
        </h1>
        <p style={{ color: 'var(--muted)', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
          {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
        {stats.map(s => (
          <div key={s.label} style={{
            background: 'var(--ivory)', border: '1px solid rgba(201,169,110,0.3)',
            borderRadius: 12, padding: '1.5rem',
            boxShadow: '0 2px 12px rgba(28,58,46,0.06)',
          }}>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.68rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>{s.label}</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--forest)', marginBottom: 4 }}>{s.value}</p>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: 'var(--muted-light)' }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ background: 'var(--ivory)', border: '1px solid rgba(201,169,110,0.3)', borderRadius: 12, padding: '1.5rem' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--forest)', marginBottom: '1rem' }}>Revenue (30 days)</h3>
          <AdminRevenueChart data={chartData ?? []} />
        </div>
        <div style={{ background: 'var(--ivory)', border: '1px solid rgba(201,169,110,0.3)', borderRadius: 12, padding: '1.5rem' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--forest)', marginBottom: '1rem' }}>Court Occupancy Heatmap</h3>
          <OccupancyHeatmap />
        </div>
      </div>

      {/* Recent bookings */}
      <div style={{ background: 'var(--ivory)', border: '1px solid rgba(201,169,110,0.3)', borderRadius: 12, padding: '1.5rem' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--forest)', marginBottom: '1rem' }}>Recent Bookings</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Customer', 'Court', 'Date & Time', 'Amount', 'Status'].map(h => (
                <th key={h} style={{ fontFamily: 'var(--font-sans)', fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', padding: '0 12px 12px', textAlign: 'left', borderBottom: '1px solid rgba(201,169,110,0.2)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentBookings?.map(b => (
              <tr key={b.id}>
                <td style={{ padding: '12px', borderBottom: '1px solid rgba(201,169,110,0.1)', fontFamily: 'var(--font-sans)', fontSize: '0.85rem' }}>
                  {(b.customer as any)?.full_name}
                </td>
                <td style={{ padding: '12px', borderBottom: '1px solid rgba(201,169,110,0.1)', fontFamily: 'var(--font-sans)', fontSize: '0.85rem', color: 'var(--muted)' }}>
                  {(b.court as any)?.name}
                </td>
                <td style={{ padding: '12px', borderBottom: '1px solid rgba(201,169,110,0.1)', fontFamily: 'var(--font-sans)', fontSize: '0.82rem', color: 'var(--muted)' }}>
                  {new Date(b.starts_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} · {new Date(b.starts_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                </td>
                <td style={{ padding: '12px', borderBottom: '1px solid rgba(201,169,110,0.1)', fontFamily: 'var(--font-sans)', fontSize: '0.85rem', fontWeight: 500, color: 'var(--forest)' }}>
                  {formatAZN(Number(b.final_price_azn))}
                </td>
                <td style={{ padding: '12px', borderBottom: '1px solid rgba(201,169,110,0.1)' }}>
                  <span style={{
                    fontFamily: 'var(--font-sans)', fontSize: '0.7rem', padding: '3px 10px',
                    borderRadius: 20, textTransform: 'capitalize',
                    background: b.status === 'confirmed' ? 'rgba(74,124,89,0.1)' : b.status === 'pending_payment' ? 'rgba(180,83,9,0.1)' : 'rgba(220,38,38,0.08)',
                    color: b.status === 'confirmed' ? 'var(--sage)' : b.status === 'pending_payment' ? '#B45309' : '#DC2626',
                  }}>
                    {b.status.replace('_', ' ')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
