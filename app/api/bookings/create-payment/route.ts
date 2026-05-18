import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { bookingId } = await req.json()
  if (!bookingId) return NextResponse.json({ error: 'bookingId required' }, { status: 400 })

  const { data: booking } = await supabase
    .from('bookings')
    .select('*, order_items(unit_price, quantity)')
    .eq('id', bookingId)
    .eq('customer_id', user.id)
    .single()

  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

  // Calculate total
  const extrasTotal = (booking.order_items ?? []).reduce(
    (s: number, i: any) => s + Number(i.unit_price) * i.quantity, 0
  )
  const totalAzn = Math.max(0, Number(booking.final_price_azn)) + extrasTotal
  const amountCents = Math.round(totalAzn * 100)

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountCents,
    currency: 'azn',
    metadata: { bookingId },
  })

  await supabase.from('payments').insert({
    booking_id: bookingId,
    customer_id: user.id,
    amount_azn: totalAzn,
    status: 'pending',
    method: 'stripe',
    stripe_payment_intent: paymentIntent.id,
  })

  return NextResponse.json({ clientSecret: paymentIntent.client_secret })
}
