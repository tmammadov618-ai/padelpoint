// app/(customer)/bookings/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { format, parseISO, isPast, isFuture } from 'date-fns'
import type { Booking } from '@/types'

export default async function MyBookingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, court:courts(*), payment:payments(status, amount_azn)')
    .eq('customer_id', user.id)
    .order('starts_at', { ascending: false })

  const upcoming = bookings?.filter(b => isFuture(parseISO(b.starts_at)) && b.status === 'confirmed') ?? []
  const past = bookings?.filter(b => isPast(parseISO(b.starts_at)) || ['completed', 'cancelled'].includes(b.status)) ?? []

  function StatusBadge({ status }: { status: string }) {
    const classes: Record<string, string> = {
      confirmed: 'badge-confirmed', pending_payment: 'badge-pending',
      cancelled: 'badge-cancelled', completed: 'badge-completed',
    }
    return <span className={`badge ${classes[status] ?? 'badge-pending'}`}>{status.replace('_', ' ')}</span>
  }

  function BookingCard({ b }: { b: any }) {
    const start = parseISO(b.starts_at)
    const end = parseISO(b.ends_at)
    return (
      <div className="card" style={{ marginBottom: '1rem', padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--forest)', fontSize: '1.1rem', margin: 0 }}>
                {b.court?.name}
              </h3>
              <StatusBadge status={b.status} />
            </div>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                📅 {format(start, 'EEEE, MMMM d, yyyy')}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                ⏰ {format(start, 'HH:mm')} – {format(end, 'HH:mm')}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                ⏱ {b.duration_min} min
              </span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--forest)' }}>
              {b.final_price_azn} AZN
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              #{b.id.slice(0, 8).toUpperCase()}
            </div>
          </div>
        </div>

        {/* Actions */}
        {b.status === 'confirmed' && isFuture(start) && (
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.75rem' }}>
            <form action="/api/bookings/cancel" method="POST">
              <input type="hidden" name="bookingId" value={b.id} />
              <button type="submit" className="btn btn-ghost btn-sm"
                style={{ color: '#A93226', borderColor: '#F1948A' }}
                onClick={e => !confirm('Cancel this booking?') && e.preventDefault()}>
                Cancel Booking
              </button>
            </form>
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      <div className="container" style={{ paddingTop: '3rem', paddingBottom: '3rem', maxWidth: 800 }}>
        <div style={{ marginBottom: '3rem' }}>
          <div className="section-title">My Account</div>
          <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--forest)' }}>My Bookings</h1>
        </div>

        {/* Upcoming */}
        <div style={{ marginBottom: '3rem' }}>
          <div className="section-title">Upcoming Sessions</div>
          {upcoming.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--muted)', marginBottom: '1.5rem' }}>
                No upcoming sessions scheduled
              </p>
              <a href="/book" className="btn btn-primary">Reserve a Court</a>
            </div>
          ) : (
            upcoming.map(b => <BookingCard key={b.id} b={b} />)
          )}
        </div>

        {/* Past */}
        {past.length > 0 && (
          <div>
            <div className="section-title">Past Sessions</div>
            {past.map(b => <BookingCard key={b.id} b={b} />)}
          </div>
        )}
      </div>
    </div>
  )
}
