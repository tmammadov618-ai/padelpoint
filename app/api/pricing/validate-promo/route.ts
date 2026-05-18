import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const { code, bookingPrice } = await req.json()
  if (!code) return NextResponse.json({ valid: false, error: 'Kod daxil edin' })

  const supabase = await createClient()
  const { data: promo } = await supabase
    .from('promo_codes')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .single()

  if (!promo) return NextResponse.json({ valid: false, error: 'Yanlış promo kod' })
  
  const now = new Date()
  if (promo.valid_to && now > new Date(promo.valid_to)) {
    return NextResponse.json({ valid: false, error: 'Promo kodun müddəti bitib' })
  }
  if (promo.max_uses && promo.used_count >= promo.max_uses) {
    return NextResponse.json({ valid: false, error: 'Promo kod limitə çatıb' })
  }
  if (bookingPrice < promo.min_booking_azn) {
    return NextResponse.json({ valid: false, error: `Minimum sifariş ${promo.min_booking_azn} AZN olmalıdır` })
  }

  const discount = promo.discount_type === 'percentage'
    ? Math.round(bookingPrice * promo.discount_value / 100)
    : Math.min(promo.discount_value, bookingPrice)

  return NextResponse.json({ valid: true, discount, code: promo.code })
}
