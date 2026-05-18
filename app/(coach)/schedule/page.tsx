import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const HOURS = Array.from({ length: 16 }, (_, i) => i + 7)

export default async function CoachSchedulePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: availability } = await supabase
    .from('coach_availability')
    .select('*')
    .eq('coach_id', user.id)

  const { data: blocked } = await supabase
    .from('coach_blocked_times')
    .select('*')
    .eq('coach_id', user.id)
    .gte('blocked_from', new Date().toISOString())
    .order('blocked_from')

  const slotSet = new Set((availability ?? []).map(a => `${a.day_of_week}-${a.time_from.slice(0,5)}`))

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--forest)', marginBottom: '0.5rem' }}>My Schedule</h1>
      <p style={{ fontFamily: 'var(--font-serif)', color: 'var(--muted)', fontStyle: 'italic', marginBottom: '2rem' }}>Set your weekly availability for training sessions</p>

      <div style={{ background: 'var(--ivory)', border: '1px solid rgba(201,169,110,0.3)', borderRadius: 12, padding: '1.5rem', marginBottom: '2rem', overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', minWidth: 600 }}>
          <thead>
            <tr>
              <th style={{ width: 80, fontFamily: 'var(--font-sans)', fontSize: '0.65rem', color: 'var(--muted)', textAlign: 'left', paddingBottom: 8 }}>Hour</th>
              {DAYS.map(d => (
                <th key={d} style={{ fontFamily: 'var(--font-sans)', fontSize: '0.65rem', color: 'var(--muted)', textAlign: 'center', paddingBottom: 8, letterSpacing: '0.08em' }}>
                  {d.slice(0,3).toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HOURS.map(h => (
              <tr key={h}>
                <td style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: 'var(--muted-light)', paddingRight: 12, paddingBottom: 4 }}>{h}:00</td>
                {DAYS.map((_, d) => {
                  const key = `${d}-${String(h).padStart(2,'0')}:00`
                  const active = slotSet.has(key)
                  return (
                    <td key={d} style={{ padding: '2px 4px', textAlign: 'center' }}>
                      <div style={{
                        width: 32, height: 24, borderRadius: 4, margin: '0 auto',
                        background: active ? 'rgba(74,124,89,0.15)' : 'rgba(201,169,110,0.06)',
                        border: active ? '1px solid rgba(74,124,89,0.3)' : '1px solid rgba(201,169,110,0.12)',
                        cursor: 'pointer',
                      }} />
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.72rem', color: 'var(--muted-light)', marginTop: 12 }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: 2, background: 'rgba(74,124,89,0.15)', border: '1px solid rgba(74,124,89,0.3)', marginRight: 6, verticalAlign: 'middle' }} />
          Available · Click to toggle (save button coming soon)
        </p>
      </div>

      {blocked && blocked.length > 0 && (
        <div style={{ background: 'var(--ivory)', border: '1px solid rgba(201,169,110,0.3)', borderRadius: 12, padding: '1.5rem' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--forest)', marginBottom: '1rem' }}>Blocked Times</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {blocked.map(b => (
              <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: 'rgba(248,244,237,0.5)', borderRadius: 8 }}>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.82rem', color: 'var(--charcoal)' }}>
                  {new Date(b.blocked_from).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} – {new Date(b.blocked_to).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                </span>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.78rem', color: 'var(--muted)' }}>{b.reason ?? 'Unavailable'}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
