'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'

const nav = [
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

export default function AdminSidebar({ profile }: { profile: any }) {
  const pathname = usePathname()
  const t = useTranslations('admin')

  return (
    <aside style={{
      position: 'fixed', top: 0, left: 0, bottom: 0, width: 220,
      background: 'var(--charcoal)', zIndex: 40,
      borderRight: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div style={{ padding: '18px 18px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <p style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.2em', color: 'var(--lime)', textTransform: 'uppercase', marginBottom: 4 }}>Admin</p>
        <p style={{ fontSize: 16, fontWeight: 900, color: 'var(--white)' }}>PADEL<span style={{ color: 'var(--lime)' }}>POINT</span></p>
      </div>
      <nav style={{ padding: '10px 0' }}>
        {nav.map(item => {
          const active = pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 18px', fontSize: 12, fontWeight: 600,
              color: active ? 'var(--lime)' : 'rgba(255,255,255,0.4)',
              textDecoration: 'none', transition: 'all 0.12s',
              background: active ? 'rgba(200,230,60,0.08)' : 'transparent',
              borderLeft: `2px solid ${active ? 'var(--lime)' : 'transparent'}`,
            }}>
              <i className={`ti ${item.icon}`} aria-hidden="true" style={{ fontSize: 16 }} />
              {t(item.key as any)}
            </Link>
          )
        })}
      </nav>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '14px 18px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--white)', marginBottom: 2 }}>{profile?.full_name}</p>
        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'capitalize' }}>{profile?.role}</p>
      </div>
    </aside>
  )
}
