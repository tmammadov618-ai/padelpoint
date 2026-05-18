'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const supabase = createClient()

    const { data, error: authErr } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.fullName } },
    })
    if (authErr) { setError(authErr.message); setLoading(false); return }

    if (data.user) {
      // Create profile + send welcome email
      await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: data.user.id, email: form.email, fullName: form.fullName }),
      })
      if (form.phone) {
        await supabase.from('profiles').update({ phone: form.phone }).eq('id', data.user.id)
      }
      // Try to sign in immediately
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      })
      if (!signInErr) {
        router.push('/my-bookings')
        router.refresh()
        return
      }
    }
    setDone(true)
    setLoading(false)
  }

  const iStyle = { width: '100%', padding: '10px 13px', border: '1px solid #E8E8E5', borderRadius: 7, fontSize: 13, background: 'white', color: '#3A3A3A', outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' as const }
  const lStyle = { display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#888', marginBottom: 5 }

  if (done) return (
    <div style={{ background: 'white', borderRadius: 12, padding: '28px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', textAlign: 'center' }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>🎾</div>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: '#3A3A3A', marginBottom: 8 }}>Xoş gəldiniz!</h2>
      <p style={{ fontSize: 13, color: '#888', marginBottom: 20, lineHeight: 1.6 }}>
        Hesabınız uğurla yaradıldı. E-poçtunuzu yoxlayın, sonra daxil olun.
      </p>
      <Link href="/login" style={{ display: 'inline-block', background: '#3A3A3A', color: '#C8E63C', padding: '11px 28px', borderRadius: 7, fontWeight: 800, fontSize: 13, textDecoration: 'none' }}>
        Daxil ol →
      </Link>
    </div>
  )

  return (
    <div style={{ background: 'white', borderRadius: 12, padding: '28px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: '#3A3A3A', marginBottom: 4 }}>Hesab yaradın</h2>
      <p style={{ fontSize: 12, color: '#888', marginBottom: 22 }}>PadelPoint Bakıya qoşulun</p>
      {error && <div style={{ background: '#fef0f0', border: '1px solid #f5c0c0', borderRadius: 7, padding: '10px 13px', marginBottom: 14 }}><p style={{ fontSize: 12, color: '#dc2626' }}>{error}</p></div>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div><label style={lStyle}>Ad Soyad</label><input required value={form.fullName} onChange={e => set('fullName', e.target.value)} style={iStyle} /></div>
        <div><label style={lStyle}>E-poçt</label><input type="email" required value={form.email} onChange={e => set('email', e.target.value)} style={iStyle} /></div>
        <div><label style={lStyle}>Telefon (isteğe bağlı)</label><input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+994 XX XXX XXXX" style={iStyle} /></div>
        <div><label style={lStyle}>Şifrə — minimum 6 simvol</label><input type="password" required minLength={6} value={form.password} onChange={e => set('password', e.target.value)} style={iStyle} /></div>
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '11px', background: '#3A3A3A', color: '#C8E63C', border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 800, cursor: loading ? 'wait' : 'pointer', marginTop: 6, opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Yaradılır…' : 'Hesab Yarat'}
        </button>
      </form>
      <div style={{ textAlign: 'center', marginTop: 16, paddingTop: 14, borderTop: '1px solid #f0f0f0' }}>
        <p style={{ fontSize: 12, color: '#888' }}>Hesabınız var? <Link href="/login" style={{ color: '#D4875A', fontWeight: 700, textDecoration: 'none' }}>Daxil olun</Link></p>
      </div>
    </div>
  )
}
