import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendBookingReminder } from '@/lib/notifications/email'

export async function GET(req: NextRequest) {
  const supabase = await createAdminClient()
  const now = new Date()
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000)
  const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000)

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, customer:profiles!customer_id(*), court:courts(*)')
    .eq('status', 'confirmed')
    .gte('starts_at', oneHourLater.toISOString())
    .lte('starts_at', twoHoursLater.toISOString())

  if (bookings) {
    for (const booking of bookings) {
      await sendBookingReminder(booking).catch(() => {})
    }
  }

  return NextResponse.json({ sent: bookings?.length ?? 0 })
}
