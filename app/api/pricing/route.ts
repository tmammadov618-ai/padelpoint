import { NextRequest, NextResponse } from 'next/server'
import { calculatePrice } from '@/lib/booking/pricing'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { startsAt, endsAt, promoCode } = body
  if (!startsAt || !endsAt) {
    return NextResponse.json({ error: 'startsAt and endsAt required' }, { status: 400 })
  }
  try {
    const breakdown = await calculatePrice(startsAt, endsAt, promoCode)
    return NextResponse.json(breakdown)
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'Failed to calculate price' }, { status: 500 })
  }
}
