import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatAZN } from '@/lib/utils'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile }    = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const { data: pointsData } = await supabase.from('loyalty_points').select('points').eq('customer_id', user.id)
  const totalPoints = pointsData?.reduce((s, p) => s + p.points, 0) ?? 0

  const { data: membership } = await supabase
    .from('customer_memberships')
    .select('*, plan:membership_plans(name, discount_pct)')
    .eq('customer_id', user.id).eq('status', 'active').single()

  const { count: bookingsCount } = await supabase
    .from('bookings').select('id', { count: 'exact', head: true })
    .eq('customer_id', user.id).eq('status', 'confirmed')

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--forest)', marginBottom: '2rem' }}>My Profile</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Bookings', value: String(bookingsCount ?? 0) },
          { label: 'Loyalty Points', value: String(totalPoints) },
          { label: 'Membership',     value: (membership?.plan as any)?.name ?? 'None' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--ivory)', border: '1px solid rgba(201,169,110,0.3)', borderRadius: 12, padding: '1.25rem', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>{s.label}</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--forest)' }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div style={{ background: 'var(--ivory)', border: '1px solid rgba(201,169,110,0.3)', borderRadius: 12, padding: '2rem' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--forest)', marginBottom: '1.5rem' }}>Account Details</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            { label: 'Full Name', value: profile?.full_name },
            { label: 'Email',     value: profile?.email },
            { label: 'Phone',     value: profile?.phone ?? 'Not set' },
            { label: 'Language',  value: profile?.language?.toUpperCase() ?? 'AZ' },
          ].map(f => (
            <div key={f.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(201,169,110,0.1)' }}>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>{f.label}</span>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.88rem', color: 'var(--charcoal)' }}>{f.value}</span>
            </div>
          ))}
        </div>
        <button style={{ marginTop: '1.5rem', padding: '10px 24px', border: '1px solid rgba(201,169,110,0.35)', borderRadius: 8, background: 'transparent', fontFamily: 'var(--font-sans)', fontSize: '0.82rem', color: 'var(--forest)', cursor: 'pointer' }}>
          Edit Profile
        </button>
      </div>

      <div style={{ marginTop: '1.5rem', background: 'var(--ivory)', border: '1px solid rgba(201,169,110,0.3)', borderRadius: 12, padding: '2rem' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--forest)', marginBottom: '0.5rem' }}>Sign Out</h2>
        <p style={{ fontFamily: 'var(--font-serif)', color: 'var(--muted)', fontStyle: 'italic', marginBottom: '1rem', fontSize: '0.88rem' }}>You will be redirected to the home page.</p>
        <form action="/api/auth/signout" method="POST">
          <button type="submit" style={{ padding: '9px 22px', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 8, background: 'rgba(220,38,38,0.04)', fontFamily: 'var(--font-sans)', fontSize: '0.82rem', color: '#DC2626', cursor: 'pointer' }}>
            Sign Out
          </button>
        </form>
      </div>
    </div>
  )
}
