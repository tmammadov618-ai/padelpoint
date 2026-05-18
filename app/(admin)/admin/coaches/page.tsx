import { createClient } from '@/lib/supabase/server'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default async function CoachesPage() {
  const supabase = await createClient()
  const { data: coaches } = await supabase.from('profiles').select('*').eq('role', 'coach').eq('is_active', true)
  const coachIds = coaches?.map(c => c.id) ?? []
  const { data: availability } = coachIds.length
    ? await supabase.from('coach_availability').select('*').in('coach_id', coachIds).eq('is_active', true)
    : { data: [] }

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--forest)', marginBottom: '2rem' }}>Coaches</h1>
      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {coaches?.map(coach => {
          const slots = availability?.filter(a => a.coach_id === coach.id) ?? []
          return (
            <div key={coach.id} style={{ background: 'var(--ivory)', border: '1px solid rgba(201,169,110,0.3)', borderRadius: 12, padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, var(--forest), var(--sage))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold-light)', fontFamily: 'var(--font-display)', fontSize: '1.2rem' }}>
                    {coach.full_name[0]}
                  </div>
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--forest)' }}>{coach.full_name}</h3>
                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.78rem', color: 'var(--muted)' }}>{coach.email}</p>
                  </div>
                </div>
                <button style={{ padding: '7px 16px', border: '1px solid rgba(201,169,110,0.3)', borderRadius: 8, background: 'transparent', fontFamily: 'var(--font-sans)', fontSize: '0.78rem', color: 'var(--forest)', cursor: 'pointer' }}>
                  Edit Schedule
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {slots.sort((a, b) => a.day_of_week - b.day_of_week).map(slot => (
                  <div key={slot.id} style={{ padding: '4px 12px', background: 'rgba(74,124,89,0.08)', border: '1px solid rgba(74,124,89,0.2)', borderRadius: 20 }}>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.72rem', color: 'var(--sage)' }}>
                      {DAYS[slot.day_of_week].slice(0,3)} · {slot.time_from.slice(0,5)}–{slot.time_to.slice(0,5)}
                    </span>
                  </div>
                ))}
                {slots.length === 0 && <p style={{ fontFamily: 'var(--font-serif)', fontSize: '0.85rem', color: 'var(--muted)', fontStyle: 'italic' }}>No availability set</p>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
