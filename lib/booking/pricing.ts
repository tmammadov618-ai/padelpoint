// lib/booking/pricing.ts
import { format, parseISO } from 'date-fns'
import { createClient } from '@/lib/supabase/server'
import type { PriceBreakdown, PricingRule, PromoCode } from '@/types'

export async function calculatePrice(
  startsAt: string,
  endsAt: string,
  promoCode?: string
): Promise<PriceBreakdown> {
  const supabase = await createClient()
  const start = parseISO(startsAt)
  const isWeekend = [0, 6].includes(start.getDay())
  const timeStr = format(start, 'HH:mm')

  // Find matching pricing rule
  const { data: rules } = await supabase
    .from('pricing_rules')
    .select('*')
    .eq('is_active', true)
    .eq('day_type', isWeekend ? 'weekend' : 'weekday')

  const rule = rules?.find(r => timeStr >= r.time_from && timeStr < r.time_to) ?? null
  const basePrice = rule?.price_azn ?? 80

  // Validate and apply promo code
  let discount = 0
  let promoApplied: PromoCode | undefined

  if (promoCode) {
    const { data: promo } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', promoCode.toUpperCase().trim())
      .eq('is_active', true)
      .single()

    if (promo && isPromoValid(promo, basePrice)) {
      discount = promo.discount_type === 'percentage'
        ? Math.round(basePrice * (promo.discount_value / 100) * 100) / 100
        : Math.min(promo.discount_value, basePrice)
      promoApplied = promo
    }
  }

  return {
    basePrice,
    discount,
    finalPrice: Math.max(0, basePrice - discount),
    rule,
    promoApplied,
  }
}

function isPromoValid(promo: PromoCode, bookingPrice: number): boolean {
  const now = new Date()
  if (promo.valid_to && new Date(promo.valid_to) < now) return false
  if (new Date(promo.valid_from) > now) return false
  if (promo.max_uses !== null && promo.used_count >= promo.max_uses) return false
  if (bookingPrice < promo.min_booking_azn) return false
  return true
}

export async function validatePromoCode(
  code: string,
  bookingPrice: number
): Promise<{ valid: boolean; promo?: PromoCode; error?: string }> {
  const supabase = await createClient()
  const { data: promo } = await supabase
    .from('promo_codes')
    .select('*')
    .eq('code', code.toUpperCase().trim())
    .single()

  if (!promo) return { valid: false, error: 'Promo code not found' }
  if (!promo.is_active) return { valid: false, error: 'Promo code is inactive' }

  const now = new Date()
  if (promo.valid_to && new Date(promo.valid_to) < now)
    return { valid: false, error: 'Promo code has expired' }
  if (promo.max_uses !== null && promo.used_count >= promo.max_uses)
    return { valid: false, error: 'Promo code has reached its usage limit' }
  if (bookingPrice < promo.min_booking_azn)
    return { valid: false, error: `Minimum booking amount: ${promo.min_booking_azn} AZN` }

  return { valid: true, promo }
}

export async function incrementPromoUsage(promoId: string): Promise<void> {
  const supabase = await createClient()
  await supabase.rpc('increment_promo_usage', { promo_id: promoId })
}

export function getPriceLabel(dayType: string, timeFrom: string): string {
  if (dayType === 'weekend') return 'Weekend'
  const hour = parseInt(timeFrom.split(':')[0])
  return hour < 18 ? 'Weekday morning' : 'Weekday evening'
}
