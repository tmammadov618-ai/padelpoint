import { createClient } from '@/lib/supabase/server'

export default async function CourtsPage() {
  const supabase = await createClient()
  const { data: courts } = await supabase.from('courts').select('*').order('name')

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--forest)', marginBottom: '2rem' }}>Courts</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {courts?.map(court => (
          <div key={court.id} style={{ background: 'var(--ivory)', border: '1px solid rgba(201,169,110,0.3)', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ height: 160, background: 'linear-gradient(135deg, var(--forest) 0%, var(--sage) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'rgba(201,169,110,0.4)' }}>Court</span>
            </div>
            <div style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--forest)' }}>{court.name}</h3>
                <span style={{
                  fontFamily: 'var(--font-sans)', fontSize: '0.68rem', padding: '3px 10px', borderRadius: 20,
                  background: court.is_active ? 'rgba(74,124,89,0.1)' : 'rgba(220,38,38,0.08)',
                  color: court.is_active ? 'var(--sage)' : '#DC2626',
                }}>
                  {court.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '1rem', lineHeight: 1.5 }}>
                {court.description ?? 'Professional padel court with premium surface and LED lighting.'}
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={{ flex: 1, padding: '8px', borderRadius: 8, border: '1px solid rgba(201,169,110,0.3)', background: 'transparent', fontFamily: 'var(--font-sans)', fontSize: '0.78rem', color: 'var(--forest)', cursor: 'pointer' }}>
                  Edit
                </button>
                <button style={{ flex: 1, padding: '8px', borderRadius: 8, border: '1px solid rgba(201,169,110,0.3)', background: court.is_active ? 'rgba(220,38,38,0.05)' : 'rgba(74,124,89,0.05)', fontFamily: 'var(--font-sans)', fontSize: '0.78rem', color: court.is_active ? '#DC2626' : 'var(--sage)', cursor: 'pointer' }}>
                  {court.is_active ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
