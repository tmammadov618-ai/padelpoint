import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isSlotAvailable } from '@/lib/booking/availability'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Daxil olun' }, { status: 401 })
  }

  const body = await req.json()
  const { courtId, startsAt, endsAt, bookingType = 'single', promoCode, extras } = body

  if (!courtId || !startsAt || !endsAt) {
    return NextResponse.json({ error: 'Məlumatlar çatışmır' }, { status: 400 })
  }

  // Check availability
  const available = await isSlotAvailable(courtId, startsAt, endsAt)
  if (!available) {
    return NextResponse.json({ error: 'Bu vaxt artıq tutulub. Başqa vaxt seçin.' }, { status: 409 })
  }

  // Get pricing
  const start = new Date(startsAt)
  const isWeekend = [0, 6].includes(start.getDay())
  const hour = start.getHours()
  
  let priceAzn = 80
  if (!isWeekend && hour < 18) priceAzn = 60
  
  let discountAzn = 0
  let promoCodeId = null

  // Validate promo code
  if (promoCode) {
    const { data: promo } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', promoCode.toUpperCase())
      .eq('is_active', true)
      .single()
    
    if (promo) {
      const now = new Date()
      const validFrom = new Date(promo.valid_from)
      const validTo = promo.valid_to ? new Date(promo.valid_to) : null
      
      if (now >= validFrom && (!validTo || now <= validTo)) {
        if (!promo.max_uses || promo.used_count < promo.max_uses) {
          if (priceAzn >= promo.min_booking_azn) {
            discountAzn = promo.discount_type === 'percentage'
              ? Math.round(priceAzn * promo.discount_value / 100)
              : Math.min(promo.discount_value, priceAzn)
            promoCodeId = promo.id
          }
        }
      }
    }
  }

  // Create booking
  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({
      customer_id: user.id,
      court_id: courtId,
      booking_type: bookingType,
      starts_at: startsAt,
      ends_at: endsAt,
      duration_min: 90,
      price_azn: priceAzn,
      discount_azn: discountAzn,
      status: 'pending_payment',
      promo_code_id: promoCodeId,
    })
    .select()
    .single()

  if (error || !booking) {
    console.error('Booking create error:', error)
    return NextResponse.json({ error: 'Rezervasiya yaradıla bilmədi' }, { status: 500 })
  }

  // Add extras as order items
  if (extras && extras.length > 0) {
    await supabase.from('order_items').insert(
      extras.map((e: any) => ({
        booking_id: booking.id,
        product_id: e.productId,
        customer_id: user.id,
        quantity: e.quantity,
        unit_price: e.unitPrice,
      }))
    )
  }

  // Update promo usage
  if (promoCodeId) {
    await supabase.rpc('increment_promo_usage', { promo_id: promoCodeId })
  }

  return NextResponse.json({ bookingId: booking.id })
}
