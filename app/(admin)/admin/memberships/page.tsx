import { createClient } from '@/lib/supabase/server'
import { formatAZN } from '@/lib/utils'

export default async function MembershipsPage() {
  const supabase = await createClient()
  const { data: plans }       = await supabase.from('membership_plans').select('*').order('price_azn')
  const { data: memberships } = await supabase
    .from('customer_memberships')
    .select('*, customer:profiles!customer_id(full_name, email), plan:membership_plans(name)')
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--forest)', marginBottom: '2rem' }}>Memberships</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        {plans?.map(plan => (
          <div key={plan.id} style={{ background: 'var(--ivory)', border: '1px solid rgba(201,169,110,0.3)', borderRadius: 12, padding: '1.5rem' }}>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gold-dark)', marginBottom: 8 }}>Plan</p>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--forest)', marginBottom: 4 }}>{plan.name}</h3>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--forest)', marginBottom: 12 }}>
              {formatAZN(Number(plan.price_azn))} <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>/{plan.duration_days}d</span>
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.78rem', color: 'var(--muted)' }}>✓ {plan.sessions_count} sessions / month</p>
              {plan.discount_pct > 0 && <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.78rem', color: 'var(--sage)' }}>✓ {plan.discount_pct}% booking discount</p>}
              {plan.benefits?.map((b: string, i: number) => <p key={i} style={{ fontFamily: 'var(--font-sans)', fontSize: '0.78rem', color: 'var(--muted)' }}>✓ {b}</p>)}
            </div>
            <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
              <button style={{ flex: 1, padding: '7px', border: '1px solid rgba(201,169,110,0.3)', borderRadius: 6, background: 'transparent', fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: 'var(--forest)', cursor: 'pointer' }}>Edit</button>
            </div>
          </div>
        ))}
        <button style={{ border: '2px dashed rgba(201,169,110,0.3)', borderRadius: 12, padding: '1.5rem', background: 'transparent', cursor: 'pointer', color: 'var(--muted)', fontFamily: 'var(--font-sans)', fontSize: '0.85rem' }}>
          + Add Plan
        </button>
      </div>

      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--forest)', marginBottom: '1rem' }}>Active Subscriptions</h2>
      <div style={{ background: 'var(--ivory)', border: '1px solid rgba(201,169,110,0.3)', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(248,244,237,0.8)' }}>
              {['Customer', 'Plan', 'Sessions', 'Expires', 'Status'].map(h => (
                <th key={h} style={{ fontFamily: 'var(--font-sans)', fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid rgba(201,169,110,0.2)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {memberships?.map(m => (
              <tr key={m.id}>
                <td style={{ padding: '12px 16px', borderBottom: '1px solid rgba(201,169,110,0.1)', fontFamily: 'var(--font-sans)', fontSize: '0.85rem' }}>{(m.customer as any)?.full_name}</td>
                <td style={{ padding: '12px 16px', borderBottom: '1px solid rgba(201,169,110,0.1)', fontFamily: 'var(--font-sans)', fontSize: '0.82rem', color: 'var(--muted)' }}>{(m.plan as any)?.name}</td>
                <td style={{ padding: '12px 16px', borderBottom: '1px solid rgba(201,169,110,0.1)', fontFamily: 'var(--font-sans)', fontSize: '0.82rem', color: 'var(--muted)' }}>{m.sessions_used} / {m.sessions_total}</td>
                <td style={{ padding: '12px 16px', borderBottom: '1px solid rgba(201,169,110,0.1)', fontFamily: 'var(--font-sans)', fontSize: '0.78rem', color: 'var(--muted)' }}>{new Date(m.expires_at).toLocaleDateString('en-GB')}</td>
                <td style={{ padding: '12px 16px', borderBottom: '1px solid rgba(201,169,110,0.1)' }}>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.68rem', padding: '3px 10px', borderRadius: 20, background: m.status === 'active' ? 'rgba(74,124,89,0.1)' : 'rgba(220,38,38,0.08)', color: m.status === 'active' ? 'var(--sage)' : '#DC2626' }}>
                    {m.status}
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
