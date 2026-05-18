import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import LangSwitcher from '@/components/layout/LangSwitcher'

export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = user
    ? await supabase.from('profiles').select('full_name, role').eq('id', user.id).single()
    : { data: null }

  const cookieStore = await cookies()
  const locale = cookieStore.get('locale')?.value ?? 'az'
  const t = await getTranslations('nav')

  return (
    <div style={{ minHeight: '100vh', background: 'var(--off-white)' }}>
      <nav style={{
        background: 'var(--charcoal)',
        height: 58,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 30,
      }}>
        <Link href="/" style={{
          fontSize: 18,
          fontWeight: 900,
          color: 'var(--white)',
          textDecoration: 'none',
          letterSpacing: '0.04em',
        }}>
          PADEL<span style={{ color: 'var(--lime)' }}>POINT</span>
        </Link>

        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <Link href="/book" style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', padding: '6px 12px', borderRadius: 6 }}>
            {t('book')}
          </Link>
          <Link href="/membership" style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', padding: '6px 12px', borderRadius: 6 }}>
            {t('membership')}
          </Link>
          {user ? (
            <>
              <Link href="/my-bookings" style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', padding: '6px 12px', borderRadius: 6 }}>
                {t('myBookings')}
              </Link>
              <Link href="/profile" style={{ fontSize: 12, fontWeight: 700, color: 'var(--white)', textDecoration: 'none', padding: '6px 12px' }}>
                {profile?.full_name?.split(' ')[0]}
              </Link>
              {['admin', 'manager'].includes(profile?.role ?? '') && (
                <Link href="/admin/dashboard" style={{ fontSize: 11, fontWeight: 700, padding: '5px 12px', background: 'rgba(200,230,60,0.1)', color: 'var(--lime)', borderRadius: 6, textDecoration: 'none', border: '1px solid rgba(200,230,60,0.25)' }}>
                  {t('admin')}
                </Link>
              )}
            </>
          ) : (
            <Link href="/login" style={{ fontSize: 12, fontWeight: 700, padding: '7px 16px', background: 'var(--lime)', color: 'var(--charcoal)', borderRadius: 6, textDecoration: 'none' }}>
              {t('signIn')}
            </Link>
          )}
          <LangSwitcher current={locale} />
        </div>
      </nav>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 24px' }}>
        {children}
      </div>
    </div>
  )
}
