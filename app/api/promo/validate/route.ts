import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const { code, bookingAmount } = await req.json()
  if (!code) return NextResponse.json({ error: 'Code required' }, { status: 400 })

  const supabase = await createClient()
  const { data: promo } = await supabase
    .from('promo_codes')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .single()

  if (!promo) return NextResponse.json({ valid: false, error: 'Invalid promo code' })

  const now = new Date()
  if (promo.valid_to && new Date(promo.valid_to) < now)
    return NextResponse.json({ valid: false, error: 'Promo code has expired' })
  if (new Date(promo.valid_from) > now)
    return NextResponse.json({ valid: false, error: 'Promo code is not yet active' })
  if (promo.max_uses && promo.used_count >= promo.max_uses)
    return NextResponse.json({ valid: false, error: 'Promo code usage limit reached' })
  if (bookingAmount < promo.min_booking_azn)
    return NextResponse.json({ valid: false, error: `Minimum booking amount: ${promo.min_booking_azn} AZN` })

  const discount = promo.discount_type === 'percentage'
    ? (bookingAmount * promo.discount_value) / 100
    : promo.discount_value

  return NextResponse.json({ valid: true, promo, discount: Math.min(discount, bookingAmount) })
}
