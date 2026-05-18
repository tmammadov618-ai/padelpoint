import { NextRequest, NextResponse } from 'next/server'
import { getAvailableSlots } from '@/lib/booking/availability'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const courtId = searchParams.get('courtId')
  const dateStr = searchParams.get('date')
  
  if (!courtId || !dateStr) {
    return NextResponse.json({ slots: [] })
  }

  try {
    const date = new Date(dateStr + 'T00:00:00')
    const slots = await getAvailableSlots(courtId, date)
    return NextResponse.json({ slots })
  } catch (err) {
    console.error('Availability error:', err)
    return NextResponse.json({ slots: [] })
  }
}
