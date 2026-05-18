import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default async function CoachLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('role, full_name').eq('id', user.id).single()
  if (!['admin', 'manager', 'coach'].includes(profile?.role ?? '')) redirect('/')

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--cream)' }}>
      <aside style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: 240, background: 'var(--forest)', zIndex: 40, borderRight: '1px solid rgba(201,169,110,0.15)' }}>
        <div style={{ padding: '2rem 1.5rem', borderBottom: '1px solid rgba(201,169,110,0.12)' }}>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.6rem', letterSpacing: '0.25em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 6 }}>Coach Portal</p>
          <p style={{ fontFamily: 'var(--font-display)', color: 'var(--ivory)', fontSize: '1.1rem' }}>{profile?.full_name}</p>
        </div>
        <nav style={{ padding: '1rem 0.75rem' }}>
          {[
            { href: '/coach/schedule', label: 'My Schedule' },
            { href: '/coach/sessions', label: 'Training Sessions' },
          ].map(item => (
            <Link key={item.href} href={item.href} style={{ display: 'block', padding: '0.6rem 0.75rem', borderRadius: 8, marginBottom: 4, fontFamily: 'var(--font-sans)', fontSize: '0.82rem', color: 'rgba(253,250,245,0.65)', textDecoration: 'none' }}>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main style={{ flex: 1, marginLeft: 240, padding: '2rem 2.5rem' }}>{children}</main>
    </div>
  )
}
