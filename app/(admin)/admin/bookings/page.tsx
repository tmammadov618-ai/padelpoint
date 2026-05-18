import { createClient } from '@/lib/supabase/server'
import { formatAZN } from '@/lib/utils'
import Link from 'next/link'

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: { status?: string; date?: string; court?: string }
}) {
  const supabase = await createClient()

  let query = supabase
    .from('bookings')
    .select('*, customer:profiles!customer_id(full_name, email, phone), court:courts(name)')
    .order('starts_at', { ascending: false })
    .limit(100)

  if (searchParams.status) query = query.eq('status', searchParams.status)
  if (searchParams.date)   query = query.gte('starts_at', `${searchParams.date}T00:00:00`).lte('starts_at', `${searchParams.date}T23:59:59`)
  if (searchParams.court)  query = query.eq('court_id', searchParams.court)

  const { data: bookings } = await query
  const { data: courts }   = await supabase.from('courts').select('id, name')

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--forest)' }}>Bookings</h1>
        <Link href="/admin/bookings/new" className="btn btn-primary" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '0.6rem 1.25rem', background: 'var(--forest)', color: 'var(--gold-light)',
          fontFamily: 'var(--font-sans)', fontSize: '0.8rem', borderRadius: 8, textDecoration: 'none',
          border: '1px solid rgba(201,169,110,0.3)',
        }}>
          + New Booking
        </Link>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[
          { label: 'All', href: '/admin/bookings' },
          { label: 'Confirmed',       href: '/admin/bookings?status=confirmed' },
          { label: 'Pending Payment', href: '/admin/bookings?status=pending_payment' },
          { label: 'Cancelled',       href: '/admin/bookings?status=cancelled' },
          { label: 'Completed',       href: '/admin/bookings?status=completed' },
        ].map(f => (
          <Link key={f.label} href={f.href} style={{
            fontFamily: 'var(--font-sans)', fontSize: '0.78rem', padding: '6px 14px',
            borderRadius: 20, border: '1px solid rgba(201,169,110,0.3)',
            background: searchParams.status === f.href.split('status=')[1] ? 'var(--forest)' : 'transparent',
            color: searchParams.status === f.href.split('status=')[1] ? 'var(--gold-light)' : 'var(--muted)',
            textDecoration: 'none', transition: 'all 0.15s',
          }}>{f.label}</Link>
        ))}
      </div>

      <div style={{ background: 'var(--ivory)', border: '1px solid rgba(201,169,110,0.3)', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(248,244,237,0.8)' }}>
              {['Customer', 'Court', 'Date & Time', 'Duration', 'Amount', 'Type', 'Status', ''].map(h => (
                <th key={h} style={{ fontFamily: 'var(--font-sans)', fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', padding: '12px 14px', textAlign: 'left', borderBottom: '1px solid rgba(201,169,110,0.2)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bookings?.map(b => (
              <tr key={b.id} style={{ transition: 'background 0.1s' }}>
                <td style={{ padding: '13px 14px', borderBottom: '1px solid rgba(201,169,110,0.1)', fontFamily: 'var(--font-sans)', fontSize: '0.83rem' }}>
                  <div>{(b.customer as any)?.full_name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--muted-light)' }}>{(b.customer as any)?.phone ?? (b.customer as any)?.email}</div>
                </td>
                <td style={{ padding: '13px 14px', borderBottom: '1px solid rgba(201,169,110,0.1)', fontFamily: 'var(--font-sans)', fontSize: '0.83rem', color: 'var(--muted)' }}>{(b.court as any)?.name}</td>
                <td style={{ padding: '13px 14px', borderBottom: '1px solid rgba(201,169,110,0.1)', fontFamily: 'var(--font-sans)', fontSize: '0.8rem' }}>
                  <div>{new Date(b.starts_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                  <div style={{ color: 'var(--muted-light)', fontSize: '0.72rem' }}>
                    {new Date(b.starts_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} – {new Date(b.ends_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </td>
                <td style={{ padding: '13px 14px', borderBottom: '1px solid rgba(201,169,110,0.1)', fontFamily: 'var(--font-sans)', fontSize: '0.8rem', color: 'var(--muted)' }}>{b.duration_min} min</td>
                <td style={{ padding: '13px 14px', borderBottom: '1px solid rgba(201,169,110,0.1)', fontFamily: 'var(--font-sans)', fontSize: '0.83rem', fontWeight: 500, color: 'var(--forest)' }}>{formatAZN(Number(b.final_price_azn))}</td>
                <td style={{ padding: '13px 14px', borderBottom: '1px solid rgba(201,169,110,0.1)' }}>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.68rem', padding: '2px 8px', borderRadius: 20, background: b.booking_type === 'coach_training' ? 'rgba(180,83,9,0.08)' : 'rgba(74,124,89,0.08)', color: b.booking_type === 'coach_training' ? '#B45309' : 'var(--sage)', textTransform: 'capitalize' }}>
                    {b.booking_type.replace('_', ' ')}
                  </span>
                </td>
                <td style={{ padding: '13px 14px', borderBottom: '1px solid rgba(201,169,110,0.1)' }}>
                  <span style={{
                    fontFamily: 'var(--font-sans)', fontSize: '0.68rem', padding: '3px 10px', borderRadius: 20, textTransform: 'capitalize',
                    background: b.status === 'confirmed' ? 'rgba(74,124,89,0.1)' : b.status === 'pending_payment' ? 'rgba(180,83,9,0.1)' : b.status === 'cancelled' ? 'rgba(220,38,38,0.08)' : 'rgba(107,97,82,0.08)',
                    color: b.status === 'confirmed' ? 'var(--sage)' : b.status === 'pending_payment' ? '#B45309' : b.status === 'cancelled' ? '#DC2626' : 'var(--muted)',
                  }}>
                    {b.status.replace('_', ' ')}
                  </span>
                </td>
                <td style={{ padding: '13px 14px', borderBottom: '1px solid rgba(201,169,110,0.1)' }}>
                  <Link href={`/admin/bookings/${b.id}`} style={{ fontFamily: 'var(--font-sans)', fontSize: '0.72rem', color: 'var(--gold-dark)', textDecoration: 'none' }}>View →</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!bookings?.length && (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
            No bookings found for the selected filters.
          </div>
        )}
      </div>
    </div>
  )
}
