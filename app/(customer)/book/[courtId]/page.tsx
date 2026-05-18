'use client'
import { useState, useEffect, useTransition } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { format, addDays, parseISO } from 'date-fns'
import type { TimeSlot, BookingCartItem, Product } from '@/types'

export default function CourtBookingPage() {
  const { courtId } = useParams<{ courtId: string }>()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [court, setCourt] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [promoCode, setPromoCode] = useState('')
  const [promoResult, setPromoResult] = useState<any>(null)
  const [extras, setExtras] = useState<BookingCartItem[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const dates = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i))
  const DAY_NAMES = ['B', 'B.e', 'Ç.a', 'Ç', 'C.a', 'C', 'Ş']

  useEffect(() => { fetchCourt(); fetchProducts() }, [courtId])
  useEffect(() => { if (courtId) fetchSlots() }, [courtId, selectedDate])

  async function fetchCourt() {
    const res = await fetch(`/api/courts/${courtId}`)
    const data = await res.json()
    setCourt(data); setLoading(false)
  }
  async function fetchSlots() {
    setSlots([])
    const res = await fetch(`/api/availability?courtId=${courtId}&date=${format(selectedDate, 'yyyy-MM-dd')}`)
    const data = await res.json()
    setSlots(data.slots ?? [])
  }
  async function fetchProducts() {
    const res = await fetch('/api/products?categories=racket_rental,balls')
    const data = await res.json()
    setProducts(data.products ?? [])
  }
  async function validatePromo() {
    if (!promoCode.trim() || !selectedSlot) return
    const res = await fetch('/api/pricing/validate-promo', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: promoCode, bookingPrice: selectedSlot.price }),
    })
    setPromoResult(await res.json())
  }
  function toggleExtra(product: Product) {
    setExtras(prev => {
      const exists = prev.find(e => e.productId === product.id)
      if (exists) return prev.filter(e => e.productId !== product.id)
      return [...prev, { productId: product.id, quantity: 1, unitPrice: product.price_azn, name: product.name }]
    })
  }
  function totalPrice() {
    if (!selectedSlot) return 0
    const discount = promoResult?.discount ?? 0
    const extrasTotal = extras.reduce((s, e) => s + e.unitPrice * e.quantity, 0)
    return Math.max(0, selectedSlot.price - discount) + extrasTotal
  }

  async function proceedToCheckout() {
    if (!selectedSlot) return
    startTransition(async () => {
      const bookingRes = await fetch('/api/bookings/create', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courtId, startsAt: selectedSlot.start, endsAt: selectedSlot.end,
          bookingType: 'single', promoCode: promoResult?.valid ? promoCode : undefined,
          extras: extras.map(e => ({ productId: e.productId, quantity: e.quantity, unitPrice: e.unitPrice })),
        }),
      })
      if (!bookingRes.ok) { const d = await bookingRes.json(); alert(d.error ?? 'Xəta baş verdi'); return }
      const { bookingId } = await bookingRes.json()

      const payRes = await fetch('/api/bookings/create-payment', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
      })
      if (!payRes.ok) { alert('Ödəniş başlatıla bilmədi'); return }
      const { clientSecret } = await payRes.json()

      sessionStorage.setItem('pendingBooking', JSON.stringify({
        bookingId, clientSecret, courtName: court?.name,
        date: format(selectedDate, 'dd MMMM yyyy'),
        time: `${format(parseISO(selectedSlot.start), 'HH:mm')} – ${format(parseISO(selectedSlot.end), 'HH:mm')}`,
        total: totalPrice(),
      }))
      router.push('/book/checkout')
    })
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#F5F5F3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 36, height: 36, border: '3px solid #E8E8E5', borderTopColor: '#C8E63C', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 12px' }} />
        <p style={{ color: '#888', fontSize: 13 }}>Yüklənir…</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const availableSlots = slots.filter(s => s.available)
  const takenSlots = slots.filter(s => !s.available)

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F3' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>

        {/* Back */}
        <a href="/book" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#888', fontSize: 13, fontWeight: 600, textDecoration: 'none', marginBottom: 24 }}>
          ← Kortlara qayıt
        </a>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>

          {/* LEFT */}
          <div>
            {/* Court header */}
            <div style={{ background: 'white', border: '1px solid #E8E8E5', borderRadius: 12, overflow: 'hidden', marginBottom: 20 }}>
              <div style={{ height: 180, background: '#111', position: 'relative', overflow: 'hidden' }}>
                <img src="https://images.pexels.com/photos/32474981/pexels-photo-32474981.jpeg?auto=compress&cs=tinysrgb&w=800" alt={court?.name} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)' }} />
                <div style={{ position: 'absolute', bottom: 16, left: 20 }}>
                  <p style={{ fontSize: 22, fontWeight: 900, color: 'white', margin: 0 }}>{court?.name ?? 'Kort'}</p>
                </div>
              </div>
              <div style={{ padding: '14px 20px', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {['Premium turf', 'LED işıqlandırma', 'Şüşə divarlar', '10m × 20m'].map(f => (
                  <span key={f} style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', background: '#F5F5F3', border: '1px solid #E8E8E5', borderRadius: 20, color: '#666' }}>{f}</span>
                ))}
              </div>
            </div>

            {/* Date picker */}
            <div style={{ background: 'white', border: '1px solid #E8E8E5', borderRadius: 12, padding: '20px', marginBottom: 20 }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: '#888', textTransform: 'uppercase', marginBottom: 14 }}>Tarix seçin</p>
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                {dates.map(d => {
                  const selected = format(d, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
                  return (
                    <button key={d.toISOString()} onClick={() => { setSelectedDate(d); setSelectedSlot(null) }} style={{
                      minWidth: 58, padding: '10px 6px', textAlign: 'center', border: selected ? '2px solid #1A1A1A' : '1px solid #E8E8E5',
                      borderRadius: 8, background: selected ? '#1A1A1A' : 'white', cursor: 'pointer', flexShrink: 0,
                    }}>
                      <p style={{ fontSize: 10, fontWeight: 700, color: selected ? '#C8E63C' : '#888', letterSpacing: '0.06em', marginBottom: 4 }}>{DAY_NAMES[d.getDay()]}</p>
                      <p style={{ fontSize: 18, fontWeight: 900, color: selected ? 'white' : '#1A1A1A', lineHeight: 1, marginBottom: 3 }}>{format(d, 'd')}</p>
                      <p style={{ fontSize: 10, color: selected ? 'rgba(255,255,255,0.5)' : '#888' }}>{format(d, 'MMM')}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Time slots */}
            <div style={{ background: 'white', border: '1px solid #E8E8E5', borderRadius: 12, padding: '20px', marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: '#888', textTransform: 'uppercase' }}>
                  Vaxt seçin · {format(selectedDate, 'dd MMMM')}
                </p>
                <span style={{ fontSize: 11, color: '#888' }}>{availableSlots.length} mövcuddur</span>
              </div>

              {slots.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px', color: '#888' }}>
                  <div style={{ width: 24, height: 24, border: '2px solid #E8E8E5', borderTopColor: '#C8E63C', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 8px' }} />
                  <p style={{ fontSize: 13 }}>Yüklənir…</p>
                  <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {slots.map(slot => {
                    const isSelected = selectedSlot?.start === slot.start
                    const time = format(parseISO(slot.start), 'HH:mm')
                    return (
                      <button key={slot.start} onClick={() => slot.available && setSelectedSlot(isSelected ? null : slot)}
                        disabled={!slot.available}
                        style={{
                          padding: '10px 6px', borderRadius: 8, textAlign: 'center',
                          border: isSelected ? '2px solid #1A1A1A' : '1px solid #E8E8E5',
                          background: isSelected ? '#1A1A1A' : slot.available ? 'white' : '#F5F5F3',
                          cursor: slot.available ? 'pointer' : 'not-allowed',
                          opacity: slot.available ? 1 : 0.5,
                        }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: isSelected ? '#C8E63C' : slot.available ? '#1A1A1A' : '#BBB', marginBottom: 3, textDecoration: !slot.available ? 'line-through' : 'none' }}>
                          {time}
                        </p>
                        <p style={{ fontSize: 10, fontWeight: 600, color: isSelected ? '#C8E63C' : '#888' }}>
                          {slot.available ? `${slot.price} AZN` : 'Tutulub'}
                        </p>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Extras */}
            {products.length > 0 && (
              <div style={{ background: 'white', border: '1px solid #E8E8E5', borderRadius: 12, padding: '20px' }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: '#888', textTransform: 'uppercase', marginBottom: 14 }}>Əlavələr (isteğe bağlı)</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
                  {products.map(p => {
                    const added = extras.some(e => e.productId === p.id)
                    return (
                      <button key={p.id} onClick={() => toggleExtra(p)} style={{
                        padding: '12px', borderRadius: 8, textAlign: 'center', cursor: 'pointer',
                        border: added ? '2px solid #C8E63C' : '1px solid #E8E8E5',
                        background: added ? 'rgba(200,230,60,0.08)' : 'white',
                      }}>
                        <p style={{ fontSize: 12, fontWeight: 700, color: '#1A1A1A', marginBottom: 3 }}>{p.name}</p>
                        <p style={{ fontSize: 11, color: '#888' }}>{p.price_azn} AZN</p>
                        {added && <p style={{ fontSize: 10, color: '#6B8A00', fontWeight: 700, marginTop: 4 }}>✓ Əlavə edildi</p>}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Summary */}
          <div style={{ position: 'sticky', top: 80 }}>
            <div style={{ background: 'white', border: '1px solid #E8E8E5', borderRadius: 12, padding: '20px' }}>
              <p style={{ fontSize: 14, fontWeight: 800, color: '#1A1A1A', marginBottom: 16 }}>Rezervasiya xülasəsi</p>

              {selectedSlot ? (
                <>
                  <div style={{ borderTop: '1px solid #F0F0EE', paddingTop: 14, marginBottom: 14 }}>
                    {[
                      ['Kort', court?.name],
                      ['Tarix', format(selectedDate, 'dd MMM yyyy')],
                      ['Vaxt', `${format(parseISO(selectedSlot.start), 'HH:mm')} – ${format(parseISO(selectedSlot.end), 'HH:mm')}`],
                      ['Müddət', '90 dəqiqə'],
                    ].map(([l, v]) => (
                      <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 13 }}>
                        <span style={{ color: '#888' }}>{l}</span>
                        <span style={{ fontWeight: 600, color: '#1A1A1A' }}>{v}</span>
                      </div>
                    ))}
                  </div>

                  {/* Promo */}
                  <div style={{ marginBottom: 16 }}>
                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: '#888', textTransform: 'uppercase', marginBottom: 6 }}>Promo kod</p>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <input value={promoCode} onChange={e => setPromoCode(e.target.value.toUpperCase())}
                        placeholder="KOD DAXİL ET"
                        style={{ flex: 1, padding: '8px 10px', border: '1px solid #E8E8E5', borderRadius: 6, fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', outline: 'none', background: '#FAFAFA' }} />
                      <button onClick={validatePromo} style={{ padding: '8px 12px', background: '#1A1A1A', color: '#C8E63C', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                        Tətbiq
                      </button>
                    </div>
                    {promoResult && (
                      <p style={{ fontSize: 11, marginTop: 4, fontWeight: 600, color: promoResult.valid ? '#6B8A00' : '#DC2626' }}>
                        {promoResult.valid ? `✓ Endirim: -${promoResult.discount} AZN` : promoResult.error}
                      </p>
                    )}
                  </div>

                  {extras.length > 0 && (
                    <div style={{ borderTop: '1px solid #F0F0EE', paddingTop: 10, marginBottom: 10 }}>
                      {extras.map(e => (
                        <div key={e.productId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '3px 0' }}>
                          <span style={{ color: '#888' }}>{e.name}</span>
                          <span style={{ fontWeight: 600 }}>{e.unitPrice} AZN</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ borderTop: '2px solid #C8E63C', paddingTop: 12, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Cəmi</span>
                    <span style={{ fontSize: 28, fontWeight: 900, color: '#1A1A1A' }}>{totalPrice()} <span style={{ fontSize: 14, fontWeight: 400, color: '#888' }}>AZN</span></span>
                  </div>

                  <button onClick={proceedToCheckout} disabled={isPending} style={{
                    width: '100%', padding: '13px', background: isPending ? '#888' : '#1A1A1A', color: '#C8E63C',
                    border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 800, cursor: isPending ? 'wait' : 'pointer',
                    letterSpacing: '0.04em',
                  }}>
                    {isPending ? 'Hazırlanır…' : 'Ödənişə keçin →'}
                  </button>
                  <p style={{ fontSize: 11, color: '#888', textAlign: 'center', marginTop: 8 }}>
                    Yalnız ödənişdən sonra təsdiqlənir
                  </p>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '32px 0', color: '#888' }}>
                  <div style={{ fontSize: 32, marginBottom: 10 }}>🎾</div>
                  <p style={{ fontSize: 13, lineHeight: 1.5 }}>Rezervasiyanı görmək üçün vaxt slotu seçin</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
