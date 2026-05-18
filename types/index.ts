// types/index.ts — Auto-generated from Supabase schema + manual extensions

export type UserRole = 'admin' | 'manager' | 'coach' | 'customer'
export type BookingStatus = 'pending_payment' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
export type BookingType = 'single' | 'membership_session' | 'coach_training'
export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded'
export type MembershipStatus = 'active' | 'expired' | 'cancelled' | 'paused'
export type ProductCategory = 'racket_rental' | 'balls' | 'shop' | 'cafe'
export type DayType = 'weekday' | 'weekend' | 'holiday'

// ─── Database Row Types ──────────────────────────────────────────────────────

export interface Profile {
  id: string
  role: UserRole
  full_name: string
  phone: string | null
  email: string
  avatar_url: string | null
  language: 'az' | 'ru' | 'en'
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Court {
  id: string
  name: string
  description: string | null
  is_active: boolean
  image_url: string | null
  sort_order: number
  created_at: string
}

export interface PricingRule {
  id: string
  name: string
  day_type: DayType
  time_from: string   // "HH:MM"
  time_to: string
  price_azn: number
  is_active: boolean
}

export interface Booking {
  id: string
  customer_id: string
  court_id: string
  booking_type: BookingType
  coach_id: string | null
  starts_at: string
  ends_at: string
  duration_min: number
  price_azn: number
  discount_azn: number
  final_price_azn: number
  status: BookingStatus
  promo_code_id: string | null
  notes: string | null
  cancelled_at: string | null
  cancel_reason: string | null
  created_at: string
  updated_at: string
  // Joined
  court?: Court
  customer?: Profile
  coach?: Profile
  payment?: Payment
  order_items?: OrderItem[]
}

export interface Payment {
  id: string
  booking_id: string
  customer_id: string
  amount_azn: number
  currency: string
  status: PaymentStatus
  method: 'stripe' | 'cash' | 'transfer'
  stripe_payment_intent: string | null
  stripe_charge_id: string | null
  refund_amount_azn: number
  refunded_at: string | null
  created_at: string
}

export interface MembershipPlan {
  id: string
  name: string
  sessions_count: number
  duration_days: number
  price_azn: number
  discount_pct: number
  benefits: string[]
  is_active: boolean
}

export interface CustomerMembership {
  id: string
  customer_id: string
  plan_id: string
  status: MembershipStatus
  starts_at: string
  expires_at: string
  sessions_used: number
  sessions_total: number
  stripe_sub_id: string | null
  created_at: string
  // Joined
  plan?: MembershipPlan
  customer?: Profile
}

export interface CoachAvailability {
  id: string
  coach_id: string
  day_of_week: number  // 0=Sun … 6=Sat
  time_from: string
  time_to: string
  is_active: boolean
}

export interface CoachBlockedTime {
  id: string
  coach_id: string
  blocked_from: string
  blocked_to: string
  reason: string | null
}

export interface PromoCode {
  id: string
  code: string
  description: string | null
  discount_type: 'percentage' | 'fixed_amount'
  discount_value: number
  max_uses: number | null
  used_count: number
  min_booking_azn: number
  valid_from: string
  valid_to: string | null
  is_active: boolean
}

export interface Product {
  id: string
  name: string
  category: ProductCategory
  price_azn: number
  stock_qty: number | null
  image_url: string | null
  is_active: boolean
}

export interface OrderItem {
  id: string
  booking_id: string | null
  product_id: string
  customer_id: string | null
  quantity: number
  unit_price: number
  total_price: number
  sold_at: string
  product?: Product
}

export interface LoyaltyPoint {
  id: string
  customer_id: string
  points: number
  reason: string | null
  booking_id: string | null
  created_at: string
}

export interface Notification {
  id: string
  customer_id: string
  booking_id: string | null
  type: string
  channel: string
  subject: string | null
  body: string | null
  sent_at: string | null
  delivered: boolean
  error_msg: string | null
}

// ─── App-level Types ─────────────────────────────────────────────────────────

export interface TimeSlot {
  start: string       // ISO datetime
  end: string
  available: boolean
  price: number
}

export interface PriceBreakdown {
  basePrice: number
  discount: number
  finalPrice: number
  rule: PricingRule | null
  promoApplied?: PromoCode
}

export interface BookingCartItem {
  productId: string
  quantity: number
  unitPrice: number
  name: string
}

export interface CreateBookingPayload {
  courtId: string
  startsAt: string
  endsAt: string
  bookingType: BookingType
  coachId?: string
  promoCode?: string
  notes?: string
  extras?: BookingCartItem[]
}

export interface AnalyticsOverview {
  revenueToday: number
  revenueWeek: number
  revenueMonth: number
  bookingsToday: number
  bookingsWeek: number
  occupancyAvg: number
  activeCustomers: number
  newCustomersMonth: number
}

export interface DailyRevenue {
  day: string
  revenue: number
  bookings_count: number
  unique_customers: number
}

export interface PeakHour {
  hour: number
  day_of_week: number
  bookings: number
}

// Cart item used on booking page
export interface BookingCartItem {
  productId: string
  quantity: number
  unitPrice: number
  name: string
}
