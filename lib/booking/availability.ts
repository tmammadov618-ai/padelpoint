// lib/booking/availability.ts
import { addMinutes, format, parseISO, startOfDay, endOfDay, isWithinInterval } from 'date-fns'
import { createClient } from '@/lib/supabase/server'
import type { TimeSlot } from '@/types'

const OPEN_HOUR  = 7    // 07:00
const CLOSE_HOUR = 23   // 23:00
const SLOT_DURATION = 90 // minutes

export async function getAvailableSlots(
  courtId: string,
  date: Date,
  durationMin: number = SLOT_DURATION
): Promise<TimeSlot[]> {
  const supabase = await createClient()
  const dayStart = startOfDay(date)
  const dayEnd   = endOfDay(date)

  // Fetch confirmed/pending bookings for this court & date
  const { data: existing } = await supabase
    .from('bookings')
    .select('starts_at, ends_at')
    .eq('court_id', courtId)
    .gte('starts_at', dayStart.toISOString())
    .lte('starts_at', dayEnd.toISOString())
    .not('status', 'in', '("cancelled")')

  // Fetch pricing rules for price preview
  const isWeekend = [0, 6].includes(date.getDay())
  const { data: rules } = await supabase
    .from('pricing_rules')
    .select('*')
    .eq('day_type', isWeekend ? 'weekend' : 'weekday')
    .eq('is_active', true)

  const slots: TimeSlot[] = []
  let current = new Date(date)
  current.setHours(OPEN_HOUR, 0, 0, 0)

  const closeTime = new Date(date)
  closeTime.setHours(CLOSE_HOUR, 0, 0, 0)

  while (addMinutes(current, durationMin) <= closeTime) {
    const slotEnd = addMinutes(current, durationMin)
    const isOccupied = existing?.some(b => rangesOverlap(
      current, slotEnd,
      parseISO(b.starts_at), parseISO(b.ends_at)
    )) ?? false

    // Find price for this slot's start time
    const slotHour = current.getHours()
    const slotTimeStr = format(current, 'HH:mm')
    const rule = rules?.find(r =>
      slotTimeStr >= r.time_from && slotTimeStr < r.time_to
    )

    slots.push({
      start: current.toISOString(),
      end: slotEnd.toISOString(),
      available: !isOccupied,
      price: rule?.price_azn ?? 80,
    })

    current = addMinutes(current, 30) // 30-min increments between slots
  }

  return slots
}

function rangesOverlap(s1: Date, e1: Date, s2: Date, e2: Date): boolean {
  return s1 < e2 && e1 > s2
}

export async function isSlotAvailable(
  courtId: string,
  startsAt: string,
  endsAt: string,
  excludeBookingId?: string
): Promise<boolean> {
  const supabase = await createClient()
  let query = supabase
    .from('bookings')
    .select('id')
    .eq('court_id', courtId)
    .not('status', 'in', '("cancelled")')
    .or(`starts_at.lt.${endsAt},ends_at.gt.${startsAt}`)

  if (excludeBookingId) {
    query = query.neq('id', excludeBookingId)
  }

  const { data } = await query
  return !data || data.length === 0
}

export async function getCourtAvailabilityForWeek(
  courtId: string,
  weekStart: Date
): Promise<Record<string, TimeSlot[]>> {
  const result: Record<string, TimeSlot[]> = {}
  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart)
    day.setDate(weekStart.getDate() + i)
    const key = format(day, 'yyyy-MM-dd')
    result[key] = await getAvailableSlots(courtId, day)
  }
  return result
}
