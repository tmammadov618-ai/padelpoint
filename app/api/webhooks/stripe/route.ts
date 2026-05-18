import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/server'
import { sendBookingConfirmation } from '@/lib/notifications/email'
import { scheduleReminder, awardLoyaltyPoints } from '@/lib/notifications/scheduler'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig  = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 })
  }

  const supabase = await createAdminClient()

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object as Stripe.PaymentIntent
    const { bookingId } = intent.metadata

    await supabase.from('payments')
      .update({ status: 'succeeded', stripe_charge_id: intent.latest_charge as string })
      .eq('stripe_payment_intent', intent.id)

    await supabase.from('bookings')
      .update({ status: 'confirmed' })
      .eq('id', bookingId)

    await awardLoyaltyPoints(bookingId)

    const { data: booking } = await supabase
      .from('bookings')
      .select('*, customer:profiles!customer_id(*), court:courts(*)')
      .eq('id', bookingId)
      .single()

    if (booking) {
      await sendBookingConfirmation(booking as any).catch(() => {})
      await scheduleReminder(bookingId).catch(() => {})
    }
  }

  if (event.type === 'payment_intent.payment_failed') {
    const intent = event.data.object as Stripe.PaymentIntent
    await supabase.from('payments')
      .update({ status: 'failed' })
      .eq('stripe_payment_intent', intent.id)
  }

  return NextResponse.json({ received: true })
}
