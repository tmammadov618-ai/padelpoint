import { createClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import { formatAZN } from '@/lib/utils'
import Link from 'next/link'

export default async function MembershipPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: plans } = await supabase.from('membership_plans').select('*').eq('is_active', true).order('price_azn')
  const t = await getTranslations('membership')

  let activeMembership = null
  if (user) {
    const { data } = await supabase
      .from('customer_memberships')
      .select('*, plan:membership_plans(name)')
      .eq('customer_id', user.id).eq('status', 'active').single()
    activeMembership = data
  }

  const benefitsMap = [
    [t('benefits.priority')],
    [t('benefits.priority'), t('benefits.locker'), t('benefits.balls'), t('benefits.guest1')],
    [t('benefits.priority'), t('benefits.locker'), t('benefits.balls'), t('benefits.guestUnlimited'), t('benefits.coaching')],
  ]

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ display: 'inline-block', background: 'var(--charcoal)', padding: '4px 14px', borderRadius: 4, marginBottom: 12 }}>
          <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', color: 'var(--lime)', textTransform: 'uppercase' }}>{t('tag')}</p>
        </div>
        <h1 style={{ fontSize: 'clamp(22px,4vw,34px)', fontWeight: 900, color: 'var(--charcoal)', marginBottom: 10 }}>{t('title')}</h1>
        <p style={{ fontSize: 13, color: 'var(--gray)', maxWidth: 440, margin: '0 auto' }}>{t('subtitle')}</p>
      </div>

      {activeMembership && (
        <div style={{ maxWidth: 560, margin: '0 auto 24px', background: 'var(--charcoal)', borderRadius: 12, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', color: 'var(--lime)', textTransform: 'uppercase', marginBottom: 4 }}>{t('active')}</p>
            <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--white)', marginBottom: 2 }}>{(activeMembership.plan as any)?.name}</p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>
              {activeMembership.sessions_used} / {activeMembership.sessions_total} {t('sessionsUsed')} · {t('expires')} {new Date(activeMembership.expires_at).toLocaleDateString('en-GB')}
            </p>
          </div>
          <div style={{ width: 44, height: 44, borderRadius: '50%', border: '2px solid var(--lime)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: 'var(--lime)', fontWeight: 900 }}>✓</div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, maxWidth: 860, margin: '0 auto' }}>
        {plans?.map((plan, i) => (
          <div key={plan.id} style={{
            background: 'var(--white)', border: i === 1 ? '2px solid var(--charcoal)' : '1px solid var(--gray-light)',
            borderRadius: 12, padding: '20px', position: 'relative',
          }}>
            {i === 1 && (
              <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'var(--lime)', color: 'var(--charcoal)', fontSize: 9, fontWeight: 800, padding: '4px 14px', borderRadius: 20, whiteSpace: 'nowrap', letterSpacing: '0.08em' }}>
                {t('mostPopular')}
              </div>
            )}
            <p style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.14em', color: 'var(--terra)', textTransform: 'uppercase', marginBottom: 8 }}>{t('planTag')}</p>
            <p style={{ fontSize: 16, fontWeight: 900, color: 'var(--charcoal)', marginBottom: 2 }}>{plan.name}</p>
            <p style={{ fontSize: 26, fontWeight: 900, color: 'var(--charcoal)', marginBottom: 2 }}>
              {formatAZN(Number(plan.price_azn)).replace(' AZN','')} <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--gray)' }}>{t('perMonth')}</span>
            </p>
            <p style={{ fontSize: 11, color: 'var(--gray)', marginBottom: 14 }}>{plan.sessions_count} {t('sessionsPerMonth')}</p>
            <div style={{ borderTop: '1px solid var(--gray-light)', paddingTop: 12, marginBottom: 16 }}>
              {(benefitsMap[i] ?? []).map((b, j) => (
                <p key={j} style={{ fontSize: 11, fontWeight: 500, color: 'var(--charcoal)', padding: '3px 0' }}>✓ {b}</p>
              ))}
            </div>
            {user ? (
              <button style={{ width: '100%', padding: '10px', borderRadius: 7, border: 'none', background: i === 1 ? 'var(--charcoal)' : 'var(--gray-light)', color: i === 1 ? 'var(--lime)' : 'var(--charcoal)', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>
                {activeMembership ? t('upgrade') : t('getStarted')}
              </button>
            ) : (
              <Link href="/register" style={{ display: 'block', textAlign: 'center', padding: '10px', borderRadius: 7, background: i === 1 ? 'var(--charcoal)' : 'var(--gray-light)', color: i === 1 ? 'var(--lime)' : 'var(--charcoal)', fontSize: 12, fontWeight: 800, textDecoration: 'none' }}>
                {t('getStarted')}
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
