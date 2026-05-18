'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { format, addDays } from 'date-fns'

export default function NewBookingPage() {
  const router = useRouter()
  const [courts, setCourts]   = useState<any[]>([])
  const [coaches, setCoaches] = useState<any[]>([])
  const [slots, setSlots]     = useState<any[]>([])
  const [form, setForm] = useState({
    courtId: '', date: format(new Date(), 'yyyy-MM-dd'),
    slot: null as any, bookingType: 'single', coachId: '',
    customerEmail: '', notes: '',
  })
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  function set(k: string, v: any) { setForm(f => ({ ...f, [k]: v })) }

  useEffect(() => {
    fetch('/api/products?categories=').then(r=>r.json())  // just wake cache
    fetch('/api/courts-list').then(r => r.json()).then(d => setCourts(d.courts ?? [])).catch(() => {})
    // Fallback: load courts from supabase via a simple endpoint
    fetch('/api/admin/courts').then(r => r.json()).then(d => setCourts(d ?? [])).catch(() => {})
  }, [])

  useEffect(() => {
    if (!form.courtId || !form.date) return
    setSlots([])
    fetch(`/api/availability?courtId=${form.courtId}&date=${form.date}`)
      .then(r => r.json())
      .then(d => setSlots(d.slots ?? []))
  }, [form.courtId, form.date])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.slot) { setError('Please select a time slot'); return }
    setLoading(true); setError('')

    // For admin bookings: find or create customer, then create booking + mark confirmed (cash payment)
    const res = await fetch('/api/admin/bookings/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        courtId: form.courtId,
        startsAt: form.slot.start,
        endsAt: form.slot.end,
        bookingType: form.bookingType,
        coachId: form.coachId || null,
        customerEmail: form.customerEmail,
        notes: form.notes,
        paymentMethod: 'cash',
      }),
    })

    if (!res.ok) {
      const d = await res.json()
      setError(d.error ?? 'Failed to create booking')
      setLoading(false)
      return
    }

    router.push('/admin/bookings')
  }

  const dates = Array.from({ length: 30 }, (_, i) => format(addDays(new Date(), i), 'yyyy-MM-dd'))
  const availableSlots = slots.filter((s: any) => s.available)

  return (
    <div style={{ maxWidth: 680 }}>
      <div style={{ marginBottom: '2rem' }}>
        <a href="/admin/bookings" style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', color: 'var(--muted)', textDecoration: 'none' }}>← Bookings</a>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--forest)', marginTop: 8 }}>New Booking</h1>
        <p style={{ fontFamily: 'var(--font-serif)', color: 'var(--muted)', fontStyle: 'italic', fontSize: '0.9rem' }}>Create a booking manually (cash / walk-in)</p>
      </div>

      {error && <div style={{ padding: '10px 14px', background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 8, marginBottom: '1.25rem', fontFamily: 'var(--font-sans)', fontSize: '0.82rem', color: '#DC2626' }}>{error}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {[
          { label: 'Customer Email', type: 'email', key: 'customerEmail', placeholder: 'customer@email.com' },
        ].map(f => (
          <div key={f.key}>
            <label style={{ fontFamily: 'var(--font-sans)', fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: 6 }}>{f.label}</label>
            <input type={f.type} required placeholder={f.placeholder} value={(form as any)[f.key]} onChange={e => set(f.key, e.target.value)}
              style={{ width: '100%', padding: '11px 14px', border: '1px solid rgba(201,169,110,0.35)', borderRadius: 8, fontFamily: 'var(--font-sans)', fontSize: '0.88rem', background: 'var(--ivory)', outline: 'none', boxSizing: 'border-box' as const }} />
          </div>
        ))}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ fontFamily: 'var(--font-sans)', fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Court</label>
            <select required value={form.courtId} onChange={e => set('courtId', e.target.value)}
              style={{ width: '100%', padding: '11px 14px', border: '1px solid rgba(201,169,110,0.35)', borderRadius: 8, fontFamily: 'var(--font-sans)', fontSize: '0.88rem', background: 'var(--ivory)', outline: 'none' }}>
              <option value="">Select court…</option>
              {courts.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontFamily: 'var(--font-sans)', fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Date</label>
            <select value={form.date} onChange={e => { set('date', e.target.value); set('slot', null) }}
              style={{ width: '100%', padding: '11px 14px', border: '1px solid rgba(201,169,110,0.35)', borderRadius: 8, fontFamily: 'var(--font-sans)', fontSize: '0.88rem', background: 'var(--ivory)', outline: 'none' }}>
              {dates.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label style={{ fontFamily: 'var(--font-sans)', fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: 6 }}>
            Time Slot {form.courtId && form.date ? `(${availableSlots.length} available)` : ''}
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {availableSlots.map((s: any) => (
              <button key={s.start} type="button" onClick={() => set('slot', s)} style={{
                padding: '8px 14px', borderRadius: 8, border: form.slot?.start === s.start ? '2px solid var(--forest)' : '1px solid rgba(201,169,110,0.35)',
                background: form.slot?.start === s.start ? 'var(--forest)' : 'var(--ivory)',
                color: form.slot?.start === s.start ? 'var(--gold-light)' : 'var(--charcoal)',
                fontFamily: 'var(--font-sans)', fontSize: '0.82rem', cursor: 'pointer',
              }}>
                {s.start ? new Date(s.start).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : ''} · {s.price} AZN
              </button>
            ))}
            {form.courtId && form.date && slots.length > 0 && availableSlots.length === 0 && (
              <p style={{ fontFamily: 'var(--font-serif)', color: 'var(--muted)', fontStyle: 'italic', fontSize: '0.88rem' }}>No slots available on this date.</p>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ fontFamily: 'var(--font-sans)', fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Type</label>
            <select value={form.bookingType} onChange={e => set('bookingType', e.target.value)}
              style={{ width: '100%', padding: '11px 14px', border: '1px solid rgba(201,169,110,0.35)', borderRadius: 8, fontFamily: 'var(--font-sans)', fontSize: '0.88rem', background: 'var(--ivory)', outline: 'none' }}>
              <option value="single">Single Court</option>
              <option value="coach_training">Coach Training</option>
              <option value="membership_session">Membership Session</option>
            </select>
          </div>
        </div>

        <div>
          <label style={{ fontFamily: 'var(--font-sans)', fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Notes (optional)</label>
          <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3}
            style={{ width: '100%', padding: '11px 14px', border: '1px solid rgba(201,169,110,0.35)', borderRadius: 8, fontFamily: 'var(--font-sans)', fontSize: '0.88rem', background: 'var(--ivory)', outline: 'none', resize: 'vertical', boxSizing: 'border-box' as const }} />
        </div>

        <div style={{ padding: '1rem', background: 'rgba(201,169,110,0.06)', border: '1px solid rgba(201,169,110,0.2)', borderRadius: 8 }}>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', color: 'var(--muted)', margin: 0 }}>
            This will create a <strong style={{ color: 'var(--forest)' }}>confirmed</strong> booking with <strong style={{ color: 'var(--forest)' }}>cash payment</strong> — no Stripe charge. The customer will receive a confirmation email.
          </p>
        </div>

        <button type="submit" disabled={loading} style={{
          padding: '13px', background: loading ? 'var(--sage)' : 'var(--forest)',
          color: 'var(--gold-light)', border: 'none', borderRadius: 8,
          fontFamily: 'var(--font-sans)', fontSize: '0.85rem', letterSpacing: '0.03em',
          cursor: loading ? 'wait' : 'pointer',
        }}>
          {loading ? 'Creating Booking…' : 'Create Booking'}
        </button>
      </form>
    </div>
  )
}
