'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useTranslations } from 'next-intl'

export default function LoginPage() {
  const router = useRouter()
  const t = useTranslations('auth')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const supabase = createClient()
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) { setError(err.message); setLoading(false); return }
    router.push('/my-bookings')
    router.refresh()
  }

  const iStyle = {
    width: '100%', padding: '10px 13px',
    border: '1px solid var(--gray-light)', borderRadius: 7,
    fontSize: 13, background: 'var(--white)', color: 'var(--charcoal)',
    outline: 'none', fontFamily: 'Inter, sans-serif',
  } as const

  return (
    <div style={{ background: 'var(--white)', borderRadius: 12, padding: '28px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--charcoal)', marginBottom: 4 }}>{t('welcomeBack')}</h2>
      <p style={{ fontSize: 12, color: 'var(--gray)', marginBottom: 22 }}>{t('signInSub')}</p>

      {error && (
        <div style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 7, padding: '10px 13px', marginBottom: 16 }}>
          <p style={{ fontSize: 12, color: 'var(--danger)' }}>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gray)', marginBottom: 5 }}>{t('email')}</label>
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)} style={iStyle} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gray)', marginBottom: 5 }}>{t('password')}</label>
          <input type="password" required value={password} onChange={e => setPassword(e.target.value)} style={iStyle} />
        </div>
        <button type="submit" disabled={loading} style={{
          width: '100%', padding: '11px', background: 'var(--charcoal)', color: 'var(--lime)',
          border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 800,
          cursor: loading ? 'wait' : 'pointer', marginTop: 4,
          opacity: loading ? 0.7 : 1, letterSpacing: '0.02em',
        }}>
          {loading ? t('signingIn') : t('signIn')}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--gray-light)' }}>
        <p style={{ fontSize: 12, color: 'var(--gray)' }}>
          {t('noAccount')}{' '}
          <Link href="/register" style={{ color: 'var(--terra)', fontWeight: 700, textDecoration: 'none' }}>{t('register')}</Link>
        </p>
      </div>
    </div>
  )
}
