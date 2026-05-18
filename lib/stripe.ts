import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
  typescript: true,
})

export async function getOrCreateStripeCustomer(profile: {
  id: string
  email: string
  full_name: string
  phone?: string | null
}) {
  const existing = await stripe.customers.search({
    query: `metadata['supabase_id']:'${profile.id}'`,
    limit: 1,
  })
  if (existing.data.length > 0) return existing.data[0].id

  const customer = await stripe.customers.create({
    email: profile.email,
    name: profile.full_name,
    phone: profile.phone ?? undefined,
    metadata: { supabase_id: profile.id },
  })
  return customer.id
}
