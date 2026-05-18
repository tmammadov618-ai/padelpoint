import { createAdminClient } from '@/lib/supabase/server'

export async function scheduleReminder(bookingId: string) {
  // Reminder is handled by the cron job at /api/cron/reminders
  // Just log that this booking should get a reminder
  console.log('Reminder scheduled for booking:', bookingId)
}

export async function awardLoyaltyPoints(bookingId: string) {
  try {
    const supabase = await createAdminClient()
    const { data: booking } = await supabase
      .from('bookings')
      .select('customer_id, final_price_azn')
      .eq('id', bookingId)
      .single()

    if (booking) {
      const points = Math.floor(Number(booking.final_price_azn))
      await supabase.from('loyalty_points').insert({
        customer_id: booking.customer_id,
        points,
        reason: 'Booking completed',
        booking_id: bookingId,
      })
    }
  } catch (err) {
    console.error('Loyalty points error:', err)
  }
}
