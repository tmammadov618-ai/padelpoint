// Admin-only endpoint: create confirmed booking with cash payment
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { calculatePrice } from '@/lib/booking/pricing'
import { isSlotAvailable } from '@/lib/booking/availability'
import { sendBookingConfirmation } from '@/lib/notifications/email'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!['admin', 'manager'].includes(adminProfile?.role ?? '')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { courtId, startsAt, endsAt, bookingType, coachId, customerEmail, notes, paymentMethod } = await req.json()

  // Find customer by email
  const adminClient = await createAdminClient()
  const { data: customer } = await adminClient
    .from('profiles')
    .select('id, full_name, email, phone')
    .eq('email', customerEmail.toLowerCase().trim())
    .single()

  if (!customer) return NextResponse.json({ error: 'Customer not found. They must register first.' }, { status: 404 })

  // Check availability
  const available = await isSlotAvailable(courtId, startsAt, endsAt)
  if (!available) return NextResponse.json({ error: 'Slot not available' }, { status: 409 })

  // Calculate price
  const pricing = await calculatePrice(startsAt, endsAt)
  const durationMin = Math.round((new Date(endsAt).getTime() - new Date(startsAt).getTime()) / 60000)

  const { data: booking, error } = await adminClient.from('bookings').insert({
    customer_id: customer.id,
    court_id: courtId,
    booking_type: bookingType ?? 'single',
    coach_id: coachId ?? null,
    starts_at: startsAt,
    ends_at: endsAt,
    duration_min: durationMin,
    price_azn: pricing.basePrice,
    discount_azn: 0,
    status: 'confirmed',
    notes: notes ?? null,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Record cash payment
  await adminClient.from('payments').insert({
    booking_id: booking.id,
    customer_id: customer.id,
    amount_azn: pricing.basePrice,
    status: 'succeeded',
    method: paymentMethod ?? 'cash',
  })

  // Send confirmation email
  const fullBooking = { ...booking, customer, court: { name: 'Court' } }
  // Fetch court name
  const { data: court } = await adminClient.from('courts').select('name').eq('id', courtId).single()
  await sendBookingConfirmation({ ...fullBooking, court: court ?? { name: 'Court' } } as any).catch(() => {})

  return NextResponse.json({ booking, bookingId: booking.id })
}
