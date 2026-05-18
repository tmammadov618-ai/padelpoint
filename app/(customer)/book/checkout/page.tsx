// app/(customer)/book/checkout/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { format, parseISO } from 'date-fns'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface PendingBooking {
  courtId: string
  startsAt: string
  endsAt: string
  promoCode?: string
  extras?: Array<{ productId: string; quantity: number; unitPrice: number; name: string }>
}

function CheckoutForm({ clientSecret, bookingId }: { clientSecret: string; bookingId: string }) {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return

    setProcessing(true)
    setError(null)

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/my-bookings?confirmed=${bookingId}`,
      },
    })

    if (stripeError) {
      setError(stripeError.message ?? 'Payment failed')
      setProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div className="section-title">Payment Details</div>
        <div style={{
          border: '1px solid var(--border)', padding: '1.5rem',
          background: 'var(--ivory)', borderRadius: '1px',
        }}>
          <PaymentElement options={{ layout: 'tabs' }} />
        </div>
      </div>

      {error && (
        <div style={{
          background: '#FDEDEC', border: '1px solid #F1948A', padding: '0.75rem 1rem',
          color: '#943126', fontSize: '0.85rem', marginBottom: '1rem', borderRadius: '1px',
        }}>
          {error}
        </div>
      )}

      <button type="submit" disabled={!stripe || processing} className="btn btn-primary btn-lg" style={{ width: '100%' }}>
        {processing ? 'Processing Payment…' : 'Pay Now & Confirm Booking'}
      </button>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>🔒 Secured by Stripe</span>
      </div>
    </form>
  )
}

export default function CheckoutPage() {
  const [booking, setBooking]           = useState<PendingBooking | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [bookingId, setBookingId]       = useState<string | null>(null)
  const [totalAZN, setTotalAZN]         = useState<number | null>(null)
  const [error, setError]               = useState<string | null>(null)
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    const raw = sessionStorage.getItem('pendingBooking')
    if (!raw) { setError('No booking found. Please start again.'); setLoading(false); return }

    const pendingBooking: PendingBooking = JSON.parse(raw)
    setBooking(pendingBooking)
    createBookingAndPayment(pendingBooking)
  }, [])

  async function createBookingAndPayment(pendingBooking: PendingBooking) {
    try {
      // 1. Create the booking
      const bookingRes = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pendingBooking),
      })
      if (!bookingRes.ok) throw new Error('Failed to create booking')
      const { bookingId: newBookingId } = await bookingRes.json()
      setBookingId(newBookingId)

      // 2. Create Stripe PaymentIntent
      const paymentRes = await fetch('/api/bookings/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: newBookingId }),
      })
      if (!paymentRes.ok) throw new Error('Failed to initialize payment')
      const { clientSecret: secret, amountAZN } = await paymentRes.json()
      setClientSecret(secret)
      if (amountAZN) setTotalAZN(amountAZN)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream)' }}>
      <div style={{ textAlign: 'center', color: 'var(--muted)' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--forest)', marginBottom: '0.5rem' }}>Preparing your booking…</div>
        <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>This will only take a moment</p>
      </div>
    </div>
  )

  if (error) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream)' }}>
      <div className="card" style={{ maxWidth: 400, textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>
        <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--forest)' }}>Something went wrong</h3>
        <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>{error}</p>
        <a href="/book" className="btn btn-primary">Try Again</a>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', padding: '3rem 1.5rem' }}>
      <div className="container" style={{ maxWidth: 900 }}>
        <a href="/book" style={{ color: 'var(--muted)', fontSize: '0.8rem', textDecoration: 'none', display: 'inline-block', marginBottom: '2rem' }}>
          ← Back
        </a>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '2rem', alignItems: 'start' }}>
          {/* Payment Form */}
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--forest)', marginBottom: '0.5rem' }}>
              Complete Your Booking
            </h2>
            <p style={{ color: 'var(--muted)', fontFamily: 'var(--font-serif)', fontStyle: 'italic', marginBottom: '2rem' }}>
              Your court will be reserved immediately upon payment
            </p>

            {clientSecret && bookingId && (
              <Elements stripe={stripePromise} options={{
                clientSecret,
                appearance: {
                  theme: 'stripe',
                  variables: {
                    colorPrimary: '#1C3A2E',
                    colorBackground: '#FDFAF5',
                    colorText: '#1A1A1A',
                    colorDanger: '#A93226',
                    fontFamily: 'Jost, sans-serif',
                    borderRadius: '1px',
                  },
                },
              }}>
                <CheckoutForm clientSecret={clientSecret} bookingId={bookingId} />
              </Elements>
            )}
          </div>

          {/* Order Summary */}
          {booking && (
            <div className="card card-luxury" style={{ padding: '2rem' }}>
              <div style={{ fontFamily: 'var(--font-display)', color: 'var(--forest)', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
                Order Summary
              </div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>Court session</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--charcoal)', marginBottom: '0.25rem' }}>
                  {format(parseISO(booking.startsAt), 'EEEE, MMMM d')}
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--charcoal)' }}>
                  {format(parseISO(booking.startsAt), 'HH:mm')} – {format(parseISO(booking.endsAt), 'HH:mm')}
                </div>
              </div>

              {booking.extras && booking.extras.length > 0 && (
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '1rem' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Extras</div>
                  {booking.extras.map(e => (
                    <div key={e.productId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '0.2rem 0' }}>
                      <span>{e.name}</span>
                      <span>{e.unitPrice} AZN</span>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ borderTop: '1px solid var(--gold-light)', marginTop: '1rem', paddingTop: '1rem' }}>
                <div style={{ fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '0.25rem' }}>
                  Total due
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', color: 'var(--forest)' }}>
                  {totalAZN !== null ? totalAZN.toFixed(2) + " AZN" : "…"}
                </div>
              </div>

              <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--gold-pale)', border: '1px solid var(--gold-light)' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--muted)', margin: 0, lineHeight: 1.5 }}>
                  ✓ Instant confirmation<br />
                  ✓ Email receipt sent automatically<br />
                  ✓ Reminder 1 hour before
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
