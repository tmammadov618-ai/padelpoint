import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatAZN } from '@/lib/utils'

export default async function CoachSessionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: sessions } = await supabase
    .from('bookings')
    .select('*, customer:profiles!customer_id(full_name, phone), court:courts(name)')
    .eq('coach_id', user.id)
    .eq('booking_type', 'coach_training')
    .order('starts_at', { ascending: false })

  const upcoming = sessions?.filter(s => new Date(s.starts_at) > new Date() && s.status === 'confirmed') ?? []
  const past     = sessions?.filter(s => new Date(s.starts_at) <= new Date()) ?? []

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--forest)', marginBottom: '2rem' }}>Training Sessions</h1>

      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--forest)', marginBottom: '1rem' }}>Upcoming ({upcoming.length})</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: '2.5rem' }}>
        {upcoming.map(s => (
          <div key={s.id} style={{ background: 'var(--ivory)', border: '1px solid rgba(74,124,89,0.25)', borderLeft: '3px solid var(--sage)', borderRadius: 10, padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--forest)', marginBottom: 4 }}>{(s.customer as any)?.full_name}</p>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.78rem', color: 'var(--muted)' }}>
                {(s.court as any)?.name} · {new Date(s.starts_at).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })} · {new Date(s.starts_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
              </p>
              {(s.customer as any)?.phone && <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.72rem', color: 'var(--muted-light)', marginTop: 2 }}>{(s.customer as any).phone}</p>}
            </div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--forest)' }}>{formatAZN(Number(s.final_price_azn))}</p>
          </div>
        ))}
        {upcoming.length === 0 && <p style={{ fontFamily: 'var(--font-serif)', color: 'var(--muted)', fontStyle: 'italic' }}>No upcoming sessions.</p>}
      </div>

      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--forest)', marginBottom: '1rem' }}>Past Sessions ({past.length})</h2>
      <div style={{ background: 'var(--ivory)', border: '1px solid rgba(201,169,110,0.3)', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: 'rgba(248,244,237,0.8)' }}>
            {['Customer', 'Court', 'Date', 'Amount', 'Status'].map(h => <th key={h} style={{ fontFamily: 'var(--font-sans)', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid rgba(201,169,110,0.2)' }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {past.slice(0, 30).map(s => (
              <tr key={s.id}>
                <td style={{ padding: '11px 16px', borderBottom: '1px solid rgba(201,169,110,0.1)', fontFamily: 'var(--font-sans)', fontSize: '0.83rem' }}>{(s.customer as any)?.full_name}</td>
                <td style={{ padding: '11px 16px', borderBottom: '1px solid rgba(201,169,110,0.1)', fontFamily: 'var(--font-sans)', fontSize: '0.82rem', color: 'var(--muted)' }}>{(s.court as any)?.name}</td>
                <td style={{ padding: '11px 16px', borderBottom: '1px solid rgba(201,169,110,0.1)', fontFamily: 'var(--font-sans)', fontSize: '0.78rem', color: 'var(--muted)' }}>{new Date(s.starts_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                <td style={{ padding: '11px 16px', borderBottom: '1px solid rgba(201,169,110,0.1)', fontFamily: 'var(--font-sans)', fontSize: '0.83rem', fontWeight: 500, color: 'var(--forest)' }}>{formatAZN(Number(s.final_price_azn))}</td>
                <td style={{ padding: '11px 16px', borderBottom: '1px solid rgba(201,169,110,0.1)' }}>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.68rem', padding: '3px 10px', borderRadius: 20, background: s.status === 'confirmed' || s.status === 'completed' ? 'rgba(74,124,89,0.1)' : 'rgba(107,97,82,0.08)', color: s.status === 'confirmed' || s.status === 'completed' ? 'var(--sage)' : 'var(--muted)', textTransform: 'capitalize' }}>{s.status.replace('_',' ')}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
