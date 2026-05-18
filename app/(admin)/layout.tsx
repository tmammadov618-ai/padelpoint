import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import LangSwitcher from '@/components/layout/LangSwitcher'

const navItems = [
  { key: 'dashboard',   icon: 'ti-layout-dashboard', href: '/admin/dashboard'   },
  { key: 'bookings',    icon: 'ti-calendar',          href: '/admin/bookings'    },
  { key: 'courts',      icon: 'ti-building-stadium',  href: '/admin/courts'      },
  { key: 'coaches',     icon: 'ti-users',             href: '/admin/coaches'     },
  { key: 'customers',   icon: 'ti-user',              href: '/admin/customers'   },
  { key: 'memberships', icon: 'ti-id-badge',          href: '/admin/memberships' },
  { key: 'pricing',     icon: 'ti-currency-dollar',   href: '/admin/pricing'     },
  { key: 'promos',      icon: 'ti-tag',               href: '/admin/promos'      },
  { key: 'shop',        icon: 'ti-shopping-bag',      href: '/admin/shop'        },
  { key: 'reports',     icon: 'ti-chart-bar',         href: '/admin/reports'     },
] as const

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('role, full_name').eq('id', user.id).single()
  if (!['admin', 'manager'].includes(profile?.role ?? '')) redirect('/')

  const cookieStore = await cookies()
  const locale = cookieStore.get('locale')?.value ?? 'az'
  const t = await getTranslations('admin')

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, width: 220,
        background: 'var(--charcoal)', zIndex: 40,
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ padding: '18px 18px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <p style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.2em', color: 'var(--lime)', textTransform: 'uppercase', marginBottom: 4 }}>{t('panel')}</p>
          <p style={{ fontSize: 16, fontWeight: 900, color: 'var(--white)' }}>
            PADEL<span style={{ color: 'var(--lime)' }}>POINT</span>
          </p>
        </div>

        <nav style={{ flex: 1, padding: '10px 0', overflowY: 'auto' }}>
          {navItems.map(item => (
            <Link key={item.href} href={item.href} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 18px', fontSize: 12, fontWeight: 600,
              color: 'rgba(255,255,255,0.4)', textDecoration: 'none',
              borderLeft: '2px solid transparent', transition: 'all 0.12s',
            }}
            className="sidebar-link">
              <i className={`ti ${item.icon}`} aria-hidden="true" style={{ fontSize: 16 }} />
              {t(item.key as any)}
            </Link>
          ))}
        </nav>

        <div style={{ padding: '14px 18px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--white)', marginBottom: 2 }}>{profile?.full_name}</p>
          <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'capitalize', marginBottom: 10 }}>{profile?.role}</p>
          <div style={{ marginBottom: 10 }}>
            <LangSwitcher current={locale} />
          </div>
          <form action="/api/auth/signout" method="POST">
            <button type="submit" style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              {t('signOut')} →
            </button>
          </form>
        </div>
      </aside>

      <main style={{ marginLeft: 220, flex: 1, padding: '28px 32px', background: 'var(--off-white)', minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  )
}
