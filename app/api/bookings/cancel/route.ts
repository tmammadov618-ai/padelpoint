import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { sendBookingCancellation } from '@/lib/notifications/email'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let bookingId: string
  const ct = req.headers.get('content-type') ?? ''
  if (ct.includes('application/json')) {
    const body = await req.json()
    bookingId = body.bookingId
  } else {
    const fd = await req.formData()
    bookingId = fd.get('bookingId') as string
  }

  if (!bookingId) return NextResponse.json({ error: 'bookingId required' }, { status: 400 })

  const adminSupabase = await createAdminClient()

  const { data: booking } = await adminSupabase
    .from('bookings')
    .select('*, customer:profiles!customer_id(*), court:courts(*)')
    .eq('id', bookingId)
    .single()

  if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Check user owns this booking or is admin
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = ['admin', 'manager'].includes(profile?.role ?? '')
  if (booking.customer_id !== user.id && !isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await adminSupabase.from('bookings').update({ status: 'cancelled' }).eq('id', bookingId)
  await sendBookingCancellation(booking).catch(() => {})

  const referer = req.headers.get('referer') ?? '/my-bookings'
  return NextResponse.redirect(new URL(referer, req.url))
}
